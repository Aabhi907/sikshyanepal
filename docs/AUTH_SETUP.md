# Supabase authentication setup

Apply `20260907_role_auth_and_claims.sql` after the earlier migrations.

1. In Supabase Authentication, enable Email/password. For production, keep email confirmation enabled.
2. Register the first account at `/account/register`.
3. In Supabase SQL Editor, promote only the trusted owner account:

```sql
update public.profiles
set role = 'owner', updated_at = now()
where id = (select id from auth.users where email = 'OWNER_EMAIL_HERE');
```

4. The owner signs in at `/admin/login` using email and password.
5. Representatives register, sign in, and submit a request at `/account/claim`.
6. An editor or owner verifies the requester through official contact details before approving `/admin/claims`.

Never place passwords, access tokens, or the Supabase service-role key in Git. The service-role key is server-only. There is no fallback admin password.
