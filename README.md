# Sahera – questionnaire and follow-up platform

Angular 13 bilingual app (FR/EN) built for the Sahera study on auricular acupressure: participants answer themed questionnaires, receive notifications, and an admin console manages cohorts, content, and analytics.

## Key features
- **Auth & security**: sign-up with informed consent + email OTP, user/admin login, password reset via code, session persistence, `AuthGuard`/`AdminGuard`, and JWT interceptor (`Authorization: Bearer`).
- **Participant experience**: multilingual landing, list of open/closed questionnaires, navigation through sub-topics, answering questions (list, text, date), incremental saves, “My answers” history, notifications with unread badge.
- **Admin space**: dashboard (gender/ethnicity split, theme progression), participant management (CRUD + filters/pagination), questionnaire creation (FR/EN titles/descriptions, open/close windows, CSV import for sub-topics & questions), per-question analysis (counts per option + “Other”), bulk notifications, admin email profile settings.
- **Internationalization**: custom `TranslationService` with FR/EN dictionaries, language persisted in `localStorage`, API calls use a `lang` query param.
- **UI/UX**: Angular Material + Bootstrap + MDB UI Kit, `ngx-toastr` toasts, FontAwesome icons, Chart.js visuals, reusable components (`card`, `admin-qcard`, `navbar`, `footer`, `notification`, `dashboard`, etc.).

## Prerequisites
- Node.js 18+ (CI workflow tested with Node 20) and npm.
- Angular CLI 13 (`npm install -g @angular/cli@13` or add it as a dev dependency).
- Access to the Sahera API (see configuration below).

## Installation & scripts
```bash
npm install
npm start              # ng serve on http://localhost:4200
npm run build -- --configuration production   # build dist/sahera
npm test               # Karma/Jasmine unit tests
npm run watch          # build in watch mode (development config)
```

## Environment configuration
- `src/environments/environment.ts` (dev): `apiBase` defaults to `http://192.168.1.3:5000`
- `src/environments/environment.prod.ts` (prod): `apiBase` is `https://api.sahera-webapp-api.ca`
- Every request uses `apiBase + '/api'`. Adjust `apiBase` per environment (dev/staging/prod). No other frontend env vars are required.

## Code architecture
```text
src/app/
  pages/landing-page                # Public hero + language switch
  pages/log-in-sign-in              # Login, OTP sign-up, consent, password reset
  pages/questionnaire               # List of available themes (pagination)
  pages/q-and-a                     # Answer questions by sub-topic
  pages/mes-reponses                # Completed / in-progress answers history
  pages/notifications               # Notification history and read/unread state
  pages/admin/dashboard             # Stats cards (gender, age, ethnicity, progression)
  pages/admin/clients               # Participant CRUD + filters + pagination
  pages/admin/genrate-questionnaire # Create themes + CSV import (sub-topics/questions)
  pages/admin/thematique-details    # Theme details, response counts, per-question analysis
  pages/admin/question-details      # Detailed answers for a question
  pages/admin/create-notification   # Notification history and sending
components/                         # Navbar, footer, cards, charts, admin profile, etc.
services/                           # Auth, thematique, question, reponse, clients, notification, dashboard, translation
guards/                             # AuthGuard, AdminGuard, NoAuthGuard
interceptors/                       # AuthInterceptor (Bearer + 401/403 logout)
models/                             # Domain types (Client, Thematique, Question, Reponse, Notification…)
```

## Consumed API (summary)
- `POST /auth/login` and `/auth/admin/login` (email, mot_de_passe) → JWT + user/admin info.
- Sign-up OTP: `POST /auth/register/request-code`, `/verify-code`, `/resend-code`.
- Password reset: `POST /auth/password/forgot/{request,resend,verify,reset}`.
- Participants: `GET/POST/PUT/DELETE /utilisateurs` with pagination and filters.
- Questionnaires: `GET/POST/PUT/DELETE /thematiques`, CSV import `/thematiques/{id}/import_csv`, sub-topics `/sousthematiques/{id}/questions`.
- Questions/Answers: `/questions`, `/reponses`, user answers by sub-topic `/clients/{id}/sousthematiques/{id}/reponses`.
- Notifications: `/notifications` (admin global), `/notifications/{userId}`, mark read/unread `/notifications/{userId}/{notificationId}/{read|unread}`.
- Dashboard: `/ethnicity-distribution`, `/age-distribution`, `/thematiques/progress`.

## Deployment
- **GitHub Actions**: `.github/workflows/deploy.yml`, manual dispatch. Production build, sync `dist/sahera` to S3 (`S3_BUCKET_NAME`), CloudFront invalidation (`CLOUDFRONT_DISTRIBUTION_ID`). Required secrets: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`.
- **Docker**: `docker build -t sahera .` then `docker run -p 80:80 sahera`. Multi-stage: Node 16 builds Angular, Nginx serves the SPA (fallback via `nginx.conf`).

## Contribution notes
- Mind i18n: any new string should go through `TranslationService`.
- API calls assume backend accepts `lang` and returns ISO dates (`YYYY-MM-DD`) without timezone shifts.
- Admin and user areas are guard-protected; keep the interceptor to send JWT only to `environment.apiBase`.
- Existing unit tests are light; prefer service-level tests if you change request logic.

## Quick tour
1. Run `npm start`, open `/landingpage`, switch language, click “Sign in”.
2. Try the OTP sign-up flow (email + consent) or a direct login, then browse `/questionnaire` → pick a theme → answer in `/questionnaire/:id/:titre`.
3. Switch to admin (check “Sign in as admin”) to create/edit themes, import a CSV, send a notification, and open a question analysis.
