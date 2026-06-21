import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../core/theme/tokea_theme.dart';
import '../features/auth/login_screen.dart';
import '../features/auth/signup_screen.dart';
import '../features/checkin/checkin_scanner_screen.dart';
import '../features/notifications/notifications_screen.dart';
import '../features/organizers/ai_event_manager_screen.dart';
import '../features/organizers/analytics_dashboard_screen.dart';
import '../features/organizers/event_operations_workspace_screen.dart';
import '../features/organizers/finance_budgeting_screen.dart';
import '../features/organizers/marketplace_screens.dart';
import '../features/organizers/organizer_command_center_screen.dart';
import '../features/organizers/organizer_verification_screen.dart';
import '../features/organizers/team_documents_screen.dart';
import '../features/organizers/ticket_sales_dashboard_screen.dart';
import '../features/operations/event_command_center_screen.dart';
import '../features/operations/event_workspace_screen.dart';
import '../features/operations/incident_emergency_screen.dart';
import '../features/operations/org_approvals_screen.dart';
import '../features/operations/shift_attendance_screen.dart';
import '../features/operations/volunteer_portal_screen.dart';
import '../features/operations/workforce_management_screen.dart';
import '../features/shell/tokea_shell.dart';

final _router = GoRouter(
  initialLocation: '/login',
  redirect: (context, state) {
    final loggedIn = Supabase.instance.client.auth.currentSession != null;
    final authRoute = state.matchedLocation == '/login' || state.matchedLocation == '/signup';

    if (loggedIn && authRoute) return '/app';
    if (!loggedIn && !authRoute) return '/login';
    return null;
  },
  routes: [
    GoRoute(
      path: '/login',
      builder: (context, state) => const LoginScreen(),
    ),
    GoRoute(
      path: '/signup',
      builder: (context, state) => const SignupScreen(),
    ),
    GoRoute(
      path: '/app',
      builder: (context, state) => const TokeaShell(),
    ),
    GoRoute(
      path: '/notifications',
      builder: (context, state) => const NotificationsScreen(),
    ),
    GoRoute(
      path: '/check-in',
      builder: (context, state) => const CheckinScannerScreen(),
    ),
    GoRoute(
      path: '/organizer/ticket-dashboard',
      builder: (context, state) => const TicketSalesDashboardScreen(),
    ),
    GoRoute(
      path: '/organizer',
      builder: (context, state) => const OrganizerCommandCenterScreen(),
    ),
    GoRoute(
      path: '/organizer/event-ops',
      builder: (context, state) => const EventOperationsWorkspaceScreen(),
    ),
    GoRoute(
      path: '/organizer/ai',
      builder: (context, state) => const AiEventManagerScreen(),
    ),
    GoRoute(
      path: '/organizer/sponsors',
      builder: (context, state) => const SponsorMarketplaceScreen(),
    ),
    GoRoute(
      path: '/organizer/vendors',
      builder: (context, state) => const VendorMarketplaceScreen(),
    ),
    GoRoute(
      path: '/organizer/finance',
      builder: (context, state) => const FinanceBudgetingScreen(),
    ),
    GoRoute(
      path: '/organizer/analytics',
      builder: (context, state) => const AnalyticsDashboardScreen(),
    ),
    GoRoute(
      path: '/organizer/teams',
      builder: (context, state) => const OrganizerTeamsScreen(),
    ),
    GoRoute(
      path: '/organizer/documents',
      builder: (context, state) => const EventDocumentsScreen(),
    ),
    GoRoute(
      path: '/organizer/verification',
      builder: (context, state) => const OrganizerVerificationScreen(),
    ),
    GoRoute(
      path: '/operations/command',
      builder: (context, state) => const EventCommandCenterScreen(),
    ),
    GoRoute(
      path: '/operations/workspace',
      builder: (context, state) => const EventWorkspaceScreen(),
    ),
    GoRoute(
      path: '/operations/workforce',
      builder: (context, state) => const WorkforceManagementScreen(),
    ),
    GoRoute(
      path: '/operations/volunteers',
      builder: (context, state) => const VolunteerPortalScreen(),
    ),
    GoRoute(
      path: '/operations/shifts',
      builder: (context, state) => const ShiftAttendanceScreen(),
    ),
    GoRoute(
      path: '/operations/incidents',
      builder: (context, state) => const IncidentCenterScreen(),
    ),
    GoRoute(
      path: '/operations/emergency',
      builder: (context, state) => const EmergencyResponseScreen(),
    ),
    GoRoute(
      path: '/operations/org-chart',
      builder: (context, state) => const EventOrgChartScreen(),
    ),
    GoRoute(
      path: '/operations/approvals',
      builder: (context, state) => const ApprovalWorkflowsScreen(),
    ),
  ],
);

class TokeaApp extends StatelessWidget {
  const TokeaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'Tokea',
      debugShowCheckedModeBanner: false,
      theme: TokeaTheme.dark,
      routerConfig: _router,
    );
  }
}
