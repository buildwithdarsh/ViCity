# 🏨 Hotel Booking Platform — Full Backend Development Prompt

You are an expert full-stack engineer. Build a **production-grade Hotel Booking Platform backend** following every requirement listed below. Nothing should be skipped or approximated. Every section must be implemented completely.

---

## 🧱 Tech Stack & Architecture (IMPORTANT: Make Sure All Tech is Latest as March 2026)

- **Framework**: Next.js (App Router) with API Route Handlers
- **Language**: TypeScript (strict mode, fully typed — no `any`)
- **Validation**: Zod for all request/response schemas
- **API Docs**: Swagger / OpenAPI 3.0 (auto-generated, accessible at `/api/docs`)
- **Architecture**: Modular service layer (controllers → services → repositories)
- **API Versioning**: All routes under `/api/v1/`
- **Error Handling**: Centralized error handler with consistent error shapes
- **Response Format**: Standardized API response wrapper for all endpoints:
  ```ts
  {
    success: boolean,
    message: string,
    data?: T,
    error?: { code: string, details?: any },
    meta?: { page, limit, total }  // for paginated responses
  }
  ```
- **Logging**: Request logging (method, path, status, duration) + error logging
- **Environment**: Validate all env vars at startup using Zod (fail fast if missing)

---

## 🔐 Authentication & User System

### User Roles
| Role | Access Level |
|------|-------------|
| `guest` | Unauthenticated, can browse and book |
| `user` | Registered, full booking features |
| `admin` | Manage rooms, bookings, pricing, users |
| `super_admin` | Full system access including admin management |

### Auth Features
- **Email + Password** registration and login
- **Guest checkout** — book without an account
- **Auto account creation** — after guest booking completes, prompt/create account using booking email
- **Email verification** — send verification link on registration; block login until verified
- **Password reset** — forgot password flow via email token (expire after 15 minutes)
- **JWT Authentication** — short-lived access tokens (15 min)
- **Refresh Tokens** — long-lived (7 days), rotated on use, stored securely (httpOnly cookie or DB)
- **Session management** — track active sessions per user (device, IP, last active)
- **Logout from all devices** — invalidate all refresh tokens for a user
- **Profile management** — CRUD for user profile

### User Profile Fields
```ts
{
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  country?: string
  profileImage?: string  // URL to uploaded image
  role: 'guest' | 'user' | 'admin' | 'super_admin'
  isEmailVerified: boolean
  isBlocked: boolean
  createdAt: Date
  updatedAt: Date
}
```

### Auth Endpoints
```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
POST   /api/v1/auth/logout-all
POST   /api/v1/auth/refresh-token
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password
GET    /api/v1/auth/verify-email?token=
GET    /api/v1/auth/me
PATCH  /api/v1/auth/me
POST   /api/v1/auth/guest-token         # issue temporary guest session token
```

---

## 🏠 Room & Property Management

### Room Types (Admin-Managed)
Admins create and manage room types. Supported types (not hardcoded — admin can create any):
- Single, Double, Deluxe, Suite (defaults)

#### Room Type Fields
```ts
{
  id: string
  name: string                  // e.g. "Deluxe King"
  description: string
  basePrice: number             // in smallest currency unit (paise/cents)
  maxGuests: number
  bedType: string               // e.g. "King", "Twin", "Queen"
  roomSize: number              // in sq ft or sq m
  images: string[]              // array of image URLs
  amenities: string[]           // array of amenity IDs
  status: 'active' | 'inactive'
  createdAt: Date
  updatedAt: Date
}
```

#### Room Type Endpoints
```
GET    /api/v1/room-types
POST   /api/v1/room-types                  # admin only
GET    /api/v1/room-types/:id
PATCH  /api/v1/room-types/:id              # admin only
DELETE /api/v1/room-types/:id              # admin only
POST   /api/v1/room-types/:id/images       # upload images
DELETE /api/v1/room-types/:id/images/:imageId
POST   /api/v1/room-types/:id/amenities    # assign amenities
```

---

### Room Units (Physical Rooms)

Each Room Unit is an actual bookable room linked to a Room Type.

#### Room Unit Fields
```ts
{
  id: string
  roomNumber: string            // e.g. "101", "202A"
  floor: number
  roomTypeId: string
  status: 'available' | 'occupied' | 'maintenance' | 'blocked'
  housekeepingStatus: 'clean' | 'dirty' | 'in_progress' | 'inspected'
  notes?: string
  createdAt: Date
  updatedAt: Date
}
```

#### Room Unit Endpoints
```
GET    /api/v1/rooms
POST   /api/v1/rooms                       # admin only
GET    /api/v1/rooms/:id
PATCH  /api/v1/rooms/:id                   # admin only
DELETE /api/v1/rooms/:id                   # admin only
PATCH  /api/v1/rooms/:id/housekeeping      # update housekeeping status
GET    /api/v1/rooms/:id/availability      # availability calendar for this room
```

---

## 🛎️ Amenities Management

#### Amenity Fields
```ts
{
  id: string
  name: string          // e.g. "WiFi", "Swimming Pool"
  icon?: string         // icon name or URL
  category?: string     // e.g. "connectivity", "leisure"
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
```

#### Amenity Endpoints
```
GET    /api/v1/amenities
POST   /api/v1/amenities                   # admin only
GET    /api/v1/amenities/:id
PATCH  /api/v1/amenities/:id               # admin only
DELETE /api/v1/amenities/:id               # admin only
```

Amenities are assigned to Room Types (many-to-many). Track this via a join table.

---

## 💰 Room Pricing System

Admin manages dynamic pricing rules per room type.

### Pricing Types
| Type | Description |
|------|-------------|
| `base` | Default price (from Room Type) |
| `weekend` | Fri–Sun override |
| `seasonal` | Date range-based price |
| `festival` | Specific date override (highest priority) |
| `discount` | Reduced price rule |

#### Pricing Rule Fields
```ts
{
  id: string
  roomTypeId: string
  type: 'base' | 'weekend' | 'seasonal' | 'festival' | 'discount'
  price: number
  startDate?: Date         // for date-range rules
  endDate?: Date
  daysOfWeek?: number[]    // 0=Sun, 6=Sat — for weekend rules
  minStay?: number         // minimum nights required
  maxStay?: number         // maximum nights allowed
  priority: number         // higher priority wins on conflict
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
```

#### Pricing Priority Resolution
When multiple rules apply for a date:
1. Festival pricing (highest)
2. Seasonal pricing
3. Weekend pricing
4. Base pricing (fallback)

#### Pricing Endpoints
```
GET    /api/v1/pricing?roomTypeId=&startDate=&endDate=
POST   /api/v1/pricing                     # admin only
GET    /api/v1/pricing/:id
PATCH  /api/v1/pricing/:id                 # admin only
DELETE /api/v1/pricing/:id                 # admin only
GET    /api/v1/pricing/resolve?roomTypeId=&checkIn=&checkOut=   # get effective price for dates
```

---

## 📅 Availability & Inventory Management

System must track inventory **per room type per day**.

#### Inventory Record (auto-managed, not manually created)
```ts
{
  id: string
  roomTypeId: string
  date: Date               // single calendar date
  totalUnits: number       // total physical rooms of this type
  bookedUnits: number
  heldUnits: number        // temporarily locked during checkout
  availableUnits: number   // computed: total - booked - held
  isBlocked: boolean       // admin manual block
}
```

### Rules
- Inventory is **auto-populated** when a new Room Unit is created
- **Prevent double booking**: use DB-level locking or optimistic concurrency when decrementing inventory
- **Booking Hold**: when a user begins checkout, lock inventory for 10 minutes. Release if payment not completed.
- **Calendar View**: return availability for a date range per room type

#### Availability Endpoints
```
GET    /api/v1/availability?roomTypeId=&startDate=&endDate=
GET    /api/v1/availability/calendar?startDate=&endDate=   # all room types
POST   /api/v1/availability/hold                           # lock during checkout
DELETE /api/v1/availability/hold/:holdId                   # release hold
PATCH  /api/v1/availability/block                          # admin: block dates
```

---

## 📋 Booking System

### Booking Flow
1. User searches available rooms
2. Selects room type, check-in/out dates, guests
3. System places inventory hold (10 min timer)
4. User enters guest details + applies coupon
5. Payment initiated
6. On success → booking confirmed, inventory finalized
7. On failure/timeout → hold released

#### Booking Fields
```ts
{
  id: string
  bookingReference: string          // human-readable, e.g. "HTL-20240315-8472"
  userId?: string                   // null for guest bookings
  guestDetails: {
    name: string
    email: string
    phone: string
    address?: string
    country?: string
    specialRequests?: string
  }
  roomTypeId: string
  assignedRoomIds: string[]         // actual room units assigned
  checkInDate: Date
  checkOutDate: Date
  nights: number
  guestCount: number
  baseAmount: number
  discountAmount: number
  taxAmount: number
  totalAmount: number
  couponCode?: string
  status: BookingStatus
  paymentStatus: PaymentStatus
  paymentId?: string
  notes?: string
  guestRequests?: string
  isMultiRoom: boolean
  rooms: BookingRoom[]              // for multi-room bookings
  checkedInAt?: Date
  checkedOutAt?: Date
  cancelledAt?: Date
  cancellationReason?: string
  refundAmount?: number
  createdAt: Date
  updatedAt: Date
}
```

### Booking Statuses
```
pending            → created, awaiting payment
payment_pending    → payment initiated, not confirmed
confirmed          → payment received
checked_in         → guest has arrived
checked_out        → stay completed
cancelled          → booking cancelled
refunded           → refund issued
```

### Multi-Room Booking
- Support booking multiple room types in a single transaction
- Each room in the booking has its own line-item pricing
- Single payment covers all rooms

#### Booking Endpoints
```
POST   /api/v1/bookings                             # create booking
GET    /api/v1/bookings                             # admin: list all bookings
GET    /api/v1/bookings/my                          # user: own bookings
GET    /api/v1/bookings/:id
PATCH  /api/v1/bookings/:id                         # modify booking
POST   /api/v1/bookings/:id/cancel                  # cancel booking
POST   /api/v1/bookings/:id/check-in                # admin: mark checked in
POST   /api/v1/bookings/:id/check-out               # admin: mark checked out
GET    /api/v1/bookings/:id/invoice                 # generate invoice PDF
GET    /api/v1/bookings/reference/:ref              # lookup by booking reference
```

---

## 💳 Payment Integration (Razorpay)

### Payment Flow
1. `POST /payments/create-order` → creates Razorpay order, returns `order_id`
2. Frontend completes Razorpay checkout
3. `POST /payments/verify` → verify signature, update booking status
4. Webhook `/payments/webhook` → handle async events from Razorpay

#### Payment Fields
```ts
{
  id: string
  bookingId: string
  razorpayOrderId: string
  razorpayPaymentId?: string
  razorpaySignature?: string
  amount: number
  currency: string              // e.g. "INR"
  status: 'pending' | 'paid' | 'failed' | 'refunded'
  method?: string               // card, upi, netbanking, etc.
  refundId?: string
  refundAmount?: number
  refundedAt?: Date
  failureReason?: string
  webhookEvents: WebhookEvent[]
  createdAt: Date
  updatedAt: Date
}
```

#### Payment Endpoints
```
POST   /api/v1/payments/create-order       # create Razorpay order
POST   /api/v1/payments/verify             # verify payment signature
POST   /api/v1/payments/webhook            # Razorpay webhook (no auth)
POST   /api/v1/payments/:id/refund         # admin: initiate refund
GET    /api/v1/payments                    # admin: list all payments
GET    /api/v1/payments/:id
GET    /api/v1/payments/booking/:bookingId
```

### Security
- Verify Razorpay webhook signature using `X-Razorpay-Signature` header
- Never trust client-provided payment status — always verify via API/webhook
- Idempotency: handle duplicate webhook events safely

---

## 🎟️ Coupon & Discount System

#### Coupon Fields
```ts
{
  id: string
  code: string                      // uppercase, unique
  discountType: 'percentage' | 'flat'
  discountValue: number             // % or flat amount
  maxDiscountAmount?: number        // cap for percentage discounts
  minBookingValue: number           // minimum cart total to apply
  expiryDate: Date
  usageLimit: number                // total times it can be used
  usageCount: number                // current usage
  perUserLimit: number              // max uses per user
  applicableRoomTypes?: string[]    // null = all room types
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
```

#### Coupon Endpoints
```
POST   /api/v1/coupons                     # admin only
GET    /api/v1/coupons                     # admin only
GET    /api/v1/coupons/:id                 # admin only
PATCH  /api/v1/coupons/:id                 # admin only
DELETE /api/v1/coupons/:id                 # admin only
POST   /api/v1/coupons/validate            # user: validate + preview discount
```

---

## 🔔 Notifications System

### Channels
- **Email** (required): Use Nodemailer or Resend
- **SMS** (optional): Twilio or similar
- **In-app**: Store in DB, expose via API

### Notification Templates (Email)
| Event | Recipient |
|-------|-----------|
| Booking Confirmation | User |
| Payment Receipt | User |
| Booking Reminder (24h before check-in) | User |
| Booking Cancellation | User |
| Refund Confirmation | User |
| New Booking Alert | Admin |
| Payment Received Alert | Admin |
| Booking Cancelled Alert | Admin |

#### In-App Notification Fields
```ts
{
  id: string
  userId: string
  type: NotificationType
  title: string
  body: string
  isRead: boolean
  metadata?: Record<string, any>   // bookingId, paymentId, etc.
  createdAt: Date
}
```

#### Notification Endpoints
```
GET    /api/v1/notifications                       # user: own notifications
PATCH  /api/v1/notifications/:id/read
PATCH  /api/v1/notifications/read-all
DELETE /api/v1/notifications/:id
GET    /api/v1/admin/notifications/logs            # admin: all notification logs
```

---

## 🔍 Search & Filtering System

#### Search Endpoint
```
GET /api/v1/search/rooms
```

#### Query Parameters
```ts
{
  checkIn: string           // required, ISO date
  checkOut: string          // required, ISO date
  guests: number            // required
  roomType?: string         // room type ID or name
  minPrice?: number
  maxPrice?: number
  amenities?: string[]      // comma-separated amenity IDs
  sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'popularity'
  page?: number
  limit?: number
}
```

#### Response
Return available room types with:
- Effective price for the requested date range
- Available unit count
- All amenities
- Average rating
- Min/max stay rules

---

## ⭐ Reviews & Ratings

Users can only review **after completing a stay** (status = `checked_out`).

#### Review Fields
```ts
{
  id: string
  bookingId: string         // must reference a completed booking
  userId: string
  roomTypeId: string
  rating: number            // 1–5
  title?: string
  body: string
  status: 'pending' | 'approved' | 'rejected' | 'hidden'
  adminNote?: string
  createdAt: Date
  updatedAt: Date
}
```

#### Review Endpoints
```
POST   /api/v1/reviews                             # user: submit review
GET    /api/v1/reviews?roomTypeId=                 # public: approved reviews
GET    /api/v1/reviews/my                          # user: own reviews
GET    /api/v1/admin/reviews                       # admin: all reviews
PATCH  /api/v1/admin/reviews/:id/approve
PATCH  /api/v1/admin/reviews/:id/reject
PATCH  /api/v1/admin/reviews/:id/hide
DELETE /api/v1/admin/reviews/:id
```

---

## 📊 Admin Dashboard APIs

### Overview Stats Endpoint
```
GET /api/v1/admin/dashboard/overview
```
Returns:
- Total bookings (today / this week / this month / all time)
- Total revenue (same breakdowns)
- Occupancy rate (%) per room type
- Average booking value
- Pending check-ins today
- Pending check-outs today

### Chart Data Endpoints
```
GET /api/v1/admin/dashboard/bookings-chart?period=daily|weekly|monthly
GET /api/v1/admin/dashboard/revenue-chart?period=daily|weekly|monthly&year=
GET /api/v1/admin/dashboard/occupancy-chart?startDate=&endDate=
GET /api/v1/admin/dashboard/room-type-breakdown
```

> UI Note: All charts should render with **no shadow, no gradient** — flat design only.

---

## 🛠️ Full Admin API Surface

All admin routes require `admin` or `super_admin` role.

### Booking Management
```
GET    /api/v1/admin/bookings?status=&dateFrom=&dateTo=&search=&page=&limit=
GET    /api/v1/admin/bookings/:id
PATCH  /api/v1/admin/bookings/:id/status
POST   /api/v1/admin/bookings/:id/cancel
POST   /api/v1/admin/bookings/:id/refund
POST   /api/v1/admin/bookings/:id/assign-rooms    # assign specific room units
```

### Room Management
```
# Room Types
GET/POST/PATCH/DELETE  /api/v1/admin/room-types
POST                   /api/v1/admin/room-types/:id/images

# Room Units
GET/POST/PATCH/DELETE  /api/v1/admin/rooms
PATCH                  /api/v1/admin/rooms/:id/status
PATCH                  /api/v1/admin/rooms/:id/housekeeping
```

### Pricing Management
```
GET/POST/PATCH/DELETE  /api/v1/admin/pricing
GET                    /api/v1/admin/pricing/preview?roomTypeId=&startDate=&endDate=
```

### Amenities Management
```
GET/POST/PATCH/DELETE  /api/v1/admin/amenities
```

### Coupon Management
```
GET/POST/PATCH/DELETE  /api/v1/admin/coupons
PATCH                  /api/v1/admin/coupons/:id/disable
```

### User Management
```
GET    /api/v1/admin/users?search=&role=&page=&limit=
GET    /api/v1/admin/users/:id
PATCH  /api/v1/admin/users/:id/block
PATCH  /api/v1/admin/users/:id/unblock
POST   /api/v1/admin/users/:id/reset-password
PATCH  /api/v1/admin/users/:id/role
```

### Payment Management
```
GET    /api/v1/admin/payments?status=&dateFrom=&dateTo=&page=&limit=
GET    /api/v1/admin/payments/:id
POST   /api/v1/admin/payments/:id/refund
```

### Review Moderation
```
GET    /api/v1/admin/reviews?status=pending|approved|rejected
PATCH  /api/v1/admin/reviews/:id   # approve/reject/hide
```

### Notification Logs
```
GET    /api/v1/admin/notification-logs?channel=&type=&dateFrom=&dateTo=
GET    /api/v1/admin/notification-logs/:id
```

### System Settings
```
GET    /api/v1/admin/settings
PATCH  /api/v1/admin/settings
```

System settings include:
```ts
{
  checkInTime: string           // e.g. "14:00"
  checkOutTime: string          // e.g. "11:00"
  taxRate: number               // percentage
  cancellationPolicy: string    // text/markdown
  bookingHoldMinutes: number    // default: 10
  currency: string              // e.g. "INR"
  timezone: string
  hotelName: string
  hotelAddress: string
  hotelPhone: string
  hotelEmail: string
}
```

---

## 🔒 Security Requirements

Implement all of the following:

| Security Measure | Implementation |
|-----------------|----------------|
| **Rate Limiting** | Per IP + per user. Strict on auth routes (5 req/15min), relaxed on public routes |
| **CORS** | Whitelist allowed origins via env config |
| **CSRF Protection** | CSRF tokens for state-changing requests (or use SameSite cookies) |
| **Input Sanitization** | Strip/escape all user input before DB write |
| **SQL Injection Prevention** | Use ORM parameterized queries only — never raw string interpolation |
| **XSS Protection** | Encode output, use Content-Security-Policy headers |
| **Secure Headers** | Use `helmet` or equivalent: HSTS, X-Frame-Options, X-Content-Type-Options |
| **Password Hashing** | bcrypt with salt rounds ≥ 12 |
| **Token Security** | JWT secrets via env, short expiry, rotation on refresh |
| **Webhook Verification** | Validate Razorpay signature on every webhook call |

---

## 🔧 Middleware Stack

Apply in this order:

1. **Request Logger** — log method, path, IP, timestamp
2. **Secure Headers** — helmet / custom headers
3. **CORS Handler** — allow configured origins
4. **Rate Limiter** — tiered by route group
5. **Body Parser** — with size limits (e.g. 10mb for uploads, 1mb for JSON)
6. **Authentication Middleware** — verify JWT, attach `req.user`
7. **Role Authorization Middleware** — `requireRole('admin')` guard
8. **Validation Middleware** — Zod schema validation per route
9. **Error Handler** — catch-all, format error response

---

## 📁 File Upload System

### Supported Uploads
- Room Type images (multiple)
- User profile image (single)

### Requirements
- **File type validation**: images only (jpg, jpeg, png, webp)
- **File size limit**: 5MB per file
- **Multiple upload**: up to 10 images per room type
- **Storage**: configurable via `STORAGE_PROVIDER` env:
  - `local` → save to `/public/uploads/` with unique filename
  - `cloud` → upload to AWS S3 / Cloudinary (based on env config)
- Return public URL after upload
- Delete old file when replaced

#### Upload Endpoints
```
POST   /api/v1/upload/image              # single image upload
POST   /api/v1/upload/images             # multiple images
DELETE /api/v1/upload/:fileId            # delete file
```

---

## 📈 Reporting System

Admin can generate and export reports.

### Report Types
| Report | Fields |
|--------|--------|
| **Booking Report** | Date range, bookings list, status breakdown, total count |
| **Revenue Report** | Date range, revenue by day/month, payment method breakdown |
| **Occupancy Report** | Date range, occupancy % per room type, peak dates |
| **Cancellation Report** | Date range, cancellations, cancellation reasons, refund totals |

### Export Formats
- **CSV** — via `csv-writer` or manual serialization
- **Excel (XLSX)** — via `exceljs`
- **PDF** — via `pdfkit` or `puppeteer` (html-to-pdf)

#### Report Endpoints
```
GET    /api/v1/admin/reports/bookings?startDate=&endDate=&format=json|csv|xlsx|pdf
GET    /api/v1/admin/reports/revenue?startDate=&endDate=&format=
GET    /api/v1/admin/reports/occupancy?startDate=&endDate=&format=
GET    /api/v1/admin/reports/cancellations?startDate=&endDate=&format=
```

---

## ⚙️ Background Jobs

Use a job queue (e.g., **BullMQ** with Redis, or **node-cron** for lighter tasks).

| Job | Trigger | Description |
|-----|---------|-------------|
| `send-booking-confirmation` | On booking confirm | Email + SMS to user |
| `send-payment-receipt` | On payment success | Email receipt to user |
| `send-booking-reminder` | Daily cron, 24h before check-in | Email reminder |
| `release-expired-holds` | Every minute | Release inventory holds past 10min |
| `verify-pending-payments` | Every 5 min | Re-check pending payments via Razorpay API |
| `generate-report` | On-demand via API | Generate large reports asynchronously |
| `send-admin-alerts` | On booking/cancel/payment events | Notify admins |

---

## 🗂️ Audit Logs

Track sensitive system actions. Store in `audit_logs` table.

#### Audit Log Fields
```ts
{
  id: string
  actorId: string             // user who performed the action
  actorRole: string
  action: AuditAction         // enum of action types
  resourceType: string        // e.g. "booking", "payment", "user"
  resourceId: string
  previousValue?: JSON        // snapshot before change
  newValue?: JSON             // snapshot after change
  ipAddress: string
  userAgent: string
  createdAt: Date
}
```

### Tracked Actions
- Booking: created, modified, cancelled, checked-in, checked-out
- Payment: paid, refund-initiated, refund-completed, failed
- Pricing: created, updated, deleted
- User: blocked, unblocked, role-changed, password-reset
- Admin: any destructive or financial action
- Settings: updated

#### Audit Log Endpoints
```
GET    /api/v1/admin/audit-logs?actorId=&action=&resourceType=&dateFrom=&dateTo=&page=&limit=
GET    /api/v1/admin/audit-logs/:id
```

---

## ⚡ API Performance

### Mandatory
- **Pagination**: all list endpoints must support `page` + `limit` (default 20, max 100)
- **Filtering**: all list endpoints support relevant filters via query params
- **Sorting**: key list endpoints support `sortBy` + `sortOrder`
- **Query Optimization**: use indexes on: `date` fields, `status`, `userId`, `bookingReference`, `roomTypeId`
- **Select only needed fields** — avoid `SELECT *` in DB queries

### Optional (Recommended)
- **Redis Caching**:
  - Cache room type listings (TTL: 5 min)
  - Cache availability calendar (TTL: 1 min)
  - Cache pricing resolution (TTL: 2 min)
  - Invalidate on relevant mutations
- **DB Connection Pooling**: configure pool size for production

---

## 🏥 Monitoring & Health

```
GET    /api/v1/health              # public: returns 200 if system is up
GET    /api/v1/health/detailed     # admin: DB, Redis, queue connectivity
```

### Health Response
```ts
{
  status: 'ok' | 'degraded' | 'down'
  timestamp: string
  services: {
    database: 'ok' | 'error'
    redis?: 'ok' | 'error' | 'not_configured'
    queue?: 'ok' | 'error' | 'not_configured'
    storage: 'ok' | 'error'
  }
  version: string
  uptime: number
}
```

- **Error Tracking**: integrate Sentry or equivalent (configurable via env)
- **Performance Monitoring**: log slow queries (>500ms) and slow requests (>2s)

---

## 🧪 Testing Requirements

### Coverage Target: 90%+

### Test Types

**Unit Tests** (Jest):
- All service functions tested in isolation
- Mock DB and external services
- Pricing calculation logic
- Coupon validation logic
- Availability computation

**Integration Tests** (Jest + Supertest):
- Full request/response cycle per endpoint
- Auth flows (register, login, refresh, logout)
- Booking flow end-to-end
- Payment flow with mocked Razorpay

**API Tests**:
- All endpoints tested with valid + invalid inputs
- Auth guards (unauthenticated, wrong role)
- Edge cases (double booking, expired coupon, invalid dates)

### Test Setup
- Separate test DB (SQLite in-memory or test Postgres)
- Seed scripts for test data
- CI runs all tests before merge

---

## 🚀 Deployment & DevOps

### Environment Configuration
All sensitive config must come from environment variables. Required vars:
```env
# App
NODE_ENV=
PORT=
APP_URL=
API_VERSION=v1

# Database
DATABASE_URL=

# Auth
JWT_SECRET=
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=
REFRESH_TOKEN_EXPIRES_IN=7d

# Razorpay
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

# Email
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
FROM_EMAIL=

# Storage
STORAGE_PROVIDER=local|s3|cloudinary
AWS_BUCKET=
AWS_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
CLOUDINARY_URL=

# Redis (optional)
REDIS_URL=

# Sentry (optional)
SENTRY_DSN=
```

### Production Requirements
- Structured JSON logging (no `console.log` in production)
- Graceful shutdown (drain connections on SIGTERM)
- Health check endpoint for load balancer probes
- Dockerfile with multi-stage build (dev → build → prod)
- `docker-compose.yml` for local dev (app + db + redis)

### CI/CD Pipeline (GitHub Actions or equivalent)
```
on: pull_request, push to main

jobs:
  lint → type-check → test → build → (deploy if main)
```

---

## 🖥️ Admin Screens (Required UI)

Build all admin screens as part of the Next.js application under `/admin/*` routes. All admin screens are protected — redirect to login if unauthenticated or unauthorized.

> **Design rule across ALL admin screens: No shadows, no gradients. Flat UI only.**

---

### 1. 📊 Dashboard (`/admin/dashboard`)

**Purpose**: At-a-glance overview of hotel performance.

**Components**:
- **Stats Cards Row** (top):
  - Total Bookings (today / this month)
  - Total Revenue (today / this month)
  - Current Occupancy Rate (%)
  - Average Booking Value
  - Pending Check-ins Today
  - Pending Check-outs Today
- **Daily Bookings Chart** — bar or line chart, last 30 days
- **Monthly Revenue Chart** — bar chart, last 12 months
- **Room Occupancy Graph** — per room type, current month
- **Recent Bookings Table** — last 10 bookings with status badge + link to detail

**APIs used**:
```
GET /api/v1/admin/dashboard/overview
GET /api/v1/admin/dashboard/bookings-chart
GET /api/v1/admin/dashboard/revenue-chart
GET /api/v1/admin/dashboard/occupancy-chart
```

---

### 2. 📋 Booking Management (`/admin/bookings`)

**Purpose**: View, manage, and action all hotel bookings.

**List Screen** (`/admin/bookings`):
- Searchable, filterable table of all bookings
- Filters: status, date range, room type, search by name/reference
- Columns: Booking Ref, Guest Name, Room Type, Check-in, Check-out, Amount, Status, Actions
- Pagination (20 per page default)
- Export button (CSV / Excel)

**Detail Screen** (`/admin/bookings/:id`):
- Full booking info: guest details, room assignment, dates, pricing breakdown
- Payment info with status
- Timeline of status changes
- Action buttons (based on current status):
  - **Cancel Booking** → confirmation modal + reason input
  - **Issue Refund** → modal with refund amount input (pre-filled, editable)
  - **Update Status** → dropdown: Confirmed / Checked In / Checked Out
  - **Assign Room Unit** → dropdown of available room numbers
- Booking notes and guest requests visible
- Link to payment detail

**APIs used**:
```
GET    /api/v1/admin/bookings
GET    /api/v1/admin/bookings/:id
PATCH  /api/v1/admin/bookings/:id/status
POST   /api/v1/admin/bookings/:id/cancel
POST   /api/v1/admin/bookings/:id/refund
POST   /api/v1/admin/bookings/:id/assign-rooms
```

---

### 3. 🏠 Room Management (`/admin/rooms`)

Split into two sub-sections:

#### Room Types (`/admin/rooms/types`)
- Table of all room types with: name, base price, max guests, status, # of units
- **Create Room Type** button → slide-over or page form:
  - Fields: name, description, base price, max guests, bed type, room size, status
  - **Image Upload**: drag-and-drop multi-image uploader (max 10, 5MB each)
  - **Amenities Selector**: multi-select checkbox list from amenities list
- **Edit** inline or on detail page
- **Toggle status** (active/inactive) with confirmation
- **Delete** with confirmation (only if no active bookings)

#### Room Units (`/admin/rooms/units`)
- Table: Room Number, Floor, Room Type, Status, Housekeeping Status, Actions
- **Add Room Unit** form: room number, floor, room type (dropdown), status
- **Edit** room unit details
- **Update Status**: available / maintenance / blocked
- **Update Housekeeping Status**: clean / dirty / in_progress / inspected
- Filter by floor, room type, status

**APIs used**:
```
GET/POST/PATCH/DELETE /api/v1/admin/room-types
POST                  /api/v1/admin/room-types/:id/images
GET/POST/PATCH/DELETE /api/v1/admin/rooms
PATCH                 /api/v1/admin/rooms/:id/status
PATCH                 /api/v1/admin/rooms/:id/housekeeping
```

---

### 4. 💰 Pricing Management (`/admin/pricing`)

**Purpose**: Create and manage dynamic pricing rules.

**List Screen**:
- Table of all pricing rules: room type, type, price, date range, days, min/max stay, priority, status
- Filter by room type, pricing type
- **Add Pricing Rule** button

**Create/Edit Form**:
- Fields: room type (dropdown), pricing type (base/weekend/seasonal/festival/discount)
- Price input
- Date range picker (for seasonal/festival)
- Days of week selector (for weekend rules)
- Min stay / Max stay inputs
- Priority number
- Active toggle

**Price Preview Panel**:
- Select a room type + date range
- Show resolved effective price per day in a calendar view
- Highlight which rule is active for each day

**APIs used**:
```
GET/POST/PATCH/DELETE /api/v1/admin/pricing
GET                   /api/v1/admin/pricing/preview
```

---

### 5. 🛎️ Amenities Management (`/admin/amenities`)

**Purpose**: Manage the global list of amenities.

**Screen**:
- Table/grid of amenities: icon, name, category, active status
- **Add Amenity** inline form or modal: name, icon, category, active toggle
- **Edit** in-place or modal
- **Delete** with confirmation (warn if assigned to room types)
- **Toggle active/inactive**

**APIs used**:
```
GET/POST/PATCH/DELETE /api/v1/admin/amenities
```

---

### 6. 🎟️ Coupon Management (`/admin/coupons`)

**Purpose**: Create and manage discount coupons.

**List Screen**:
- Table: code, type, value, min booking value, usage (used/limit), expiry, status
- Filter: active/inactive/expired
- **Create Coupon** button

**Create/Edit Form**:
- Fields:
  - Coupon code (auto-generate button available)
  - Discount type: Percentage / Flat
  - Discount value
  - Max discount amount (for percentage, optional cap)
  - Minimum booking value
  - Expiry date (date picker)
  - Usage limit (total)
  - Per-user limit
  - Applicable room types (multi-select, empty = all)
  - Active toggle
- Validation: code uniqueness check on blur

**Actions**:
- **Disable Coupon** (soft disable without deleting)
- **Delete Coupon** (only if never used)

**APIs used**:
```
GET/POST/PATCH/DELETE /api/v1/admin/coupons
PATCH                 /api/v1/admin/coupons/:id/disable
```

---

### 7. 👥 User Management (`/admin/users`)

**Purpose**: View and manage registered users.

**List Screen**:
- Table: name, email, phone, role, status (active/blocked), joined date, total bookings
- Search by name or email
- Filter by role, status
- Pagination

**User Detail Screen** (`/admin/users/:id`):
- Profile info display
- Booking history table (linked to booking detail)
- Action buttons:
  - **Block User** → confirmation + reason
  - **Unblock User**
  - **Reset Password** → sends reset email
  - **Change Role** → dropdown (user / admin)

**APIs used**:
```
GET    /api/v1/admin/users
GET    /api/v1/admin/users/:id
PATCH  /api/v1/admin/users/:id/block
PATCH  /api/v1/admin/users/:id/unblock
POST   /api/v1/admin/users/:id/reset-password
PATCH  /api/v1/admin/users/:id/role
```

---

### 8. 💳 Payment Management (`/admin/payments`)

**Purpose**: View all transactions and handle refunds.

**List Screen**:
- Table: payment ID, booking ref, guest name, amount, method, status, date
- Filter by status (pending/paid/failed/refunded), date range
- Search by booking ref or payment ID
- Export button

**Payment Detail Screen** (`/admin/payments/:id`):
- Full payment info: Razorpay order ID, payment ID, method, amount, currency
- Linked booking info
- Webhook events log (timestamp + event type)
- **Initiate Refund** button (if status = paid):
  - Modal: refund amount (editable, defaults to full amount), reason
  - Confirmation step before submitting

**APIs used**:
```
GET    /api/v1/admin/payments
GET    /api/v1/admin/payments/:id
POST   /api/v1/admin/payments/:id/refund
```

---

### 9. ⭐ Review Moderation (`/admin/reviews`)

**Purpose**: Approve, reject, or hide user reviews.

**Screen**:
- Tabbed view: Pending | Approved | Rejected | Hidden
- Table: reviewer name, room type, rating (stars), review snippet, booking ref, date
- **Review Detail Modal/Panel**: full review text, booking info, reviewer profile
- Action buttons per review:
  - **Approve** (when pending/rejected)
  - **Reject** + reason input
  - **Hide** (remove from public without deleting)
  - **Delete** permanently
- Bulk actions: approve all / reject selected

**APIs used**:
```
GET    /api/v1/admin/reviews
PATCH  /api/v1/admin/reviews/:id/approve
PATCH  /api/v1/admin/reviews/:id/reject
PATCH  /api/v1/admin/reviews/:id/hide
DELETE /api/v1/admin/reviews/:id
```

---

### 10. 🔔 Notification Logs (`/admin/notifications`)

**Purpose**: View history of all sent notifications.

**Screen**:
- Table: recipient, channel (email/SMS/in-app), type, subject/title, status (sent/failed), timestamp
- Filter by channel, type, date range, status
- **View Detail**: full notification body, error message if failed
- Retry button for failed notifications (optional)

**APIs used**:
```
GET /api/v1/admin/notification-logs
GET /api/v1/admin/notification-logs/:id
```

---

### 11. 📈 Reports (`/admin/reports`)

**Purpose**: Generate and download business reports.

**Screen**:
- Report type selector: Booking / Revenue / Occupancy / Cancellation
- Date range picker (start date → end date)
- Preview panel — shows summary data / table for the selected range
- Export buttons: **CSV** | **Excel** | **PDF**
- Loading state while generating large reports

**APIs used**:
```
GET /api/v1/admin/reports/bookings
GET /api/v1/admin/reports/revenue
GET /api/v1/admin/reports/occupancy
GET /api/v1/admin/reports/cancellations
```

---

### 12. ⚙️ System Settings (`/admin/settings`)

**Purpose**: Configure hotel-wide operational settings.

**Form Sections**:

**General**:
- Hotel name, address, phone, email

**Operations**:
- Check-in time (time picker)
- Check-out time (time picker)
- Booking hold duration (minutes)
- Currency
- Timezone

**Financial**:
- Tax rate (%)
- Cancellation policy (rich text / markdown editor)

**Save button** — updates all settings in one call. Show success/error toast.

**APIs used**:
```
GET   /api/v1/admin/settings
PATCH /api/v1/admin/settings
```

---

### 🔗 Admin Navigation Structure

```
/admin
├── /dashboard
├── /bookings
│   └── /:id
├── /rooms
│   ├── /types
│   └── /units
├── /pricing
├── /amenities
├── /coupons
├── /users
│   └── /:id
├── /payments
│   └── /:id
├── /reviews
├── /notifications
├── /reports
└── /settings
```

### 🎨 Admin UI Design Rules
- **No shadows** on any card, table, modal, or panel
- **No gradients** anywhere in the UI
- Flat, clean design with clear typographic hierarchy
- Use status badges with solid background colors (no opacity/blur effects)
- Consistent table layout: sortable columns, row hover highlight, action column pinned right
- Confirmation modals for all destructive actions (cancel, delete, block, refund)
- Toast notifications for success/error feedback
- Skeleton loaders (not spinners) for all async data fetches
- Mobile-responsive sidebar navigation with collapsible menu

---

## 🌟 Optional Advanced Features (Implement If Possible)

| Feature | Description |
|---------|-------------|
| **Waitlist** | When room type is fully booked, allow users to join a waitlist. Notify on cancellation. |
| **Multi-Hotel Support** | Add `hotelId` to rooms, bookings, pricing. Super admin manages all hotels. |
| **Partial Payments** | Allow split payment (e.g., 30% now, 70% at check-in) |
| **Invoice Generation** | Auto-generate PDF invoice on booking confirmation |
| **Loyalty Program** | Points per booking, tiers (Silver/Gold/Platinum), redemption |
| **Dynamic Pricing AI** | Adjust prices based on demand, occupancy trends, seasonality |
| **Multi-Language Support** | i18n for email templates and API error messages |

---

## 📂 Suggested Project Structure

```
/
├── app/
│   │
│   ├── api/                          # Backend API routes
│   │   └── v1/
│   │       ├── auth/
│   │       ├── bookings/
│   │       ├── rooms/
│   │       ├── room-types/
│   │       ├── payments/
│   │       ├── search/
│   │       ├── reviews/
│   │       ├── coupons/
│   │       ├── notifications/
│   │       ├── availability/
│   │       ├── pricing/
│   │       ├── upload/
│   │       ├── health/
│   │       └── admin/
│   │           ├── dashboard/
│   │           ├── bookings/
│   │           ├── rooms/
│   │           ├── users/
│   │           ├── payments/
│   │           ├── pricing/
│   │           ├── amenities/
│   │           ├── coupons/
│   │           ├── reviews/
│   │           ├── reports/
│   │           ├── audit-logs/
│   │           ├── notification-logs/
│   │           └── settings/
│   │
│   └── admin/                        # Admin UI pages (Next.js App Router)
│       ├── layout.tsx                # Admin shell: sidebar + topbar
│       ├── page.tsx                  # Redirect to /admin/dashboard
│       ├── dashboard/
│       │   └── page.tsx
│       ├── bookings/
│       │   ├── page.tsx              # Bookings list
│       │   └── [id]/
│       │       └── page.tsx          # Booking detail
│       ├── rooms/
│       │   ├── types/
│       │   │   └── page.tsx          # Room types list + create
│       │   └── units/
│       │       └── page.tsx          # Room units list + create
│       ├── pricing/
│       │   └── page.tsx
│       ├── amenities/
│       │   └── page.tsx
│       ├── coupons/
│       │   └── page.tsx
│       ├── users/
│       │   ├── page.tsx              # Users list
│       │   └── [id]/
│       │       └── page.tsx          # User detail
│       ├── payments/
│       │   ├── page.tsx              # Payments list
│       │   └── [id]/
│       │       └── page.tsx          # Payment detail
│       ├── reviews/
│       │   └── page.tsx
│       ├── notifications/
│       │   └── page.tsx
│       ├── reports/
│       │   └── page.tsx
│       └── settings/
│           └── page.tsx
│
├── components/
│   ├── admin/                        # Admin UI components
│   │   ├── Sidebar.tsx
│   │   ├── Topbar.tsx
│   │   ├── StatsCard.tsx
│   │   ├── DataTable.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── ConfirmModal.tsx
│   │   ├── ImageUploader.tsx
│   │   └── charts/
│   │       ├── BookingsChart.tsx
│   │       ├── RevenueChart.tsx
│   │       └── OccupancyChart.tsx
│   └── ui/                           # Shared UI primitives
│
├── lib/
│   ├── services/
│   ├── repositories/
│   ├── middleware/
│   ├── validators/
│   ├── jobs/
│   ├── email/
│   ├── storage/
│   ├── payments/
│   └── utils/
│
├── prisma/ (or drizzle/)
│   └── schema.prisma
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── fixtures/
│
├── .env.example
├── Dockerfile
├── docker-compose.yml
└── openapi.yaml
```

---

## ✅ Definition of Done

The platform is complete when:

**Backend API**
- [ ] All endpoints listed above are implemented and documented in Swagger
- [ ] All request/response types are fully validated with Zod
- [ ] Authentication and role-based access control works on every protected route
- [ ] Booking flow prevents double-booking under concurrent requests
- [ ] Razorpay integration handles create, verify, webhook, and refund
- [ ] All notification emails send correctly for every trigger event
- [ ] SMS notifications are wired up (or cleanly stubbed with env flag)
- [ ] In-app notifications stored and exposed via API
- [ ] Admin dashboard returns accurate real-time stats and chart data
- [ ] Search & filtering returns correct availability with pricing applied
- [ ] Reports export correctly in CSV, XLSX, and PDF for all 4 report types
- [ ] Background jobs run reliably and don't block the main thread
- [ ] Inventory hold releases automatically after 10 minutes
- [ ] All audit-loggable actions are recorded with before/after snapshots
- [ ] File upload works for room images (multi) and user profile image (single)
- [ ] Both local and cloud storage providers work based on env config

**Admin UI Screens**
- [ ] All 12 admin screens are built and match the spec
- [ ] Dashboard stats cards and all 3 charts render correctly (no shadow, no gradient)
- [ ] Booking management: list, detail, cancel, refund, status update, room assign all work
- [ ] Room Types: CRUD + multi-image upload + amenity assignment works
- [ ] Room Units: CRUD + status + housekeeping status update works
- [ ] Pricing: rule CRUD + price preview calendar resolves correctly
- [ ] Amenities: full CRUD with active toggle
- [ ] Coupons: full CRUD + validate endpoint + disable action
- [ ] Users: list + detail + block/unblock + role change + password reset
- [ ] Payments: list + detail + refund modal with editable amount
- [ ] Reviews: tabbed moderation + approve/reject/hide/delete + bulk actions
- [ ] Notification logs: filterable list + detail view
- [ ] Reports: all 4 types + preview + CSV/Excel/PDF export
- [ ] Settings: all fields save correctly and reflect across the system
- [ ] All destructive actions have a confirmation modal
- [ ] All admin routes redirect to login if unauthenticated

**Quality & DevOps**
- [ ] Test coverage is ≥ 90%
- [ ] App passes `tsc --noEmit` with zero errors
- [ ] App runs in Docker with `docker-compose up`
- [ ] CI pipeline passes (lint + typecheck + tests + build)
- [ ] `.env.example` is complete and documents every variable