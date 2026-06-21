import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class OfflineCheckinQueue {
  static const _key = 'tokea_offline_checkins';

  Future<List<Map<String, dynamic>>> readAll() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_key);
    if (raw == null || raw.isEmpty) return [];
    return (jsonDecode(raw) as List).cast<Map<String, dynamic>>();
  }

  Future<void> add({
    required String scanValue,
    required String result,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    final queue = await readAll();
    queue.add({
      'offline_scan_id': DateTime.now().microsecondsSinceEpoch.toString(),
      'scan_value': scanValue,
      'result': result,
      'created_at': DateTime.now().toUtc().toIso8601String(),
    });
    await prefs.setString(_key, jsonEncode(queue));
  }

  Future<void> clear() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_key);
  }
}
