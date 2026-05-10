> This project is made with the help of Claude (1M context).

# ViCity — Hotel Booking Platform

A production-grade hotel booking platform built with Next.js App Router, Prisma, and PostgreSQL.

## Tech Stack

| Technology | Purpose |
|---|---|
| Next.js 16.1 | Full-stack framework (App Router) |
| TypeScript 5.x | Language (strict mode) |
| Prisma 7.2 | ORM |
| PostgreSQL 17 | Primary database |
| Redis 7 | Caching & job queues |
| BullMQ 5.70 | Background jobs |
| Razorpay | Payment gateway |
| Resend | Email delivery |
| Zod 4.3 | Validation |
| Tailwind CSS 4 | Styling |

## Prerequisites

- Node.js 22+
- Docker & Docker Compose (for PostgreSQL and Redis)

## Getting Started

1. **Clone and install:**
   ```bash
   git clone <repo-url>
   cd vicity
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

3. **Start databases:**
   ```bash
   docker compose up -d
   ```

4. **Set up the database:**
   ```bash
   npm run db:generate
   npm run db:migrate
   npm run db:seed
   ```

5. **Run the development server:**
   ```bash
   npm run dev
   ```

   The app runs at [http://localhost:6912](http://localhost:6912). API docs are available at `/api/docs/ui`.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server (port 6912, Turbopack) |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run type-check` | TypeScript type checking |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Run database migrations |
| `npm run db:push` | Push schema changes (no migration) |
| `npm run db:seed` | Seed database with test data |
| `npm run db:studio` | Open Prisma Studio |
| `npm test` | Run tests |
| `npm run test:coverage` | Run tests with coverage |

## Project Structure

```
app/
├── (site)/          # Public-facing pages (home, rooms, booking, auth)
├── admin/           # Admin dashboard
└── api/             # API route handlers (versioned under /api/v1/)
lib/
├── services/        # Business logic layer
├── middleware/       # Auth, rate limiting, validation
├── validators/      # Zod schemas
└── utils/           # Shared utilities
prisma/
├── schema.prisma    # Database schema
└── seed.ts          # Seed script
docs/
├── requirements/    # PRD, BRD, specs
├── architecture/    # Implementation plan, tech decisions
└── reference/       # Feature list, audit reports
```

## Docker

**Development:**
```bash
docker build --target development -t vicity-dev .
```

**Production:**
```bash
docker build --target production -t vicity .
```

## Documentation

- [Requirements Spec](docs/requirements/requirement.md)
- [Implementation Plan](docs/architecture/plan.md)
- [Feature List](docs/reference/feature-list.md)
