// ─────────────────────────────────────────────────────────────────────────────
// Shared Widgets — Gen Audius Design System Components
// ─────────────────────────────────────────────────────────────────────────────

import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';

// ── GAButton ──────────────────────────────────────────────────────────────────
class GAButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;
  final bool isLoading;
  final IconData? icon;
  final GAButtonVariant variant;
  final double? width;

  const GAButton({
    super.key,
    required this.label,
    this.onPressed,
    this.isLoading = false,
    this.icon,
    this.variant = GAButtonVariant.primary,
    this.width,
  });

  @override
  Widget build(BuildContext context) {
    final child = isLoading
        ? const SizedBox(
            width: 20, height: 20,
            child: CircularProgressIndicator(strokeWidth: 2, color: GAColors.bgDeep),
          )
        : Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (icon != null) ...[
                Icon(icon, size: 18),
                const SizedBox(width: GASpacing.sm),
              ],
              Text(label),
            ],
          );

    switch (variant) {
      case GAButtonVariant.primary:
        return SizedBox(
          width: width ?? double.infinity,
          child: ElevatedButton(onPressed: onPressed, child: child),
        );
      case GAButtonVariant.secondary:
        return SizedBox(
          width: width ?? double.infinity,
          child: OutlinedButton(onPressed: onPressed, child: child),
        );
      case GAButtonVariant.ghost:
        return SizedBox(
          width: width ?? double.infinity,
          child: TextButton(onPressed: onPressed, child: child),
        );
      case GAButtonVariant.danger:
        return SizedBox(
          width: width ?? double.infinity,
          child: ElevatedButton(
            onPressed: onPressed,
            style: ElevatedButton.styleFrom(
              backgroundColor: GAColors.error,
              foregroundColor: GAColors.textPrimary,
            ),
            child: child,
          ),
        );
    }
  }
}

enum GAButtonVariant { primary, secondary, ghost, danger }

// ── GATextField ───────────────────────────────────────────────────────────────
class GATextField extends StatelessWidget {
  final TextEditingController controller;
  final String label;
  final String? hint;
  final TextInputType? keyboardType;
  final bool obscureText;
  final IconData? prefixIcon;
  final IconData? suffixIcon;
  final VoidCallback? onSuffixTap;
  final String? Function(String?)? validator;
  final int? maxLength;
  final int maxLines;
  final bool enabled;
  final void Function(String)? onChanged;

  const GATextField({
    super.key,
    required this.controller,
    required this.label,
    this.hint,
    this.keyboardType,
    this.obscureText = false,
    this.prefixIcon,
    this.suffixIcon,
    this.onSuffixTap,
    this.validator,
    this.maxLength,
    this.maxLines = 1,
    this.enabled = true,
    this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: controller,
      keyboardType: keyboardType,
      obscureText: obscureText,
      maxLength: maxLength,
      maxLines: maxLines,
      enabled: enabled,
      onChanged: onChanged,
      validator: validator,
      style: const TextStyle(color: GAColors.textPrimary, fontSize: 15),
      decoration: InputDecoration(
        labelText: label,
        hintText: hint,
        counterText: '',
        prefixIcon: prefixIcon != null
            ? Icon(prefixIcon, size: 20, color: GAColors.textDim)
            : null,
        suffixIcon: suffixIcon != null
            ? GestureDetector(
                onTap: onSuffixTap,
                child: Icon(suffixIcon, size: 20, color: GAColors.textDim),
              )
            : null,
      ),
    );
  }
}

// ── GACard ────────────────────────────────────────────────────────────────────
class GACard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry? padding;
  final VoidCallback? onTap;
  final bool neonBorder;
  final bool goldBorder;

  const GACard({
    super.key,
    required this.child,
    this.padding,
    this.onTap,
    this.neonBorder = false,
    this.goldBorder = false,
  });

  @override
  Widget build(BuildContext context) {
    final borderColor = neonBorder
        ? GAColors.neon
        : goldBorder
            ? GAColors.gold
            : GAColors.borderDim;

    final card = Container(
      decoration: BoxDecoration(
        gradient: GAColors.gradientCard,
        borderRadius: GARadius.lgBR,
        border: Border.all(color: borderColor, width: neonBorder || goldBorder ? 1.5 : 1),
        boxShadow: neonBorder
            ? GAShadows.neonGlowSm
            : goldBorder
                ? GAShadows.goldGlow
                : GAShadows.card,
      ),
      padding: padding ?? const EdgeInsets.all(GASpacing.md),
      child: child,
    );

    if (onTap != null) {
      return GestureDetector(onTap: onTap, child: card);
    }
    return card;
  }
}

// ── GALogo ────────────────────────────────────────────────────────────────────
class GALogo extends StatelessWidget {
  final double size;
  final bool showText;

  const GALogo({super.key, this.size = 48, this.showText = true});

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: size,
          height: size,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            gradient: GAColors.gradientNeon,
            boxShadow: GAShadows.neonGlow,
          ),
          child: Center(
            child: Text(
              '⬡',
              style: TextStyle(fontSize: size * 0.55, color: GAColors.bgDeep),
            ),
          ),
        ),
        if (showText) ...[
          const SizedBox(height: GASpacing.sm),
          Text(
            'GEN AUDIUS PRO',
            style: TextStyle(
              color: GAColors.neon,
              fontSize: size * 0.28,
              fontWeight: FontWeight.w800,
              letterSpacing: 2,
              fontFamily: 'Inter',
            ),
          ),
        ],
      ],
    );
  }
}

// ── GAStatusBadge ─────────────────────────────────────────────────────────────
class GAStatusBadge extends StatelessWidget {
  final String label;
  final GABadgeType type;

  const GAStatusBadge({super.key, required this.label, this.type = GABadgeType.info});

  @override
  Widget build(BuildContext context) {
    final (bgColor, textColor) = switch (type) {
      GABadgeType.success => (GAColors.success.withOpacity(0.15), GAColors.success),
      GABadgeType.error   => (GAColors.error.withOpacity(0.15),   GAColors.error),
      GABadgeType.warning => (GAColors.warning.withOpacity(0.15), GAColors.warning),
      GABadgeType.info    => (GAColors.neonDim,                   GAColors.neon),
      GABadgeType.gold    => (GAColors.goldDim,                   GAColors.gold),
    };

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: GARadius.fullBR,
        border: Border.all(color: textColor.withOpacity(0.3)),
      ),
      child: Text(label, style: TextStyle(
        color: textColor,
        fontSize: 11,
        fontWeight: FontWeight.w600,
        letterSpacing: 0.5,
      )),
    );
  }
}

enum GABadgeType { success, error, warning, info, gold }

// ── GACreditDisplay ───────────────────────────────────────────────────────────
class GACreditDisplay extends StatelessWidget {
  final int balance;
  final bool compact;

  const GACreditDisplay({super.key, required this.balance, this.compact = false});

  @override
  Widget build(BuildContext context) {
    if (compact) {
      return Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.bolt, color: GAColors.gold, size: 16),
          const SizedBox(width: 2),
          Text(
            '$balance',
            style: const TextStyle(
              color: GAColors.gold,
              fontSize: 14,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      );
    }

    return GACard(
      goldBorder: true,
      padding: const EdgeInsets.symmetric(horizontal: GASpacing.md, vertical: GASpacing.sm),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.bolt, color: GAColors.gold, size: 20),
          const SizedBox(width: GASpacing.sm),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('$balance credits', style: const TextStyle(
                color: GAColors.gold,
                fontSize: 16,
                fontWeight: FontWeight.w700,
              )),
              Text('available balance', style: const TextStyle(
                color: GAColors.textDim,
                fontSize: 11,
              )),
            ],
          ),
        ],
      ),
    );
  }
}

// ── GAShimmer (loading placeholder) ──────────────────────────────────────────
class GAShimmer extends StatefulWidget {
  final double width;
  final double height;
  final double borderRadius;

  const GAShimmer({
    super.key,
    required this.width,
    required this.height,
    this.borderRadius = 8,
  });

  @override
  State<GAShimmer> createState() => _GAShimmerState();
}

class _GAShimmerState extends State<GAShimmer> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: const Duration(milliseconds: 1200))
      ..repeat();
    _animation = Tween<double>(begin: -2, end: 2).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _animation,
      builder: (_, __) => Container(
        width: widget.width,
        height: widget.height,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(widget.borderRadius),
          gradient: LinearGradient(
            begin: Alignment(_animation.value - 1, 0),
            end: Alignment(_animation.value + 1, 0),
            colors: const [GAColors.bgSurface, GAColors.bgCard, GAColors.bgSurface],
          ),
        ),
      ),
    );
  }
}
