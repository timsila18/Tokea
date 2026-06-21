import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/app_role.dart';

class AuthService {
  AuthService(this._supabase);

  final SupabaseClient _supabase;

  Future<void> signUp({
    required String fullName,
    required String phoneNumber,
    required String password,
    required AppRole role,
    String? organizationName,
    String? businessName,
  }) async {
    final authResponse = await _supabase.auth.signUp(
      phone: phoneNumber,
      password: password,
      data: {
        'full_name': fullName,
        'role': role.value,
      },
    );

    final user = authResponse.user;
    if (user == null) {
      throw const AuthException('Unable to create account.');
    }

    await _supabase.from('users').insert({
      'id': user.id,
      'phone_number': phoneNumber,
      'role': role.value,
    });

    await _supabase.from('profiles').insert({
      'id': user.id,
      'full_name': fullName,
      'phone_number': phoneNumber,
      'role': role.value,
    });

    if (role == AppRole.organizer && organizationName != null) {
      await _supabase.from('organizer_profiles').insert({
        'profile_id': user.id,
        'organization_name': organizationName,
      });
    }

    if (role == AppRole.vendor && businessName != null) {
      await _supabase.from('vendors').insert({
        'profile_id': user.id,
        'business_name': businessName,
      });
    }

    if (role == AppRole.eventStaff) {
      await _supabase.from('staff_profiles').insert({'profile_id': user.id});
    }

    await _supabase.auth.signOut();
  }

  Future<void> signIn({
    required String phoneNumber,
    required String password,
  }) async {
    await _supabase.auth.signInWithPassword(
      phone: phoneNumber,
      password: password,
    );
  }

  Future<void> signOut() => _supabase.auth.signOut();
}
