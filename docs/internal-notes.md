# Internal notes

## Promoting a user to counselor or admin

Roles live on `public.users.role` (`student` | `counselor` | `admin`). Clerk Organizations are not used. New sign-ups default to `student` via the Clerk webhook.

1. Have the person sign in once so their `users` row exists.
2. Run `npm run db:studio`.
3. Open the `users` table and find the row by `email` or `clerk_id`.
4. Set `role` to `counselor` or `admin`, then save.
5. Reload `/admin`. Counselors and admins enter the desk. Students are redirected to `/dashboard?error=forbidden`.

`/admin` is gated once in `app/admin/layout.tsx` by `requireDashboardAccess()` (counselor or admin). Destructive actions — for example `deleteProgram` and `deleteSuccessStory` — still call `requireRole("admin")`.

## Success-story photos (public marketing assets)

These are founder-approved public testimonials, not student documents.

- Store an object key in `success_stories.photo_r2_key`, e.g. `success-stories/ayesha.jpg`.
- Serve from a **public** R2 bucket / r2.dev URL / custom domain via `R2_PUBLIC_BASE_URL`.
- Do **not** use the Phase 4.4 private-bucket signed-URL viewer (`applications/{id}/...` keys, `/api/.../view`). ISR pages would cache URLs that expire, and public photos would sit on a grant model built for PII.
- Leave `R2_PUBLIC_BASE_URL` empty to publish stories without photos (initials avatar).
- Keys under `applications/` are rejected by the form on purpose.
