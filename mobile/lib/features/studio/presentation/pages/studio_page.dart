// ─────────────────────────────────────────────────────────────────────────────
// Studio Page — Music Generation UI
// Uses mock engine for V1 (no external providers yet)
// ─────────────────────────────────────────────────────────────────────────────

import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/theme/app_theme.dart';
import '../../../../shared/widgets/ga_widgets.dart';
import '../data/creation_repository.dart';

class StudioPage extends ConsumerStatefulWidget {
  const StudioPage({super.key});

  @override
  ConsumerState<StudioPage> createState() => _StudioPageState();
}

class _StudioPageState extends ConsumerState<StudioPage>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final _promptCtrl = TextEditingController();
  String _selectedStyle = 'Electronic';
  int _duration = 30;
  bool _instrumental = false;
  bool _generating = false;

  static const _styles = [
    'Electronic', 'Hip-Hop', 'Pop', 'Rock', 'Jazz',
    'Classical', 'Ambient', 'Lo-Fi', 'R&B', 'Latin',
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    _promptCtrl.dispose();
    super.dispose();
  }

  Future<void> _generate() async {
    if (_promptCtrl.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Describe the music you want to create')),
      );
      return;
    }

    setState(() => _generating = true);

    await ref.read(creationRepositoryProvider).createMusicJob(
      prompt: _promptCtrl.text.trim(),
      style: _selectedStyle,
      duration: _duration,
      instrumental: _instrumental,
    );

    if (mounted) setState(() => _generating = false);
  }

  @override
  Widget build(BuildContext context) {
    final jobs = ref.watch(creationJobsProvider);

    return Scaffold(
      backgroundColor: GAColors.bgDeep,
      appBar: AppBar(
        title: const Text('Studio'),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: GASpacing.md),
            child: Consumer(builder: (_, ref, __) {
              final wallet = ref.watch(walletBalanceProvider);
              return wallet.when(
                data: (b) => GACreditDisplay(balance: b, compact: true),
                loading: () => const GAShimmer(width: 60, height: 20),
                error: (_, __) => const SizedBox(),
              );
            }),
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: GAColors.neon,
          labelColor: GAColors.neon,
          unselectedLabelColor: GAColors.textDim,
          tabs: const [
            Tab(text: 'Generate'),
            Tab(text: 'Library'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _GenerateTab(
            promptCtrl: _promptCtrl,
            selectedStyle: _selectedStyle,
            duration: _duration,
            instrumental: _instrumental,
            generating: _generating,
            styles: _styles,
            onStyleChanged: (s) => setState(() => _selectedStyle = s),
            onDurationChanged: (d) => setState(() => _duration = d),
            onInstrumentalChanged: (v) => setState(() => _instrumental = v),
            onGenerate: _generate,
          ),
          _LibraryTab(jobs: jobs),
        ],
      ),
    );
  }
}

// ── Generate Tab ──────────────────────────────────────────────────────────────
class _GenerateTab extends StatelessWidget {
  final TextEditingController promptCtrl;
  final String selectedStyle;
  final int duration;
  final bool instrumental;
  final bool generating;
  final List<String> styles;
  final void Function(String) onStyleChanged;
  final void Function(int) onDurationChanged;
  final void Function(bool) onInstrumentalChanged;
  final VoidCallback onGenerate;

  const _GenerateTab({
    required this.promptCtrl,
    required this.selectedStyle,
    required this.duration,
    required this.instrumental,
    required this.generating,
    required this.styles,
    required this.onStyleChanged,
    required this.onDurationChanged,
    required this.onInstrumentalChanged,
    required this.onGenerate,
  });

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(GASpacing.md),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ── Prompt ─────────────────────────────────────────────────────────
          GACard(
            neonBorder: true,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(children: [
                  const Icon(Icons.auto_awesome, color: GAColors.neon, size: 18),
                  const SizedBox(width: GASpacing.sm),
                  Text('Describe your track', style: Theme.of(context).textTheme.titleSmall),
                ]),
                const SizedBox(height: GASpacing.md),
                TextField(
                  controller: promptCtrl,
                  maxLines: 4,
                  style: const TextStyle(color: GAColors.textPrimary, fontSize: 15),
                  decoration: InputDecoration(
                    hintText: 'A chill lo-fi beat with soft piano, rain sounds, and a slow hip-hop rhythm...',
                    hintStyle: const TextStyle(color: GAColors.textDim, fontSize: 14),
                    border: InputBorder.none,
                    enabledBorder: InputBorder.none,
                    focusedBorder: InputBorder.none,
                    fillColor: Colors.transparent,
                    filled: false,
                  ),
                ),
              ],
            ),
          ).animate().fadeIn(delay: 50.ms).slideY(begin: 0.1),

          const SizedBox(height: GASpacing.md),

          // ── Style ──────────────────────────────────────────────────────────
          Text('Style', style: Theme.of(context).textTheme.titleSmall)
              .animate().fadeIn(delay: 100.ms),
          const SizedBox(height: GASpacing.sm),
          SizedBox(
            height: 36,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: styles.length,
              separatorBuilder: (_, __) => const SizedBox(width: GASpacing.sm),
              itemBuilder: (_, i) => FilterChip(
                label: Text(styles[i]),
                selected: selectedStyle == styles[i],
                onSelected: (_) => onStyleChanged(styles[i]),
              ),
            ),
          ).animate().fadeIn(delay: 120.ms),

          const SizedBox(height: GASpacing.md),

          // ── Duration ───────────────────────────────────────────────────────
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Duration', style: Theme.of(context).textTheme.titleSmall),
              GAStatusBadge(label: '${duration}s', type: GABadgeType.info),
            ],
          ).animate().fadeIn(delay: 140.ms),
          Slider(
            value: duration.toDouble(),
            min: 15,
            max: 120,
            divisions: 7,
            activeColor: GAColors.neon,
            inactiveColor: GAColors.borderDim,
            onChanged: (v) => onDurationChanged(v.round()),
          ).animate().fadeIn(delay: 150.ms),

          const SizedBox(height: GASpacing.sm),

          // ── Instrumental toggle ────────────────────────────────────────────
          GACard(
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Instrumental only', style: Theme.of(context).textTheme.titleSmall),
                    const SizedBox(height: 2),
                    Text('No vocals', style: Theme.of(context).textTheme.bodySmall),
                  ],
                ),
                Switch(value: instrumental, onChanged: onInstrumentalChanged),
              ],
            ),
          ).animate().fadeIn(delay: 160.ms),

          const SizedBox(height: GASpacing.xl),

          // ── Cost indicator ─────────────────────────────────────────────────
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.bolt, color: GAColors.gold, size: 16),
              const SizedBox(width: 4),
              Text('5 credits per generation',
                  style: const TextStyle(color: GAColors.gold, fontSize: 13)),
            ],
          ).animate().fadeIn(delay: 180.ms),

          const SizedBox(height: GASpacing.md),

          // ── Generate button ────────────────────────────────────────────────
          GAButton(
            label: generating ? 'Generating...' : 'Generate Music',
            onPressed: generating ? null : onGenerate,
            isLoading: generating,
            icon: Icons.music_note,
          ).animate().fadeIn(delay: 200.ms),

          const SizedBox(height: GASpacing.lg),
        ],
      ),
    );
  }
}

// ── Library Tab ───────────────────────────────────────────────────────────────
class _LibraryTab extends StatelessWidget {
  final AsyncValue<List<CreationJobModel>> jobs;
  const _LibraryTab({required this.jobs});

  @override
  Widget build(BuildContext context) {
    return jobs.when(
      loading: () => const Center(child: CircularProgressIndicator(color: GAColors.neon)),
      error: (e, _) => Center(child: Text('Error: $e', style: const TextStyle(color: GAColors.error))),
      data: (list) {
        if (list.isEmpty) {
          return Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.music_off, color: GAColors.textDim, size: 48),
                const SizedBox(height: GASpacing.md),
                Text('No creations yet', style: Theme.of(context).textTheme.titleMedium?.copyWith(color: GAColors.textDim)),
                const SizedBox(height: GASpacing.sm),
                Text('Generate your first track in the Generate tab',
                    style: Theme.of(context).textTheme.bodySmall, textAlign: TextAlign.center),
              ],
            ),
          );
        }
        return ListView.separated(
          padding: const EdgeInsets.all(GASpacing.md),
          itemCount: list.length,
          separatorBuilder: (_, __) => const SizedBox(height: GASpacing.sm),
          itemBuilder: (_, i) => _JobCard(job: list[i]),
        );
      },
    );
  }
}

class _JobCard extends StatelessWidget {
  final CreationJobModel job;
  const _JobCard({required this.job});

  @override
  Widget build(BuildContext context) {
    final (icon, badgeType) = switch (job.status) {
      'completed'  => (Icons.check_circle_outline, GABadgeType.success),
      'processing' => (Icons.hourglass_top,         GABadgeType.info),
      'queued'     => (Icons.queue_music,            GABadgeType.warning),
      'failed'     => (Icons.error_outline,          GABadgeType.error),
      _            => (Icons.music_note,             GABadgeType.info),
    };

    return GACard(
      child: Row(
        children: [
          Container(
            width: 48, height: 48,
            decoration: BoxDecoration(
              color: GAColors.bgSurface,
              borderRadius: GARadius.mdBR,
            ),
            child: Icon(icon, color: GAColors.neon, size: 24),
          ),
          const SizedBox(width: GASpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  job.params['prompt'] ?? 'Music generation',
                  style: const TextStyle(color: GAColors.textPrimary, fontSize: 14, fontWeight: FontWeight.w600),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 2),
                Text(
                  job.params['style'] ?? '',
                  style: const TextStyle(color: GAColors.textDim, fontSize: 12),
                ),
              ],
            ),
          ),
          GAStatusBadge(label: job.status, type: badgeType),
        ],
      ),
    );
  }
}
