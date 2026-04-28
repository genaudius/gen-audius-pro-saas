// ── Dashboard Page ────────────────────────────────────────────────────────────
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../../../shared/widgets/ga_widgets.dart';
import '../../../features/auth/data/auth_repository.dart';
import '../../../features/studio/data/creation_repository.dart';

class DashboardPage extends ConsumerWidget {
  const DashboardPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user   = ref.watch(currentUserProvider);
    final wallet = ref.watch(walletBalanceProvider);
    final jobs   = ref.watch(creationJobsProvider);

    return Scaffold(
      backgroundColor: GAColors.bgDeep,
      appBar: AppBar(
        title: const Text('Gen Audius Pro'),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: GASpacing.md),
            child: wallet.when(
              data: (b) => GACreditDisplay(balance: b, compact: true),
              loading: () => const GAShimmer(width: 60, height: 20),
              error: (_, __) => const SizedBox(),
            ),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(GASpacing.md),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Greeting
            Text(
              'Welcome back,',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            Text(
              user?.displayName ?? 'Artist',
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                color: GAColors.neon, fontWeight: FontWeight.w700,
              ),
            ),

            const SizedBox(height: GASpacing.lg),

            // Stats row
            Row(children: [
              Expanded(child: _StatCard(label: 'Credits', value: wallet.value?.toString() ?? '—', icon: Icons.bolt, color: GAColors.gold)),
              const SizedBox(width: GASpacing.md),
              Expanded(child: _StatCard(
                label: 'Creations',
                value: jobs.value?.length.toString() ?? '—',
                icon: Icons.music_note,
                color: GAColors.neon,
              )),
            ]),

            const SizedBox(height: GASpacing.lg),

            // Recent creations
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Recent Creations', style: Theme.of(context).textTheme.titleMedium),
                TextButton(onPressed: () {}, child: const Text('See all')),
              ],
            ),
            const SizedBox(height: GASpacing.sm),

            jobs.when(
              loading: () => Column(children: List.generate(3, (_) =>
                Padding(
                  padding: const EdgeInsets.only(bottom: GASpacing.sm),
                  child: GAShimmer(width: double.infinity, height: 72, borderRadius: GARadius.lg),
                ),
              )),
              error: (e, _) => Text('Error loading creations', style: TextStyle(color: GAColors.error)),
              data: (list) => list.isEmpty
                ? GACard(
                    child: Center(
                      child: Padding(
                        padding: const EdgeInsets.all(GASpacing.lg),
                        child: Column(children: [
                          const Icon(Icons.music_off, color: GAColors.textDim, size: 40),
                          const SizedBox(height: GASpacing.md),
                          Text('No creations yet. Head to Studio!',
                            style: Theme.of(context).textTheme.bodyMedium, textAlign: TextAlign.center),
                        ]),
                      ),
                    ),
                  )
                : Column(
                    children: list.take(5).map((j) => Padding(
                      padding: const EdgeInsets.only(bottom: GASpacing.sm),
                      child: GACard(
                        child: ListTile(
                          contentPadding: EdgeInsets.zero,
                          leading: Container(
                            width: 40, height: 40,
                            decoration: BoxDecoration(color: GAColors.bgSurface, borderRadius: GARadius.mdBR),
                            child: const Icon(Icons.music_note, color: GAColors.neon, size: 20),
                          ),
                          title: Text(
                            j.params['prompt'] ?? 'Music',
                            style: const TextStyle(color: GAColors.textPrimary, fontSize: 14),
                            maxLines: 1, overflow: TextOverflow.ellipsis,
                          ),
                          subtitle: Text(j.status, style: const TextStyle(color: GAColors.textDim, fontSize: 12)),
                          trailing: GAStatusBadge(
                            label: j.status,
                            type: j.isCompleted ? GABadgeType.success : j.isFailed ? GABadgeType.error : GABadgeType.info,
                          ),
                        ),
                      ),
                    )).toList(),
                  ),
            ),
          ],
        ),
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String label, value;
  final IconData icon;
  final Color color;
  const _StatCard({required this.label, required this.value, required this.icon, required this.color});

  @override
  Widget build(BuildContext context) => GACard(
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, color: color, size: 22),
        const SizedBox(height: GASpacing.sm),
        Text(value, style: TextStyle(color: color, fontSize: 24, fontWeight: FontWeight.w700)),
        Text(label, style: Theme.of(context).textTheme.bodySmall),
      ],
    ),
  );
}
