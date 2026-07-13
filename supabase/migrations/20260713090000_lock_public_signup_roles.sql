-- Public self-signup is attendee-only.
-- Elevated roles must be created by service-role backend flows, a super admin, or approved invitations.

drop policy if exists "users_insert_own" on public.users;
drop policy if exists "users_insert_own_attendee" on public.users;
drop policy if exists "users_admin_insert" on public.users;

create policy "users_insert_own_attendee" on public.users
for insert to authenticated
with check (
  id = (select auth.uid())
  and role = 'attendee'
);

create policy "users_admin_insert" on public.users
for insert to authenticated
with check (public.is_super_admin());

drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_insert_own_attendee" on public.profiles;
drop policy if exists "profiles_admin_insert" on public.profiles;

create policy "profiles_insert_own_attendee" on public.profiles
for insert to authenticated
with check (
  id = (select auth.uid())
  and role = 'attendee'
);

create policy "profiles_admin_insert" on public.profiles
for insert to authenticated
with check (public.is_super_admin());

drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "profiles_update_own_safe" on public.profiles;

create policy "profiles_update_own_safe" on public.profiles
for update to authenticated
using (
  id = (select auth.uid())
  or public.is_super_admin()
)
with check (
  public.is_super_admin()
  or (
    id = (select auth.uid())
    and role = (
      select u.role
      from public.users u
      where u.id = (select auth.uid())
    )
  )
);
