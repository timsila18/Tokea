drop policy if exists "profiles_read_self" on public.profiles;
create policy "profiles_read_self" on public.profiles
for select to authenticated
using (id = (select auth.uid()) or public.is_super_admin());

drop policy if exists "users_read_self_role" on public.users;
create policy "users_read_self_role" on public.users
for select to authenticated
using (id = (select auth.uid()) or public.is_super_admin());
