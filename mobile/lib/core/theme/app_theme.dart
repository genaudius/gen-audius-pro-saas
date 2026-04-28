// ─────────────────────────────────────────────────────────────────────────────
// Gen Audius Pro — Dark Luxury Design System
// Single source of truth for all visual tokens.
// Never hardcode colors or typography anywhere else.
// ─────────────────────────────────────────────────────────────────────────────

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

// ── Color Tokens ──────────────────────────────────────────────────────────────
class GAColors {
  GAColors._();

  // Brand
  static const neon        = Color(0xFF00E5FF);
  static const neonHover   = Color(0xFF00CCEE);
  static const neonDim     = Color(0x2600E5FF);
  static const gold        = Color(0xFFD4AF37);
  static const goldHover   = Color(0xFFC09A20);
  static const goldDim     = Color(0x26D4AF37);

  // Backgrounds
  static const bgDeep      = Color(0xFF030816);   // Main background
  static const bgSurface   = Color(0xFF0A1628);   // Cards, panels
  static const bgCard      = Color(0xFF0D1F35);   // Elevated cards
  static const bgInput     = Color(0xFF0F2238);   // Input fields
  static const bgHeader    = Color(0xFF061224);   // App bar

  // Borders
  static const borderDim   = Color(0xFF1E3A5F);
  static const borderFocus = Color(0xFF00E5FF);

  // Text
  static const textPrimary   = Color(0xFFF0F4FF);
  static const textSecondary = Color(0xFF8892A0);
  static const textDim       = Color(0xFF5A6A7A);
  static const textDisabled  = Color(0xFF3A4A5A);

  // Status
  static const success = Color(0xFF00C48C);
  static const error   = Color(0xFFFF4C4C);
  static const warning = Color(0xFFFF8C00);
  static const info    = Color(0xFF00E5FF);

  // Gradients
  static const gradientNeon = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF00E5FF), Color(0xFF0088AA)],
  );
  static const gradientGold = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFFD4AF37), Color(0xFF8B6914)],
  );
  static const gradientCard = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF0D1F35), Color(0xFF061224)],
  );
  static const gradientBg = LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: [Color(0xFF0A1628), Color(0xFF030816)],
  );
}

// ── Typography ────────────────────────────────────────────────────────────────
class GATypography {
  GATypography._();

  static TextTheme get textTheme => GoogleFonts.interTextTheme(
    const TextTheme(
      // Display
      displayLarge:  TextStyle(fontSize: 57, fontWeight: FontWeight.w700, color: GAColors.textPrimary, letterSpacing: -1.5),
      displayMedium: TextStyle(fontSize: 45, fontWeight: FontWeight.w700, color: GAColors.textPrimary, letterSpacing: -0.5),
      displaySmall:  TextStyle(fontSize: 36, fontWeight: FontWeight.w700, color: GAColors.textPrimary),

      // Headline
      headlineLarge:  TextStyle(fontSize: 32, fontWeight: FontWeight.w700, color: GAColors.textPrimary),
      headlineMedium: TextStyle(fontSize: 28, fontWeight: FontWeight.w600, color: GAColors.textPrimary),
      headlineSmall:  TextStyle(fontSize: 24, fontWeight: FontWeight.w600, color: GAColors.textPrimary),

      // Title
      titleLarge:  TextStyle(fontSize: 22, fontWeight: FontWeight.w600, color: GAColors.textPrimary),
      titleMedium: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: GAColors.textPrimary, letterSpacing: 0.15),
      titleSmall:  TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: GAColors.textPrimary, letterSpacing: 0.1),

      // Body
      bodyLarge:   TextStyle(fontSize: 16, fontWeight: FontWeight.w400, color: GAColors.textPrimary, letterSpacing: 0.5),
      bodyMedium:  TextStyle(fontSize: 14, fontWeight: FontWeight.w400, color: GAColors.textSecondary, letterSpacing: 0.25),
      bodySmall:   TextStyle(fontSize: 12, fontWeight: FontWeight.w400, color: GAColors.textDim, letterSpacing: 0.4),

      // Label
      labelLarge:  TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: GAColors.textPrimary, letterSpacing: 0.1),
      labelMedium: TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: GAColors.textSecondary, letterSpacing: 0.5),
      labelSmall:  TextStyle(fontSize: 11, fontWeight: FontWeight.w500, color: GAColors.textDim, letterSpacing: 0.5),
    ),
  );
}

// ── Spacing ───────────────────────────────────────────────────────────────────
class GASpacing {
  GASpacing._();
  static const double xs  = 4;
  static const double sm  = 8;
  static const double md  = 16;
  static const double lg  = 24;
  static const double xl  = 32;
  static const double xxl = 48;
  static const double xxxl= 64;
}

// ── Border Radius ─────────────────────────────────────────────────────────────
class GARadius {
  GARadius._();
  static const double sm  = 8;
  static const double md  = 12;
  static const double lg  = 16;
  static const double xl  = 24;
  static const double full= 999;

  static BorderRadius get smBR  => BorderRadius.circular(sm);
  static BorderRadius get mdBR  => BorderRadius.circular(md);
  static BorderRadius get lgBR  => BorderRadius.circular(lg);
  static BorderRadius get xlBR  => BorderRadius.circular(xl);
  static BorderRadius get fullBR=> BorderRadius.circular(full);
}

// ── Shadows ───────────────────────────────────────────────────────────────────
class GAShadows {
  GAShadows._();

  static List<BoxShadow> get neonGlow => [
    BoxShadow(color: GAColors.neon.withOpacity(0.3), blurRadius: 20, spreadRadius: -4),
    BoxShadow(color: GAColors.neon.withOpacity(0.1), blurRadius: 60, spreadRadius: 0),
  ];

  static List<BoxShadow> get neonGlowSm => [
    BoxShadow(color: GAColors.neon.withOpacity(0.4), blurRadius: 8, spreadRadius: -2),
  ];

  static List<BoxShadow> get goldGlow => [
    BoxShadow(color: GAColors.gold.withOpacity(0.3), blurRadius: 20, spreadRadius: -4),
  ];

  static List<BoxShadow> get card => [
    BoxShadow(color: Colors.black.withOpacity(0.6), blurRadius: 32, offset: const Offset(0, 4)),
  ];
}

// ── Main Theme ────────────────────────────────────────────────────────────────
class GATheme {
  GATheme._();

  static ThemeData get dark => ThemeData(
    useMaterial3: true,
    brightness: Brightness.dark,
    scaffoldBackgroundColor: GAColors.bgDeep,

    colorScheme: const ColorScheme.dark(
      brightness:     Brightness.dark,
      primary:        GAColors.neon,
      onPrimary:      GAColors.bgDeep,
      secondary:      GAColors.gold,
      onSecondary:    GAColors.bgDeep,
      surface:        GAColors.bgSurface,
      onSurface:      GAColors.textPrimary,
      error:          GAColors.error,
      onError:        GAColors.textPrimary,
      outline:        GAColors.borderDim,
      surfaceContainerHighest: GAColors.bgCard,
    ),

    textTheme: GATypography.textTheme,

    // ── AppBar ───────────────────────────────────────────────────────────────
    appBarTheme: const AppBarTheme(
      backgroundColor: GAColors.bgHeader,
      foregroundColor: GAColors.textPrimary,
      elevation: 0,
      centerTitle: false,
      titleTextStyle: TextStyle(
        color: GAColors.neon,
        fontSize: 20,
        fontWeight: FontWeight.w700,
        fontFamily: 'Inter',
      ),
      iconTheme: IconThemeData(color: GAColors.textPrimary),
    ),

    // ── Bottom Navigation ────────────────────────────────────────────────────
    navigationBarTheme: NavigationBarThemeData(
      backgroundColor: GAColors.bgHeader,
      indicatorColor: GAColors.neonDim,
      iconTheme: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.selected)) {
          return const IconThemeData(color: GAColors.neon, size: 24);
        }
        return const IconThemeData(color: GAColors.textDim, size: 24);
      }),
      labelTextStyle: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.selected)) {
          return const TextStyle(color: GAColors.neon, fontSize: 12, fontWeight: FontWeight.w600);
        }
        return const TextStyle(color: GAColors.textDim, fontSize: 12);
      }),
      elevation: 0,
      height: 72,
    ),

    // ── Cards ────────────────────────────────────────────────────────────────
    cardTheme: CardTheme(
      color: GAColors.bgCard,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: GARadius.lgBR,
        side: const BorderSide(color: GAColors.borderDim, width: 1),
      ),
      margin: EdgeInsets.zero,
    ),

    // ── Input Fields ─────────────────────────────────────────────────────────
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: GAColors.bgInput,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      border: OutlineInputBorder(
        borderRadius: GARadius.mdBR,
        borderSide: const BorderSide(color: GAColors.borderDim),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: GARadius.mdBR,
        borderSide: const BorderSide(color: GAColors.borderDim),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: GARadius.mdBR,
        borderSide: const BorderSide(color: GAColors.neon, width: 1.5),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: GARadius.mdBR,
        borderSide: const BorderSide(color: GAColors.error),
      ),
      hintStyle: const TextStyle(color: GAColors.textDim, fontSize: 14),
      labelStyle: const TextStyle(color: GAColors.textSecondary, fontSize: 14),
      errorStyle: const TextStyle(color: GAColors.error, fontSize: 12),
      prefixIconColor: GAColors.textDim,
      suffixIconColor: GAColors.textDim,
    ),

    // ── Elevated Button (Primary — Neon) ─────────────────────────────────────
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: GAColors.neon,
        foregroundColor: GAColors.bgDeep,
        elevation: 0,
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
        shape: RoundedRectangleBorder(borderRadius: GARadius.mdBR),
        textStyle: const TextStyle(
          fontSize: 15,
          fontWeight: FontWeight.w700,
          fontFamily: 'Inter',
          letterSpacing: 0.5,
        ),
      ),
    ),

    // ── Outlined Button (Secondary — Gold) ───────────────────────────────────
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: GAColors.gold,
        side: const BorderSide(color: GAColors.gold, width: 1.5),
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
        shape: RoundedRectangleBorder(borderRadius: GARadius.mdBR),
        textStyle: const TextStyle(
          fontSize: 15,
          fontWeight: FontWeight.w600,
          fontFamily: 'Inter',
        ),
      ),
    ),

    // ── Text Button ───────────────────────────────────────────────────────────
    textButtonTheme: TextButtonThemeData(
      style: TextButton.styleFrom(
        foregroundColor: GAColors.neon,
        textStyle: const TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w600,
          fontFamily: 'Inter',
        ),
      ),
    ),

    // ── Chip ─────────────────────────────────────────────────────────────────
    chipTheme: ChipThemeData(
      backgroundColor: GAColors.bgSurface,
      selectedColor: GAColors.neonDim,
      labelStyle: const TextStyle(color: GAColors.textSecondary, fontSize: 13),
      side: const BorderSide(color: GAColors.borderDim),
      shape: RoundedRectangleBorder(borderRadius: GARadius.fullBR),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
    ),

    // ── Divider ───────────────────────────────────────────────────────────────
    dividerTheme: const DividerThemeData(
      color: GAColors.borderDim,
      thickness: 1,
      space: 1,
    ),

    // ── Dialog ────────────────────────────────────────────────────────────────
    dialogTheme: DialogTheme(
      backgroundColor: GAColors.bgCard,
      shape: RoundedRectangleBorder(
        borderRadius: GARadius.xlBR,
        side: const BorderSide(color: GAColors.borderDim),
      ),
      titleTextStyle: const TextStyle(
        color: GAColors.textPrimary,
        fontSize: 20,
        fontWeight: FontWeight.w700,
        fontFamily: 'Inter',
      ),
    ),

    // ── SnackBar ──────────────────────────────────────────────────────────────
    snackBarTheme: SnackBarThemeData(
      backgroundColor: GAColors.bgCard,
      contentTextStyle: const TextStyle(color: GAColors.textPrimary, fontFamily: 'Inter'),
      shape: RoundedRectangleBorder(borderRadius: GARadius.mdBR),
      behavior: SnackBarBehavior.floating,
    ),

    // ── Switch ────────────────────────────────────────────────────────────────
    switchTheme: SwitchThemeData(
      thumbColor: WidgetStateProperty.resolveWith((s) =>
        s.contains(WidgetState.selected) ? GAColors.bgDeep : GAColors.textDim),
      trackColor: WidgetStateProperty.resolveWith((s) =>
        s.contains(WidgetState.selected) ? GAColors.neon : GAColors.bgSurface),
    ),

    // ── Progress Indicator ────────────────────────────────────────────────────
    progressIndicatorTheme: const ProgressIndicatorThemeData(
      color: GAColors.neon,
      linearTrackColor: GAColors.borderDim,
    ),
  );
}
