import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vqowmnmqfdufgjbekdll.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const password = process.env.TOKEA_DEMO_PASSWORD || 'Tokea@123';

if (!serviceRoleKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY is required. Run this only from a trusted machine or server environment.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const demoUsers = [
  {
    email: 'attendee@tokeaevents.co.ke',
    fullName: 'Tokea Demo Attendee',
    phone: '0700000002',
    role: 'attendee',
  },
  {
    email: 'organizer@tokeaevents.co.ke',
    fullName: 'Tokea Organizer',
    phone: '0700000003',
    role: 'organizer',
    organizationName: 'Tokea Events',
  },
  {
    email: 'staff@tokeaevents.co.ke',
    fullName: 'Tokea Staff',
    phone: '0700000004',
    role: 'event_staff',
  },
  {
    email: 'volunteer@tokeaevents.co.ke',
    fullName: 'Tokea Volunteer',
    phone: '0700000005',
    role: 'volunteer',
  },
];

async function findUserByEmail(email) {
  let page = 1;
  const perPage = 100;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;

    const found = data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase());
    if (found) return found;
    if (data.users.length < perPage) return null;
    page += 1;
  }
}

async function upsertDemoUser(demoUser) {
  const existing = await findUserByEmail(demoUser.email);
  const metadata = {
    full_name: demoUser.fullName,
    phone_number: demoUser.phone,
    role: demoUser.role,
  };

  const { data, error } = existing
    ? await supabase.auth.admin.updateUserById(existing.id, {
        password,
        email_confirm: true,
        user_metadata: metadata,
        app_metadata: { role: demoUser.role },
      })
    : await supabase.auth.admin.createUser({
        email: demoUser.email,
        password,
        email_confirm: true,
        user_metadata: metadata,
        app_metadata: { role: demoUser.role },
      });

  if (error) throw error;
  const userId = data.user.id;

  const { error: userError } = await supabase.from('users').upsert({
    id: userId,
    phone_number: demoUser.phone,
    role: demoUser.role,
    disabled_at: null,
  });
  if (userError) throw userError;

  const { error: profileError } = await supabase.from('profiles').upsert({
    id: userId,
    full_name: demoUser.fullName,
    phone_number: demoUser.phone,
    role: demoUser.role,
    bio: `${demoUser.fullName} demo profile`,
  });
  if (profileError) throw profileError;

  if (demoUser.role === 'organizer') {
    const { error: organizerError } = await supabase.from('organizer_profiles').upsert(
      {
        profile_id: userId,
        organization_name: demoUser.organizationName,
        description: 'Demo organizer account for Tokea workflows.',
      },
      { onConflict: 'profile_id' },
    );
    if (organizerError) throw organizerError;
  }

  if (demoUser.role === 'event_staff') {
    const { error: staffError } = await supabase.from('staff_profiles').upsert(
      {
        profile_id: userId,
        department: 'operations',
        status: 'active',
      },
      { onConflict: 'profile_id' },
    );
    if (staffError) throw staffError;
  }

  if (demoUser.role === 'volunteer') {
    const { error: volunteerError } = await supabase.from('volunteer_profiles').upsert(
      {
        profile_id: userId,
        status: 'active',
        skills: ['guest support', 'check-in'],
      },
      { onConflict: 'profile_id' },
    );
    if (volunteerError) throw volunteerError;
  }

  return { email: demoUser.email, role: demoUser.role, id: userId };
}

const results = [];
for (const demoUser of demoUsers) {
  results.push(await upsertDemoUser(demoUser));
}

console.table(results);
console.log(`Demo password reset for all listed accounts: ${password}`);
