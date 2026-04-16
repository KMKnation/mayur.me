# FAQ

## 1) Where should I set Supabase env vars?

Create or update `.env.local` at the project root:

```bash
VITE_SUPABASE_URL=https://zqgdkwjjlyemmkgoxhbp.supabase.co
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

Notes:
- Use `VITE_` prefix (required by Vite).
- `SUBABASE_ANON_KEY` is a typo. Use `SUPABASE`.
- Restart dev server after changes.

---

## 2) Google Sign-In error: `Unsupported provider: provider is not enabled`

This means Google provider is disabled in Supabase.

Fix:
1. Supabase Dashboard -> Authentication -> Providers -> Google.
2. Enable Google.
3. Paste Google OAuth Client ID and Client Secret.
4. Save and retry login.

---

## 3) How do I get Google Client ID and Secret?

From Google Cloud Console:
1. Go to APIs & Services -> OAuth consent screen and configure app.
2. Go to APIs & Services -> Credentials -> Create Credentials -> OAuth client ID.
3. Choose **Web application**.
4. Add redirect URI:
   - `https://zqgdkwjjlyemmkgoxhbp.supabase.co/auth/v1/callback`
5. Create and copy:
   - Client ID
   - Client Secret
6. Paste both into Supabase Google provider settings.

---

## 4) Google error: `redirect_uri_mismatch`

Your callback URL in Google OAuth client does not exactly match the one used by Supabase.

Use these exact values:

- Google OAuth -> Authorized redirect URI:
  - `https://zqgdkwjjlyemmkgoxhbp.supabase.co/auth/v1/callback`

- Supabase -> Authentication -> URL Configuration:
  - Site URL: `http://localhost:5173`
  - Additional Redirect URLs: `http://localhost:5173/admin/login`

Common causes:
- Wrong Supabase project ref
- Using a different Google OAuth client
- Missing callback URI in Google settings
- Trailing slash mismatch

---

## 5) Admin login error: `Failed to read admin_users: 404`

This usually means the database schema is not applied yet (or `public` schema is not exposed).

Fix:
1. In Supabase SQL Editor, run `supabase/schema.sql` first.
2. Then run `supabase/seed.sql` (the full seed script you shared).
3. Verify table exists:

```sql
select to_regclass('public.admin_users');
```

Expected result: `public.admin_users`

4. Verify seeded super admin row:

```sql
select email, role, active
from public.admin_users
where email = 'kanojiyamayur@gmail.com';
```

5. In Supabase -> Project Settings -> API -> Exposed schemas, ensure `public` is included.
6. Confirm `.env.local` points to the same project URL/key.
7. Restart dev server and retry `/admin/login`.
