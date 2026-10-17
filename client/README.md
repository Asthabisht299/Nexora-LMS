# Nexora LMS — showcase edition

A React + Vite LMS starter refreshed with a polished, responsive student-facing landing page and an editorial visual system. The UI uses a warm off-white canvas, deep forest green, lime accents, layered cards, subtle motion, and responsive layouts.

## Run locally

```bash
npm install
npm run dev
```

If Vite reports missing native optional dependencies after installation, remove `node_modules` and `package-lock.json`, then run `npm install` again.

## What's changed

- Redesigned Nexora brand, sticky navigation, mobile menu, and page metadata.
- New responsive landing page with animated learning dashboard illustration.
- Course discovery cards with category filters, course search, pricing, instructor metadata, and navigation links.
- Learning-value section, social-proof strip, CTA, and footer.
- Hover states, entrance animations, progress animation, and reduced-motion accessibility support.
- Fixed the educator dashboard route to use the nested index route.

## Important demo note

The course cards and learner stats on the landing page are demo content for presentation purposes. They are not connected to a database or real enrolment/payment records. Existing course, player, enrolment, and educator routes remain in the project, but some of those screens are still starter placeholders and need integration with a backend.

## Suggested final-year project roadmap

1. **Authentication and roles:** student, instructor, admin; secure sessions and protected routes.
2. **Backend and database:** Node.js + Express/NestJS API, PostgreSQL with Prisma, input validation, and migrations.
3. **Course authoring:** modules, lessons, video URLs, attachments, quizzes, drafts, publishing, and instructor review.
4. **Learning experience:** resume playback, lesson completion, notes/bookmarks, progress dashboard, streaks, and certificates.
5. **Assessment:** question banks, timed quizzes, scoring, attempts, feedback, and instructor analytics.
6. **Uploads and media:** S3-compatible object storage or Cloudinary for thumbnails/resources; use a video provider rather than serving large videos directly from the app server.
7. **Payments and notifications:** payment gateway integration only after the core flow is stable; email notifications and reminders.
8. **Quality and deployment:** accessibility checks, responsive testing, loading/empty/error states, unit/API tests, environment variables, CI, and deployment.

For a manageable but impressive showcase, implement authentication, real course CRUD, enrolment/progress tracking, quizzes, and instructor analytics first. Keep secrets in environment variables and never commit `.env` files.
