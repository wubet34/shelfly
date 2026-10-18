# Shelfly · Electronics Distribution Manager

Responsive inventory and sales management for electronics retailers. The React client supports a local fictional demo in development and authenticated server data when the API is configured.

## Requirements

- Node.js 20.19+ or 22.12+ (Vite 8)
- PostgreSQL 14+

## Start the API

```sh
cd server
cp .env.example .env
# Edit .env and set DATABASE_URL and a private SEED_OWNER_PASSWORD (12+ characters)
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

The development seed refuses to run with `NODE_ENV=production`. It creates the owner account and business only; it does not insert invented product or transaction records. Keep `.env` private.

## Start the client

In another terminal:

```sh
cd client
npm install
npm run dev
```

By default the client calls `http://localhost:3001/api`. Set `VITE_API_URL` to the API origin (without `/api`) when it runs elsewhere. Without an API session, development builds offer a fictional local demo. Production builds only show the real sign-in form.

## Included workflows

- Owner and employee sign-in with server-side PostgreSQL sessions, HTTP-only SameSite cookies, CSRF checks, and throttled login attempts.
- Business-scoped product inventory with search, SKU/category filtering, stock thresholds, add/edit, and atomic stock deduction at checkout.
- Customer directory, customer selection for credit sales, outstanding balances, sales history, and payment methods.
- Owner-only expense tracking, employee account creation, business settings, and financial dashboard aggregates.
- Employee product lookup, checkout, and their own recorded sales; owner costs, expenses, reports, customers' balances, and administration are restricted by the API.

The server applies ordered, tracked SQL migrations from `server/src/db/migrations`; feature routers are mounted under `/api`. Existing tables and records are preserved. Configure `CLIENT_ORIGIN` with the exact frontend origin. In production, use HTTPS, set `NODE_ENV=production`, and configure PostgreSQL SSL with `PGSSL=true` where required.

Checkout requires an `Idempotency-Key`, locks inventory rows in product ID order, calculates ETB totals using integer cents, and writes the sale, immutable line snapshots, stock deductions, customer credit balance, audit entry, and inventory movement in one transaction. Retry the same checkout request with the same key to receive the original sale.

The Reports screen shows basic sales and inventory totals. Inventory, sales, expenses, and summary reports can be downloaded as CSV files. The Help panel contains in-app workflow guidance and keyboard shortcuts.

## Verify

```sh
cd client && npm run lint && npm run build
cd ../server && npm test
for file in $(find src -name '*.js'); do node --check "$file"; done
```

The server starts with `npm start` or `npm run dev`. Database-backed smoke checks and migration execution require a reachable PostgreSQL instance and seeded owner credentials.
