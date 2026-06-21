import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../core/theme/tokea_theme.dart';
import '../features/auth/login_screen.dart';
import '../features/auth/signup_screen.dart';
import '../features/checkin/checkin_scanner_screen.dart';
import '../features/events/event_detail_screen.dart';
import '../features/experience/attendee_experience_hub_screen.dart';
import '../features/experience/foodo_screen.dart';
import '../features/experience/logistics_health_screen.dart';
import '../features/experience/maps_schedule_screen.dart';
import '../features/experience/rewards_merch_screen.dart';
import '../features/experience/triplink_screen.dart';
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
import '../features/organizers/withdrawal_request_screen.dart';
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
      builder: (context, state) {
        final extra = state.extra;
        final initialIndex = extra is Map<String, dynamic> ? extra['tab'] as int? ?? 0 : 0;
        return TokeaShell(initialIndex: initialIndex);
      },
    ),
    GoRoute(
      path: '/events/:eventId',
      builder: (context, state) {
        final extra = state.extra;
        final event = extra is Map<String, dynamic> ? extra : <String, dynamic>{'title': 'Tokea Event'};
        return EventDetailScreen(event: event);
      },
    ),
    GoRoute(
      path: '/notifications',
      builder: (context, state) => const NotificationsScreen(),
    ),
    GoRoute(
      path: '/experience',
      builder: (context, state) => const AttendeeExperienceHubScreen(),
    ),
    GoRoute(
      path: '/experience/food',
      builder: (context, state) => const FoodoScreen(),
    ),
    GoRoute(
      path: '/experience/transport',
      builder: (context, state) => const TriplinkScreen(),
    ),
    GoRoute(
      path: '/experience/maps',
      builder: (context, state) => const EventMapsScreen(),
    ),
    GoRoute(
      path: '/experience/schedule',
      builder: (context, state) => const EventScheduleScreen(),
    ),
    GoRoute(
      path: '/experience/rewards',
      builder: (context, state) => const RewardsReferralsScreen(),
    ),
    GoRoute(
      path: '/experience/merch',
      builder: (context, state) => const MerchandiseScreen(),
    ),
    GoRoute(
      path: '/operations/logistics',
      builder: (context, state) => const LogisticsOperationsScreen(),
    ),
    GoRoute(
      path: '/operations/health-safety',
      builder: (context, state) => const HealthSafetyScreen(),
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
      path: '/organizer/withdrawals',
      builder: (context, state) => const WithdrawalRequestScreen(),
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
