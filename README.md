# Alvix Education Consultancy Portal

NestJS + TypeORM + PostgreSQL (Supabase) backend, Next.js frontend. 10 tables:
users, applicants, documents, applications, universities, programs, university_programs, areas, majors, intakes.

## Run
```bash
# backend
cd backend && cp .env.example .env      # set DATABASE_URL (Supabase), JWT_SECRET, SEED_ADMIN_*
npm install
npm run migration:run                    # creates/updates schema (synchronize is always false)
npm run seed                             # super admin + sample majors + SEPTEMBER-2026 intake
npm run start:dev                        # http://localhost:4000

# frontend
cd frontend && npm install && npm run dev   # http://localhost:3000  (proxies /api/* to the backend)
```
Admin: /admin-login · Applicant: /applicant-login (passport number + password)

## Notes
- applications.id is the UUID PK; applications.application_id (APP-2026-000123) is UNIQUE and generated from the
  Postgres sequence `application_id_seq`.
- An application's university must offer the chosen program (university_programs); university, program and major must be active.
- applicants.fund_usd is NUMERIC(15,2); the API returns it as a string (e.g. "15000.50") to avoid float rounding.
- Routes without @Roles() are admin-only by default. Applicants can only read their own applications/documents.

## Admin dashboard (what's in the UI)
| Page | What you can do |
|---|---|
| Dashboard | Totals, applications/documents by status, passports expiring (6 mo), bank maturity (30 d), recent applications |
| Applicants | Search, create, delete. Click one to open its **details page** |
| Applicant details | Edit the whole profile (incl. sponsor/bank fields) · **Documents**: change status/received date/notes inline (auto-saves), add custom docs, one-click standard checklist, progress bar · **Applications**: change status inline, add, edit, delete |
| Applications | Search by Application ID / passport / name, filter by status, inline status change, create/edit/delete |
| Universities / Programs / Majors / Areas | Search, create, edit, activate/deactivate, delete. Universities link to the programs they offer |
| Users (super admin only) | Create/edit/deactivate/delete admins, reset passwords |

## Permissions
- **SUPER_ADMIN**: everything, including delete and user management.
- **ADMIN**: create / read / update everywhere; no delete, no user management.
- Deleting a record that other records still reference returns 409 ("deactivate it instead"). Deleting an applicant also removes their documents, but is blocked while they have applications.
- You can't delete, deactivate or demote your own account.

## Added in this version
- **Passwords:** every user (admin, super admin, applicant) can change their own password (old password required) from the sidebar / portal header.
  Admins can set an applicant's password directly (applicant page → *Set password*); a super admin can do the same for users (Users → *Set password*). No old password needed for these.
- **Excel export:** *Download Excel* on the Applicants and Applications lists (applications export respects the current search/status/intake filters).
- **PDF printouts:** applicant file (profile + documents + all applications) and application sheet (application + applicant + document checklist).
  *Print* opens the PDF in a new tab, *PDF* downloads it. Applicants can print their own file from the portal.
- **Intakes:** new `intakes` table with full CRUD. Every application belongs to one intake, chosen from a dropdown (alongside university, program and major).
  Migration `IntakesAndUppercase` creates `SEPTEMBER-2026` and assigns it to existing applications.
- **Uppercase storage:** all text is trimmed and stored in UPPERCASE by a TypeORM subscriber, except `email`, `website` (links are case-sensitive) and password hashes.
  The migration also uppercases existing rows. Passport numbers are matched case-insensitively at login.
- **Applicant portal:** applicants see their full profile (incl. sponsor/bank), documents with progress, and applications with intake and status.
