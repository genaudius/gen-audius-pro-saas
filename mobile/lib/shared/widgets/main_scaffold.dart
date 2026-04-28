// Main scaffold with Dark Luxury bottom navigation
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_theme.dart';

class MainScaffold extends StatelessWidget {
  final StatefulNavigationShell shell;
  const MainScaffold({super.key, required this.shell});

  static const _tabs = [
    (icon: Icons.dashboard_outlined,     activeIcon: Icons.dashboard,          label: 'Home'),
    (icon: Icons.music_note_outlined,    activeIcon: Icons.music_note,         label: 'Studio'),
    (icon: Icons.chat_bubble_outline,    activeIcon: Icons.chat_bubble,        label: 'ChatGAU'),
    (icon: Icons.account_balance_wallet_outlined, activeIcon: Icons.account_balance_wallet, label: 'Wallet'),
    (icon: Icons.person_outline,         activeIcon: Icons.person,             label: 'Profile'),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: shell,
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: GAColors.bgHeader,
          border: Border(top: BorderSide(color: GAColors.borderDim, width: 1)),
        ),
        child: NavigationBar(
          selectedIndex: shell.currentIndex,
          onDestinationSelected: (i) => shell.goBranch(i,
            initialLocation: i == shell.currentIndex,
          ),
          destinations: _tabs.map((tab) => NavigationDestination(
            icon: Icon(tab.icon),
            selectedIcon: Icon(tab.activeIcon),
            label: tab.label,
          )).toList(),
        ),
      ),
    );
  }
}
