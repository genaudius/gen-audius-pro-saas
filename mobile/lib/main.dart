// ─────────────────────────────────────────────────────────────────────────────
// Gen Audius Pro — Flutter App Entry Point
// ─────────────────────────────────────────────────────────────────────────────

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_core/firebase_core.dart';

import 'core/theme/app_theme.dart';
import 'core/router/app_router.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Lock to portrait (can be unlocked per screen for Studio/DAW)
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  // Dark status bar to match the dark luxury theme
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.light,
    systemNavigationBarColor: Color(0xFF061224),
    systemNavigationBarIconBrightness: Brightness.light,
  ));

  // Firebase init (push notifications + analytics)
  await Firebase.initializeApp();

  runApp(
    const ProviderScope(
      child: GenAudiusApp(),
    ),
  );
}

class GenAudiusApp extends ConsumerWidget {
  const GenAudiusApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);

    return MaterialApp.router(
      title: 'Gen Audius Pro',
      debugShowCheckedModeBanner: false,
      theme: GATheme.dark,
      darkTheme: GATheme.dark,
      themeMode: ThemeMode.dark,  // Always dark — no light mode in V1
      routerConfig: router,

      builder: (context, child) {
        // Global error boundary + font scaling cap
        return MediaQuery(
          data: MediaQuery.of(context).copyWith(
            textScaler: TextScaler.linear(
              MediaQuery.of(context).textScaleFactor.clamp(0.8, 1.2),
            ),
          ),
          child: child ?? const SizedBox(),
        );
      },
    );
  }
}
