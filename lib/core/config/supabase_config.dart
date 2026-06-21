import 'package:flutter_dotenv/flutter_dotenv.dart';

class SupabaseConfig {
  const SupabaseConfig._();

  static String get url => dotenv.env['SUPABASE_URL'] ?? '';
  static String get anonKey => dotenv.env['SUPABASE_ANON_KEY'] ?? '';
  static String get apiBaseUrl => dotenv.env['TOKEA_API_BASE_URL'] ?? 'https://tokeaevents.co.ke';
}
