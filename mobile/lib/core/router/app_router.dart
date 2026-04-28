// ─────────────────────────────────────────────────────────────────────────────
// App Router — GoRouter with auth guards and deep linking.
// ─────────────────────────────────────────────────────────────────────────────

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../storage/secure_storage.dart';
import '../../features/auth/presentation/pages/login_page.dart';
import '../../features/auth/presentation/pages/register_page.dart';
import '../../features/auth/presentation/pages/verify_email_page.dart';
import '../../features/dashboard/presentation/pages/dashboard_page.dart';
import '../../features/studio/presentation/pages/studio_page.dart';
import '../../features/chatgau/presentation/pages/chatgau_page.dart';
import '../../features/wallet/presentation/pages/wallet_page.dart';
import '../../features/profile/presentation/pages/profile_page.dart';
import '../../shared/widgets/main_scaffold.dart';

// ── Route names ───────────────────────────────────────────────────────────────
class Routes {
  static const splash     = '/';
  static const login      = '/login';
  static const register   = '/register';
  static const verify     = '/verify';
  static const dashboard  = '/dashboard';
  static const studio     = '/studio';
  static const chatgau    = '/chat';
  static const wallet     = '/wallet';
  static const profile    = '/profile';
  static const jobDetail  = '/studio/job/:jobId';
}

// ── Router provider ───────────────────────────────────────────────────────────
final routerProvider = Provider<GoRouter>((ref) {
  final storage = ref.watch(secureStorageProvider);

  return GoRouter(
    initialLocation: Routes.splash,
    debugLogDiagnostics: true,
    redirect: (context, state) async {
      final isLoggedIn  = await storage.isLoggedIn();
      final isAuthRoute = state.matchedLocation == Routes.login ||
                          state.matchedLocation == Routes.register;
      final isSplash    = state.matchedLocation == Routes.splash;

      if (isSplash) {
        return isLoggedIn ? Routes.dashboard : Routes.login;
      }
      if (!isLoggedIn && !isAuthRoute) return Routes.login;
      if (isLoggedIn && isAuthRoute)  return Routes.dashboard;
      return null;
    },
    routes: [
      GoRoute(path: Routes.splash, builder: (_, __) => const _SplashScreen()),
      GoRoute(path: Routes.login,    builder: (_, __) => const LoginPage()),
      GoRoute(path: Routes.register, builder: (_, __) => const RegisterPage()),
      GoRoute(path: Routes.verify,   builder: (_, __) => const VerifyEmailPage()),

      // ── Shell route with bottom navigation ──────────────────────────────
      StatefulShellRoute.indexedStack(
        builder: (context, state, shell) => MainScaffold(shell: shell),
        branches: [
          StatefulShellBranch(routes: [
            GoRoute(path: Routes.dashboard, builder: (_, __) => const DashboardPage()),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(
              path: Routes.studio,
              builder: (_, __) => const StudioPage(),
              routes: [
                GoRoute(
                  path: 'job/:jobId',
                  builder: (_, state) => JobDetailPage(jobId: state.pathParameters['jobId']!),
                ),
              ],
            ),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(path: Routes.chatgau, builder: (_, __) => const ChatGAUPage()),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(path: Routes.wallet, builder: (_, __) => const WalletPage()),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(path: Routes.profile, builder: (_, __) => const ProfilePage()),
          ]),
        ],
      ),
    ],
    errorBuilder: (context, state) => _ErrorPage(error: state.error),
  );
});

// ── Splash screen ─────────────────────────────────────────────────────────────
class _SplashScreen extends StatelessWidget {
  const _SplashScreen();

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      backgroundColor: Color(0xFF030816),
      body: Center(
        child: CircularProgressIndicator(color: Color(0xFF00E5FF)),
      ),
    );
  }
}

class _ErrorPage extends StatelessWidget {
  final Exception? error;
  const _ErrorPage({this.error});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(child: Text('Page not found: $error')),
    );
  }
}

// Placeholder for job detail — implemented in Sprint 2
class JobDetailPage extends StatelessWidget {
  final String jobId;
  const JobDetailPage({super.key, required this.jobId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Job $jobId')),
      body: const Center(child: Text('Job detail — Sprint 2')),
    );
  }
}
