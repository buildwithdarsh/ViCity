# ViCity - Hotel Booking Platform Implementation Plan

## Tech Stack (Latest as of March 2026)

| Technology | Version | Purpose |
|---|---|---|
| Next.js | 16.1 | Framework (App Router) |
| TypeScript | 5.x (strict) | Language |
| Prisma | 7.2 | ORM (Rust-free, TypeScript-native) |
| Zod | 4.3 | Validation |
| BullMQ | 5.70 | Background jobs (Redis-backed) |
| Razorpay SDK | 2.9.6 | Payment gateway |
| Resend | 6.9 | Email delivery |
| next-swagger-doc | latest | Auto-generated Swagger docs |
| bcrypt | latest | Password hashing |
| jose | latest | JWT handling |
| Redis | - | Caching + job queue |
| PostgreSQL | - | Primary database |

---

## Phase 1: Project Setup & Configuration
- Initialize Next.js 16.1 project with TypeScript strict mode
- Configure tsconfig.json, ESLint, Prettier
- Set up env validation with Zod 4 (fail-fast on missing vars)
- Create .env.example with all required vars
- Set up docker-compose.yml (app + PostgreSQL + Redis)
- Create Dockerfile with multi-stage build
- Set up project folder structure per the spec

## Phase 2: Database Schema & ORM (Prisma 7)
- Install Prisma 7.2, configure prisma/schema.prisma
- Define all models: User, Session, RoomType, RoomUnit, Amenity, RoomTypeAmenity (join), PricingRule, Inventory, Booking, BookingRoom, Payment, WebhookEvent, Coupon, CouponUsage, Notification, Review, AuditLog, SystemSettings
- Add indexes on: date fields, status, userId, bookingReference, roomTypeId
- Run initial migration
- Create seed script for test data (default room types, amenities, admin user)

## Phase 3: Core Infrastructure
- Standardized API response wrapper (ApiResponse<T>)
- Centralized error handler with consistent error shapes + error codes
- Middleware stack (in order): request logger, secure headers, CORS, rate limiter, body parser, auth, role guard, Zod validation
- Request logging (method, path, status, duration) - structured JSON
- Repository pattern base classes

## Phase 4: Authentication & User System
- Registration, login (email+password), bcrypt (salt rounds 12)
- Email verification flow (token-based)
- JWT access tokens (15min) + refresh tokens (7d, rotated, httpOnly cookie)
- Session management (device, IP, last active)
- Logout + logout-all (invalidate refresh tokens)
- Forgot password / reset password (15min token expiry)
- Guest token endpoint
- Profile CRUD (GET/PATCH /auth/me)
- All auth endpoints under /api/v1/auth/

## Phase 5: Room & Property Management
- Room Types: full CRUD, image management, amenity assignment (many-to-many)
- Room Units: CRUD, status management, housekeeping status, availability calendar
- Amenities: CRUD with category, icon, active toggle
- Admin-only guards on write operations

## Phase 6: Pricing & Availability
- Pricing rules: base, weekend, seasonal, festival, discount - with priority resolution
- Price resolver: given roomTypeId + date range, return effective per-night price
- Inventory system: auto-populate on room unit creation, track total/booked/held/available per room type per day
- Booking hold: lock inventory for 10min during checkout, auto-release via BullMQ job
- Availability endpoints: calendar view, hold/release, admin block dates
- DB-level locking to prevent double booking

## Phase 7: Booking System
- Full booking flow: search -> select -> hold -> guest details -> coupon -> payment -> confirm
- Booking reference generation (HTL-YYYYMMDD-XXXX)
- Multi-room booking support (single transaction, per-room line items)
- Status transitions: pending -> payment_pending -> confirmed -> checked_in -> checked_out / cancelled / refunded
- Check-in / check-out operations (admin)
- Invoice generation endpoint
- Lookup by reference

## Phase 8: Payment Integration (Razorpay)
- Create Razorpay order -> return order_id
- Verify payment signature
- Webhook handler (verify X-Razorpay-Signature, idempotent)
- Refund flow (admin)
- Payment records with webhook event log
- Never trust client-provided payment status

## Phase 9: Coupon & Discount System
- Coupon CRUD (admin)
- Validation endpoint: check code validity, preview discount amount
- Rules: expiry, usage limit, per-user limit, min booking value, applicable room types
- Apply at booking time, decrement usage count

## Phase 10: Notifications
- Email via Resend: booking confirmation, payment receipt, 24h reminder, cancellation, refund, admin alerts
- In-app notifications: store in DB, expose via API (list, mark read, read-all, delete)
- Notification logs for admin (all channels, status, error tracking)
- Email templates for each event type

## Phase 11: Search & Reviews
- Search endpoint: filter by dates, guests, room type, price range, amenities, sort options, pagination
- Returns effective pricing, availability count, average rating
- Reviews: submit (only after checked_out), public listing (approved only), moderation (approve/reject/hide/delete)

## Phase 12: Admin Dashboard & Reports
- Dashboard: overview stats, bookings chart, revenue chart, occupancy chart, room type breakdown
- Reports: booking, revenue, occupancy, cancellation - with CSV/XLSX/PDF export
- Audit logs: track all sensitive actions with before/after snapshots
- Full admin API surface for bookings, rooms, users, payments, pricing, amenities, coupons, reviews, notifications, settings

## Phase 13: File Upload & Background Jobs
- Uploads: single/multi image, file type validation (jpg/png/webp), 5MB limit, configurable storage (local/S3/Cloudinary)
- BullMQ jobs: send-booking-confirmation, send-payment-receipt, send-booking-reminder (daily cron), release-expired-holds (every 1min), verify-pending-payments (every 5min), generate-report, send-admin-alerts

## Phase 14: Admin UI (12 Screens)
- Dashboard, Booking Management, Room Management (Types + Units), Pricing, Amenities, Coupons, Users, Payments, Reviews, Notifications, Reports, Settings
- Design rules: no shadows, no gradients, flat UI, skeleton loaders, confirmation modals, toast notifications, responsive sidebar
- Charts library (Recharts) - flat design only
- DataTable component with sorting, filtering, pagination, export

## Phase 15: Security, Health, Testing & DevOps
- Security: rate limiting (tiered), CORS, CSRF, input sanitization, secure headers (helmet), XSS protection, CSP
- Health endpoints: /health (public) + /health/detailed (admin)
- Testing: Jest + Supertest, unit + integration + API tests, 90%+ coverage target, test DB setup
- CI/CD: GitHub Actions (lint -> type-check -> test -> build -> deploy)
- Monitoring: Sentry integration, slow query/request logging
- Graceful shutdown on SIGTERM

---

## Key Architectural Decisions
1. Prisma 7 over Drizzle - TypeScript-native runtime, faster type generation, mature ecosystem
2. Resend over Nodemailer - cleaner API, React email templates support, better DX
3. BullMQ for jobs - proven Redis-backed queue, supports cron, retries, concurrency
4. next-swagger-doc for API docs - auto-generates from JSDoc annotations in route handlers
5. jose for JWT - Edge-compatible, no native dependencies (works well with Next.js)

---

## Sources
- Next.js 16.1: https://nextjs.org/blog/next-16-1
- Prisma 7: https://www.prisma.io/blog/announcing-prisma-orm-7-0-0
- Zod 4: https://zod.dev/v4
- BullMQ: https://www.npmjs.com/package/bullmq
- Razorpay Node.js SDK: https://www.npmjs.com/package/razorpay
- Resend: https://resend.com/docs/send-with-nodejs
- next-swagger-doc: https://www.npmjs.com/package/next-swagger-doc
