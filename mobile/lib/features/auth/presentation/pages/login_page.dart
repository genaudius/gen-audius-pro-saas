// ─────────────────────────────────────────────────────────────────────────────
// Login Page — Dark Luxury, animated, production-ready
// ─────────────────────────────────────────────────────────────────────────────

import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/theme/app_theme.dart';
import '../../../../core/router/app_router.dart';
import '../../../../shared/widgets/ga_button.dart';
import '../../../../shared/widgets/ga_text_field.dart';
import '../../../../shared/widgets/ga_logo.dart';
import '../data/auth_repository.dart';

class LoginPage extends ConsumerStatefulWidget {
  const LoginPage({super.key});

  @override
  ConsumerState<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends ConsumerState<LoginPage> {
  final _emailCtrl    = TextEditingController();
  final _passwordCtrl = TextEditingController();
  final _totpCtrl     = TextEditingController();
  final _formKey      = GlobalKey<FormState>();

  bool _showTotp     = false;
  bool _obscurePass  = true;
  bool _isLoading    = false;

  @override
  void dispose() {
    _emailCtrl.dispose();
    _passwordCtrl.dispose();
    _totpCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isLoading = true);

    await ref.read(authProvider.notifier).login(
      email:    _emailCtrl.text.trim(),
      password: _passwordCtrl.text,
      totpCode: _showTotp ? _totpCtrl.text : null,
    );

    if (!mounted) return;
    setState(() => _isLoading = false);

    final state = ref.read(authProvider);
    if (state is AuthError) {
      if (state.message.contains('2FA') || state.message.contains('TOTP')) {
        setState(() => _showTotp = true);
      } else {
        _showError(state.message);
      }
    } else if (state is AuthAuthenticated) {
      context.go(Routes.dashboard);
    }
  }

  void _showError(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(children: [
          const Icon(Icons.error_outline, color: GAColors.error, size: 18),
          const SizedBox(width: 8),
          Expanded(child: Text(msg, style: const TextStyle(color: GAColors.textPrimary))),
        ]),
        backgroundColor: GAColors.bgCard,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: GARadius.mdBR,
          side: const BorderSide(color: GAColors.error),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(gradient: GAColors.gradientBg),
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: GASpacing.lg),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const SizedBox(height: GASpacing.xxxl),

                  // ── Logo ──────────────────────────────────────────────────
                  const GALogo(size: 56)
                    .animate()
                    .fadeIn(duration: 600.ms)
                    .scale(begin: const Offset(0.8, 0.8)),

                  const SizedBox(height: GASpacing.xl),

                  // ── Headline ──────────────────────────────────────────────
                  Text(
                    'Welcome back',
                    style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                      color: GAColors.textPrimary,
                      fontWeight: FontWeight.w700,
                    ),
                    textAlign: TextAlign.center,
                  ).animate().fadeIn(delay: 100.ms).slideY(begin: 0.2),

                  const SizedBox(height: GASpacing.sm),
                  Text(
                    'Sign in to Gen Audius Pro',
                    style: Theme.of(context).textTheme.bodyMedium,
                    textAlign: TextAlign.center,
                  ).animate().fadeIn(delay: 150.ms),

                  const SizedBox(height: GASpacing.xl),

                  // ── Email ──────────────────────────────────────────────────
                  GATextField(
                    controller: _emailCtrl,
                    label: 'Email',
                    hint: 'you@example.com',
                    keyboardType: TextInputType.emailAddress,
                    prefixIcon: Icons.email_outlined,
                    validator: (v) {
                      if (v == null || v.isEmpty) return 'Email required';
                      if (!v.contains('@')) return 'Enter a valid email';
                      return null;
                    },
                  ).animate().fadeIn(delay: 200.ms).slideY(begin: 0.2),

                  const SizedBox(height: GASpacing.md),

                  // ── Password ──────────────────────────────────────────────
                  GATextField(
                    controller: _passwordCtrl,
                    label: 'Password',
                    hint: '••••••••',
                    obscureText: _obscurePass,
                    prefixIcon: Icons.lock_outline,
                    suffixIcon: _obscurePass ? Icons.visibility_outlined : Icons.visibility_off_outlined,
                    onSuffixTap: () => setState(() => _obscurePass = !_obscurePass),
                    validator: (v) => (v == null || v.isEmpty) ? 'Password required' : null,
                  ).animate().fadeIn(delay: 250.ms).slideY(begin: 0.2),

                  // ── 2FA Code (shown after 401 with 2FA message) ───────────
                  if (_showTotp) ...[
                    const SizedBox(height: GASpacing.md),
                    GATextField(
                      controller: _totpCtrl,
                      label: '2FA Code',
                      hint: '000000',
                      keyboardType: TextInputType.number,
                      prefixIcon: Icons.security_outlined,
                      maxLength: 6,
                      validator: (v) => (v == null || v.length != 6) ? 'Enter 6-digit code' : null,
                    ).animate().fadeIn().slideY(begin: -0.2),
                    const SizedBox(height: GASpacing.sm),
                    Text(
                      'Enter the 6-digit code from your authenticator app',
                      style: Theme.of(context).textTheme.bodySmall,
                      textAlign: TextAlign.center,
                    ),
                  ],

                  const SizedBox(height: GASpacing.sm),

                  // ── Forgot password ────────────────────────────────────────
                  Align(
                    alignment: Alignment.centerRight,
                    child: TextButton(
                      onPressed: () {/* TODO: forgot password */},
                      child: const Text('Forgot password?'),
                    ),
                  ).animate().fadeIn(delay: 300.ms),

                  const SizedBox(height: GASpacing.lg),

                  // ── Submit ────────────────────────────────────────────────
                  GAButton(
                    label: 'Sign In',
                    onPressed: _isLoading ? null : _submit,
                    isLoading: _isLoading,
                    icon: Icons.login_outlined,
                  ).animate().fadeIn(delay: 350.ms).slideY(begin: 0.2),

                  const SizedBox(height: GASpacing.lg),

                  // ── Divider ───────────────────────────────────────────────
                  Row(children: [
                    const Expanded(child: Divider(color: GAColors.borderDim)),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: GASpacing.md),
                      child: Text('or', style: Theme.of(context).textTheme.bodySmall),
                    ),
                    const Expanded(child: Divider(color: GAColors.borderDim)),
                  ]).animate().fadeIn(delay: 400.ms),

                  const SizedBox(height: GASpacing.lg),

                  // ── Register ──────────────────────────────────────────────
                  OutlinedButton(
                    onPressed: () => context.go(Routes.register),
                    child: const Text('Create Account'),
                  ).animate().fadeIn(delay: 450.ms),

                  const SizedBox(height: GASpacing.xxl),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
