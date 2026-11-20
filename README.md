# PARTS HUB — MVP starter

This is a starter codebase for the PARTS HUB electronic-components inventory storefront. It is **not production-ready** and does not yet process real payments or persist product changes.

## Current contents
- Next.js App Router storefront shell with demo inventory.
- Admin route placeholder.
- PostgreSQL Prisma schema for products, images, own/consignment inventory, inventory logs, customers, orders, order items and payment records.
- Environment variable template.

## Run locally
1. Install Node.js 20+.
2. Copy `.env.example` to `.env` and set `DATABASE_URL`.
3. Run `npm install`.
4. Run `npx prisma generate`.
5. Run `npx prisma migrate dev --name init` after PostgreSQL is available.
6. Run `npm run dev` and open http://localhost:3000.

## Before production
- Implement real database-backed product APIs and admin CRUD.
- Add admin authentication (prefer a managed identity provider or secure password hashing + MFA); protect `/admin` and all mutation APIs.
- Add object-storage upload with signed URLs, MIME/type validation, size limits and malware scanning.
- Implement atomic inventory reservation and expiry/release jobs using database transactions.
- Implement WeChat Pay Native/JSAPI and Alipay PC/H5 only after the merchant account and product permissions are approved. Verify signatures, amounts, merchant IDs, timestamps and idempotency on the server. Never trust browser redirects as proof of payment.
- Add refund, order cancellation, reconciliation, audit logs, rate limiting, backups and monitoring.
- Add privacy policy, terms, sales/after-sales rules, merchant disclosure and consignment agreement workflow.
- Complete the applicable ICP filing before serving from a mainland China hosting provider. Confirm local filing requirements with the cloud provider and local communications administration.

## Data model notes
- Money is stored as integer fen (`unitPriceFen`, `totalFen`) to avoid floating-point rounding.
- Inventory distinguishes physical, reserved and sold quantities.
- `StockType` separates owned inventory (`OWN`) from consignment inventory (`CONSIGNMENT`). Supplier cost is intentionally not exposed in the public product model.
- A product can have multiple images, including product and label photos.

## Recommended launch sequence
1. Register the individual business and confirm its approved business scope and actual business address.
2. Buy the domain and launch a private/staging version.
3. Complete merchant onboarding for WeChat Pay and Alipay; confirm actual web payment products and settlement account eligibility.
4. Complete website content, legal pages and ICP filing for mainland hosting.
5. Enable public ordering only after payment callbacks and stock concurrency tests pass.

## 2026-11 development update

The storefront now reads active products from PostgreSQL (instead of hard-coded demo cards), supports PN/manufacturer search, and displays available quantity as physical minus reserved stock. The admin page supports creating products, viewing the catalogue, and soft-hiding products. Admin API requests require `x-admin-key` matching `ADMIN_API_KEY` in the server environment. This is a temporary internal access gate, **not** a substitute for production-grade user authentication, CSRF protection, role management, rate limiting, or audit logging.

New endpoints:
- `GET /api/products?q=...` public active-product listing
- `POST /api/products` create product (admin key required)
- `GET /api/admin/products` admin catalogue (admin key required)
- `PATCH /api/products/:id` update product/inventory (admin key required)
- `DELETE /api/products/:id` soft-hide product (admin key required)

See `docs/shenzhen-registration-and-deployment.md` for the Shenzhen Nanshan registration, ICP filing and cloud deployment plan. Real payment, image upload, customer checkout, order creation, Excel import/export and hardened administrator authentication are not yet implemented.


## Deploy a shareable preview on Vercel

This preview works without a database: when PostgreSQL is not configured or unavailable, the storefront displays clearly labelled sample inventory. All sample part numbers, prices and quantities are illustrative only.

1. Create a private GitHub repository named `parts-hub`.
2. Upload the contents of this project folder to the repository root.
3. Sign in to Vercel using the same GitHub account and choose **Add New → Project**.
4. Import the `parts-hub` repository and keep the detected Next.js framework and default build settings.
5. For the first visual preview, do not add payment keys or real customer data. A database is not required for the sample catalogue preview.
6. Click **Deploy**. Vercel assigns a `vercel.app` URL after a successful build.

The Vercel project and URL must be created inside the user's own account. This package cannot create or claim a Vercel URL by itself. Do not use demo data for real sales. Before real transactions, configure a production PostgreSQL database, secure admin authentication, image storage, legal pages and approved payment integrations.
