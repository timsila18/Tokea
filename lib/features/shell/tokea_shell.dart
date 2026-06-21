import 'package:flutter/material.dart';
import '../create/create_event_screen.dart';
import '../discover/discover_screen.dart';
import '../home/home_feed_screen.dart';
import '../profile/profile_screen.dart';
import '../reels/reels_screen.dart';
import '../tickets/tickets_screen.dart';

class TokeaShell extends StatefulWidget {
  const TokeaShell({this.initialIndex = 0, super.key});

  final int initialIndex;

  @override
  State<TokeaShell> createState() => _TokeaShellState();
}

class _TokeaShellState extends State<TokeaShell> {
  late var _index = widget.initialIndex;

  final _screens = const [
    HomeFeedScreen(),
    DiscoverScreen(),
    ReelsScreen(),
    CreateEventScreen(),
    TicketsScreen(),
    ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _screens[_index],
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        onDestinationSelected: (value) => setState(() => _index = value),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.home_outlined), label: 'Home'),
          NavigationDestination(icon: Icon(Icons.explore_outlined), label: 'Discover'),
          NavigationDestination(icon: Icon(Icons.movie_filter_outlined), label: 'Reels'),
          NavigationDestination(icon: Icon(Icons.add_circle_outline), label: 'Create'),
          NavigationDestination(icon: Icon(Icons.confirmation_number_outlined), label: 'Tickets'),
          NavigationDestination(icon: Icon(Icons.person_outline), label: 'Profile'),
        ],
      ),
    );
  }
}
