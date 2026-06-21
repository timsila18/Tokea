enum AppRole {
  superAdmin('super_admin', 'Super Admin'),
  organizer('organizer', 'Organizer'),
  attendee('attendee', 'Attendee'),
  vendor('vendor', 'Vendor'),
  eventStaff('event_staff', 'Event Staff');

  const AppRole(this.value, this.label);

  final String value;
  final String label;
}
