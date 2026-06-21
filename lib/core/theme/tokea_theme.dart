import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class TokeaColors {
  const TokeaColors._();

  static const gold = Color(0xFFD4AF37);
  static const pink = Color(0xFFFF2D7A);
  static const black = Color(0xFF0B0B0B);
  static const surface = Color(0xFF151515);
  static const white = Color(0xFFFFFFFF);
}

class TokeaTheme {
  const TokeaTheme._();

  static ThemeData get dark {
    final textTheme = GoogleFonts.interTextTheme(ThemeData.dark().textTheme);

    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: TokeaColors.black,
      colorScheme: const ColorScheme.dark(
        primary: TokeaColors.gold,
        secondary: TokeaColors.pink,
        surface: TokeaColors.surface,
        onPrimary: TokeaColors.black,
        onSecondary: TokeaColors.white,
        onSurface: TokeaColors.white,
      ),
      textTheme: textTheme,
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: TokeaColors.surface,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(18),
          borderSide: BorderSide.none,
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(18),
          borderSide: const BorderSide(color: TokeaColors.gold),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: TokeaColors.gold,
          foregroundColor: TokeaColors.black,
          minimumSize: const Size.fromHeight(54),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(18),
          ),
          textStyle: const TextStyle(fontWeight: FontWeight.w800),
        ),
      ),
    );
  }
}
