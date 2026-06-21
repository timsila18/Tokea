import 'package:flutter/material.dart';

class EventOrgChartScreen extends StatelessWidget {
  const EventOrgChartScreen({super.key});

  static const roles = ['Event Director', 'Operations Manager', 'Security Lead', 'Vendor Lead', 'Volunteer Lead', 'Transport Lead', 'Ticketing Lead', 'Media Lead'];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Event Org Chart')),
      body: ListView(
        padding: const EdgeInsets.all(18),
        children: [
          for (final role in roles) Card(
            child: ListTile(
              leading: const Icon(Icons.account_tree_outlined),
              title: Text(role),
              subtitle: const Text('Reporting hierarchy and staff assignments.'),
            ),
          ),
        ],
      ),
    );
  }
}

class ApprovalWorkflowsScreen extends StatelessWidget {
  const ApprovalWorkflowsScreen({super.key});

  static const workflows = ['Vendor Approval', 'Volunteer Approval', 'Staff Approval', 'Expense Approval', 'Sponsor Approval', 'Transport Approval', 'Food Vendor Approval'];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Approval Workflows')),
      body: ListView(
        padding: const EdgeInsets.all(18),
        children: [
          for (final workflow in workflows) Card(
            child: ListTile(
              leading: const Icon(Icons.approval_outlined),
              title: Text(workflow),
              subtitle: const Text('Workflow states, approvers, notes, and audit trail foundation.'),
            ),
          ),
        ],
      ),
    );
  }
}
