// Register, Verify, ChatGAU, Wallet, Profile pages
// Full implementation in Sprint 1-3. Structure ready.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/router/app_router.dart';
import '../../../shared/widgets/ga_widgets.dart';
import '../../auth/data/auth_repository.dart';

// ── Register Page ─────────────────────────────────────────────────────────────
class RegisterPage extends ConsumerStatefulWidget {
  const RegisterPage({super.key});
  @override ConsumerState<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends ConsumerState<RegisterPage> {
  final _emailCtrl    = TextEditingController();
  final _usernameCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  final _nameCtrl     = TextEditingController();
  final _formKey      = GlobalKey<FormState>();
  bool _loading       = false;
  bool _obscure       = true;

  @override
  void dispose() {
    _emailCtrl.dispose(); _usernameCtrl.dispose();
    _passwordCtrl.dispose(); _nameCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _loading = true);
    final ok = await ref.read(authProvider.notifier).register(
      email: _emailCtrl.text.trim(),
      username: _usernameCtrl.text.trim(),
      password: _passwordCtrl.text,
      displayName: _nameCtrl.text.trim(),
    );
    if (!mounted) return;
    setState(() => _loading = false);
    if (ok) context.go(Routes.verify);
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
                  const SizedBox(height: GASpacing.xl),
                  const GALogo(size: 48),
                  const SizedBox(height: GASpacing.xl),
                  Text('Create Account', style: Theme.of(context).textTheme.headlineMedium?.copyWith(color: GAColors.textPrimary, fontWeight: FontWeight.w700), textAlign: TextAlign.center),
                  const SizedBox(height: GASpacing.xs),
                  Text('Join the AI music revolution', style: Theme.of(context).textTheme.bodyMedium, textAlign: TextAlign.center),
                  const SizedBox(height: GASpacing.xl),
                  GATextField(controller: _nameCtrl,     label: 'Display Name',  hint: 'DJ Shadow', prefixIcon: Icons.person_outline),
                  const SizedBox(height: GASpacing.md),
                  GATextField(controller: _usernameCtrl, label: 'Username',      hint: '@djshadow',  prefixIcon: Icons.alternate_email, validator: (v) => (v == null || v.length < 3) ? 'Min 3 chars' : null),
                  const SizedBox(height: GASpacing.md),
                  GATextField(controller: _emailCtrl,    label: 'Email',         hint: 'you@example.com', keyboardType: TextInputType.emailAddress, prefixIcon: Icons.email_outlined, validator: (v) => (v == null || !v.contains('@')) ? 'Valid email required' : null),
                  const SizedBox(height: GASpacing.md),
                  GATextField(controller: _passwordCtrl, label: 'Password',      hint: '••••••••', obscureText: _obscure, prefixIcon: Icons.lock_outline, suffixIcon: _obscure ? Icons.visibility_outlined : Icons.visibility_off_outlined, onSuffixTap: () => setState(() => _obscure = !_obscure), validator: (v) => (v == null || v.length < 8) ? 'Min 8 characters' : null),
                  const SizedBox(height: GASpacing.lg),
                  GAButton(label: 'Create Account', onPressed: _loading ? null : _submit, isLoading: _loading, icon: Icons.person_add_outlined),
                  const SizedBox(height: GASpacing.md),
                  TextButton(onPressed: () => context.go(Routes.login), child: const Text('Already have an account? Sign in')),
                  const SizedBox(height: GASpacing.xl),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

// ── Verify Email Page ─────────────────────────────────────────────────────────
class VerifyEmailPage extends StatelessWidget {
  const VerifyEmailPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(gradient: GAColors.gradientBg),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(GASpacing.lg),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  padding: const EdgeInsets.all(GASpacing.xl),
                  decoration: BoxDecoration(color: GAColors.neonDim, shape: BoxShape.circle),
                  child: const Icon(Icons.mark_email_unread_outlined, color: GAColors.neon, size: 56),
                ),
                const SizedBox(height: GASpacing.xl),
                Text('Check your email', style: Theme.of(context).textTheme.headlineMedium?.copyWith(color: GAColors.textPrimary, fontWeight: FontWeight.w700), textAlign: TextAlign.center),
                const SizedBox(height: GASpacing.md),
                Text('We sent a verification link to your email. Click it to activate your account.', style: Theme.of(context).textTheme.bodyMedium, textAlign: TextAlign.center),
                const SizedBox(height: GASpacing.xxl),
                GAButton(label: 'Back to Login', onPressed: () => context.go(Routes.login), variant: GAButtonVariant.secondary),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// ── ChatGAU Page ──────────────────────────────────────────────────────────────
class ChatGAUPage extends ConsumerStatefulWidget {
  const ChatGAUPage({super.key});
  @override ConsumerState<ChatGAUPage> createState() => _ChatGAUPageState();
}

class _ChatGAUPageState extends ConsumerState<ChatGAUPage> {
  final _msgCtrl = TextEditingController();
  final _messages = <Map<String, String>>[
    {'role': 'assistant', 'content': 'Hi! I\'m ChatGAU 🎵 Your AI music assistant. How can I help you today? Try /music, /image, or just ask me anything.'},
  ];

  void _send() {
    final text = _msgCtrl.text.trim();
    if (text.isEmpty) return;
    setState(() {
      _messages.add({'role': 'user', 'content': text});
      _messages.add({'role': 'assistant', 'content': 'ChatGAU full implementation in Sprint 3. Your message: "$text"'});
    });
    _msgCtrl.clear();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Row(children: [
          Container(width: 32, height: 32, decoration: BoxDecoration(gradient: GAColors.gradientNeon, borderRadius: GARadius.fullBR), child: const Icon(Icons.auto_awesome, color: GAColors.bgDeep, size: 18)),
          const SizedBox(width: GASpacing.sm),
          const Text('ChatGAU'),
        ]),
        actions: [
          IconButton(icon: const Icon(Icons.tune, color: GAColors.textSecondary), onPressed: () {}),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(GASpacing.md),
              itemCount: _messages.length,
              itemBuilder: (_, i) {
                final msg = _messages[i];
                final isUser = msg['role'] == 'user';
                return Align(
                  alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
                  child: Container(
                    margin: const EdgeInsets.only(bottom: GASpacing.sm),
                    padding: const EdgeInsets.symmetric(horizontal: GASpacing.md, vertical: GASpacing.sm),
                    constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.78),
                    decoration: BoxDecoration(
                      gradient: isUser ? GAColors.gradientNeon : null,
                      color: isUser ? null : GAColors.bgCard,
                      borderRadius: BorderRadius.only(
                        topLeft:     const Radius.circular(16),
                        topRight:    const Radius.circular(16),
                        bottomLeft:  Radius.circular(isUser ? 16 : 4),
                        bottomRight: Radius.circular(isUser ? 4 : 16),
                      ),
                      border: isUser ? null : Border.all(color: GAColors.borderDim),
                    ),
                    child: Text(msg['content'] ?? '', style: TextStyle(color: isUser ? GAColors.bgDeep : GAColors.textPrimary, fontSize: 14)),
                  ),
                );
              },
            ),
          ),
          Container(
            padding: const EdgeInsets.all(GASpacing.md),
            decoration: const BoxDecoration(color: GAColors.bgHeader, border: Border(top: BorderSide(color: GAColors.borderDim))),
            child: Row(children: [
              Expanded(child: TextField(
                controller: _msgCtrl,
                style: const TextStyle(color: GAColors.textPrimary),
                decoration: InputDecoration(hintText: 'Ask ChatGAU or type /music...', hintStyle: const TextStyle(color: GAColors.textDim), filled: true, fillColor: GAColors.bgInput, border: OutlineInputBorder(borderRadius: GARadius.fullBR, borderSide: BorderSide.none), contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10)),
                onSubmitted: (_) => _send(),
              )),
              const SizedBox(width: GASpacing.sm),
              GestureDetector(
                onTap: _send,
                child: Container(
                  width: 44, height: 44,
                  decoration: BoxDecoration(gradient: GAColors.gradientNeon, borderRadius: GARadius.fullBR),
                  child: const Icon(Icons.send_rounded, color: GAColors.bgDeep, size: 20),
                ),
              ),
            ]),
          ),
        ],
      ),
    );
  }
}

// ── Wallet Page ───────────────────────────────────────────────────────────────
class WalletPage extends ConsumerWidget {
  const WalletPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final wallet = ref.watch(walletBalanceProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Wallet')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(GASpacing.md),
        child: Column(children: [
          wallet.when(
            data: (b) => GACard(goldBorder: true, child: Column(children: [
              const Icon(Icons.account_balance_wallet, color: GAColors.gold, size: 40),
              const SizedBox(height: GASpacing.md),
              Text('$b', style: const TextStyle(color: GAColors.gold, fontSize: 48, fontWeight: FontWeight.w800)),
              const Text('credits available', style: TextStyle(color: GAColors.textDim, fontSize: 14)),
            ]),
            ),
            loading: () => const GAShimmer(width: double.infinity, height: 140),
            error: (_, __) => const SizedBox(),
          ),
          const SizedBox(height: GASpacing.lg),
          GAButton(label: 'Buy Credits', onPressed: () {}, icon: Icons.add_circle_outline),
          const SizedBox(height: GASpacing.lg),
          Text('Credit Costs', style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: GASpacing.md),
          ...{
            'Music Generation': '5 credits',
            'Image Generation': '2 credits',
            'Video Generation': '10 credits',
            'Audio Mastering': '3 credits',
          }.entries.map((e) => Padding(
            padding: const EdgeInsets.only(bottom: GASpacing.sm),
            child: GACard(child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(e.key, style: const TextStyle(color: GAColors.textPrimary)),
                GAStatusBadge(label: e.value, type: GABadgeType.gold),
              ],
            )),
          )),
        ]),
      ),
    );
  }
}

// ── Profile Page ──────────────────────────────────────────────────────────────
class ProfilePage extends ConsumerWidget {
  const ProfilePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Profile'), actions: [
        IconButton(icon: const Icon(Icons.settings_outlined), onPressed: () {}),
      ]),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(GASpacing.md),
        child: Column(children: [
          Container(
            width: 80, height: 80,
            decoration: BoxDecoration(gradient: GAColors.gradientNeon, shape: BoxShape.circle),
            child: Center(child: Text(
              (user?.displayName ?? 'A').substring(0, 1).toUpperCase(),
              style: const TextStyle(color: GAColors.bgDeep, fontSize: 32, fontWeight: FontWeight.w800),
            )),
          ),
          const SizedBox(height: GASpacing.md),
          Text(user?.displayName ?? '—', style: Theme.of(context).textTheme.titleLarge?.copyWith(color: GAColors.textPrimary, fontWeight: FontWeight.w700)),
          Text('@${user?.username ?? '—'}', style: Theme.of(context).textTheme.bodyMedium),
          const SizedBox(height: GASpacing.sm),
          GAStatusBadge(label: user?.role.toUpperCase() ?? 'FREE', type: user?.isPro == true ? GABadgeType.gold : GABadgeType.info),
          const SizedBox(height: GASpacing.xl),
          GAButton(
            label: 'Sign Out',
            onPressed: () => ref.read(authProvider.notifier).logout(),
            variant: GAButtonVariant.danger,
            icon: Icons.logout,
          ),
        ]),
      ),
    );
  }
}

// Re-export wallet provider for dashboard
export '../../studio/data/creation_repository.dart' show walletBalanceProvider;
