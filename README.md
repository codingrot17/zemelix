# Zemelix

**Zemelix** is a multi-vendor marketplace that brings product discovery, service requests, and vendor storefronts into one application. Buyers can discover products and services, place product orders, and request service bookings. Vendors can create a business presence and manage the transactions relevant to their business model.

> **Project status:** MVP in active development. This document describes the implementation on `mvp-development`. Features described as partial, planned, or unverified should not be assumed production-ready. The repository's stable `appwrite` branch is intentionally not the target for ongoing MVP development.

## Contents

- [Product overview](#product-overview)
- [Vendor types and transaction models](#vendor-types-and-transaction-models)
- [Technology stack](#technology-stack)
- [Architecture](#architecture)
- [Repository structure](#repository-structure)
- [Prerequisites](#prerequisites)
- [Local development setup](#local-development-setup)
- [Environment configuration](#environment-configuration)
- [Core modules](#core-modules)
- [Data model](#data-model)
- [Security and data integrity](#security-and-data-integrity)
- [Build, lint, and deployment](#build-lint-and-deployment)
- [Feature status](#feature-status)
- [Known limitations and roadmap](#known-limitations-and-roadmap)
- [Contributing](#contributing)

## Product overview

Zemelix is intended for:

- **Buyers/customers** who want to find products, contact sellers, and request services.
- **Product sellers** who need a storefront, product catalogue, inventory, order tracking, and buyer leads.
- **Service providers** who offer bookable services and need to manage booking requests.
- **Digital creators and wholesalers** whose business models may require digital delivery, wholesale pricing, or quote-based transactions.
- **Other vendors** whose offers do not fit the primary product or service categories.
- **Administrators/support staff** who oversee marketplace records, user activity, feedback, reviews, testimonials, and support workflows.

The application includes a public landing page, collection/category discovery, product and seller pages, authentication, vendor onboarding, customer and vendor dashboards, administrative pages, and an Appwrite-backed data layer.

## Vendor types and transaction models

The canonical vendor capability definitions live in `client/src/types/vendor.ts`. Vendor type is distinct from the legacy product field `Product.vendorType`, which currently uses `seller` or `service`.

| Vendor type | Intended listing type | Transaction model | Capability notes |
|---|---|---|---|
| `product-seller` | Physical product | Retail order | Inventory enabled |
| `service-provider` | Service | Booking request | Booking support enabled |
| `digital-creator` | Digital product | Digital purchase | Digital delivery capability defined |
| `wholesaler` | Wholesale product | Wholesale order or quote request | Inventory and wholesale-pricing capabilities defined |
| `other` | Other offer | Quote request | Generic offer model |

The capability map defines the intended model. It does **not** by itself confirm that every digital-delivery, wholesale, or quote workflow is fully implemented end to end.

## Technology stack

| Area | Technology | Role |
|---|---|---|
| Front end | React 19, TypeScript | Component-based application and type checking |
| Build/dev server | Vite 6 | Local development and production bundling |
| Routing | React Router 7 | Public, authentication, and dashboard routes |
| Styling | Tailwind CSS 4, `@tailwindcss/vite`, CSS variables | Responsive styles and theme tokens |
| UI primitives | Radix UI packages, custom components | Accessible interactive UI primitives |
| Forms and validation | React Hook Form, Zod, `@hookform/resolvers` | Form state and schema validation |
| Server state | TanStack Query | Query/cache utilities where adopted |
| Icons and motion | Lucide React, React Icons, Framer Motion | Icons and interface animation |
| Charts | Recharts | Dashboard data visualizations |
| Backend platform | Appwrite Cloud, Appwrite JavaScript SDK | Authentication, database documents, file storage, and Functions |
| Appwrite Function runtime | Node.js with `node-appwrite` | Server-side validation and privileged workflows |
| Hosting/build delivery | Vercel | Front-end deployment and preview/production builds |
| Quality tooling | TypeScript, ESLint, Playwright dependency | Static checks and browser-testing tooling; actual test scripts are not defined in the package scripts |

Versions are managed in `client/package.json`; consult that file for the current dependency ranges.

## Architecture

At a high level:

1. **React application** starts in `client/src/main.tsx`, loads global CSS, and renders `App`.
2. **Application providers and routes** are composed in `client/src/App.tsx`. `AuthProvider` supplies authentication context, and `AppRoutes` declares route/page composition.
3. **Pages and shared components** render public discovery, forms, product/service details, and role-specific dashboards.
4. **Appwrite client modules** in `client/src/lib/appwrite/` wrap the Appwrite SDK for account/session operations, database/profile access, and file storage. `client/src/lib/appwrite.ts` provides a backward-compatible facade.
5. **Appwrite Cloud** holds authentication, database collections/tables, and storage buckets. Their IDs are configured through environment variables.
6. **Appwrite Functions** handle server-side workflows that should not trust client-supplied identity or transaction details. The existing `public-seller-profile` function includes seller-profile/public marketplace operations and server-side order/booking/lead-related workflows.
7. **Vercel** builds and hosts the front-end application. Appwrite must be configured separately; deploying the front end does not automatically create the required Appwrite database schema, permissions, bucket, or Function deployment.

The precise production routing, Function deployment configuration, and every Appwrite schema/permission setting are external configuration and must be checked in the corresponding Appwrite/Vercel projects.

## Repository structure

The following paths are confirmed in the repository; this is a guide to major areas rather than an exhaustive file inventory.

```text
zemelix/
├── client/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── eslint.config.js
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── index.css
│       ├── routes/
│       │   └── AppRoutes.tsx
│       ├── contexts/
│       │   └── AuthContext
│       ├── components/
│       │   ├── layouts/
│       │   └── features/
│       ├── pages/
│       │   ├── home/
│       │   ├── auth/
│       │   ├── collections/
│       │   ├── product/
│       │   ├── seller/
│       │   └── dashboard/
│       │       ├── admin/
│       │       ├── seller/
│       │       ├── customer/
│       │       └── user/
│       ├── lib/
│       │   └── appwrite/
│       │       ├── client.ts
│       │       ├── account.ts
│       │       ├── database.ts
│       │       └── storage.ts
│       └── types/
│           ├── user.ts
│           ├── product.ts
│           └── vendor.ts
└── functions/
    └── public-seller-profile/
        ├── package.json
        └── src/
            └── index.js
```

**Folder note:** Some Appwrite, Vercel, and repository-level configuration may be maintained in the hosting consoles rather than committed to this repository. The tree above intentionally does not imply that unverified configuration files exist.

## Prerequisites

- Node.js and npm compatible with the current Vite/tooling dependency requirements.
- Git.
- Access to an Appwrite project configured for this application.
- An Appwrite database with the required collections/tables, attributes, indexes, permissions, and storage bucket.
- A Vercel project/account only if you intend to deploy using the existing hosting setup.

The exact supported Node.js version is **not declared in the inspected package metadata**. Use a currently supported Node.js LTS release compatible with the installed Vite and TypeScript versions.

## Local development setup

1. Clone the repository and switch to the development branch:

   ```bash
   git clone https://github.com/codingrot17/zemelix.git
   cd zemelix
   git switch mvp-development
   ```

2. Install front-end dependencies:

   ```bash
   cd client
   npm install
   ```

3. Create a local environment file at `client/.env.local` (or another Vite-supported local env file) and set the required variables listed below. Do not commit environment files.

4. In Appwrite, confirm the project endpoint, project ID, database ID, user collection ID, storage bucket ID, collection schemas, permissions, and deployed Function configuration.

5. Start the development server:

   ```bash
   npm run dev
   ```

   Vite prints the local URL in the terminal (typically `http://localhost:5173`).

6. Before submitting changes, run:

   ```bash
   npm run lint
   npm run build
   ```

These commands cover the front-end package. The Function has its own `package.json`; no dedicated Function test or deploy script was confirmed in the inspected files.

## Environment configuration

The following front-end variables are referenced directly by `client/src/lib/appwrite/client.ts`. The project ID, database ID, user collection ID, and storage bucket ID are required at startup. The endpoint has a default value in code.

| Variable | Required? | Purpose |
|---|---|---|
| `VITE_APPWRITE_ENDPOINT` | Optional in code | Appwrite API endpoint; defaults to `https://cloud.appwrite.io/v1` |
| `VITE_APPWRITE_PROJECT_ID` | Yes | Appwrite project identifier |
| `VITE_APPWRITE_DB_ID` | Yes | Appwrite database identifier |
| `VITE_APPWRITE_USER_COLLECTION_ID` | Yes | User-profile collection/table identifier |
| `VITE_APPWRITE_STORAGE_BUCKET_ID` | Yes | Storage bucket identifier |

Only variable names are documented here; **never place real values, API keys, tokens, or other secrets in README files or source control**.

The Function's runtime configuration also needs the correct Appwrite endpoint, project, database, collection identifiers, and server-side authentication/secret configuration. Its complete environment-variable contract was not exhaustively verified during this README pass. Confirm the exact variable names in the deployed Function configuration and Function source before deployment; do not infer them from the front-end variables.

## Core modules

### Authentication and email verification

- Authentication is implemented with Appwrite Account APIs.
- `client/src/lib/appwrite/account.ts` contains registration, email/password session creation, current-session/account lookup, session refresh/deletion, and email-verification helpers.
- Registration creates the Appwrite account, starts a session, and initializes the user profile. If profile initialization fails, the newly created session is removed before the error is propagated.
- Email verification uses Appwrite's verification flow and a caller-supplied redirect URL.
- `AuthProvider` and route composition connect authentication state to the React application.

**Configuration note:** Email delivery, allowed redirect URLs, and verification templates must be configured in Appwrite. Successful delivery depends on that project configuration.

### Vendor onboarding and profile

- The canonical vendor types and capability mapping are in `client/src/types/vendor.ts`.
- Profile fields include identity/contact details and business metadata such as `vendorType`, `businessCategory`, `businessName`, `businessDescription`, `logo`, `coverImage`, `slogan`, `socialLinks`, `primaryColor`, and `onboardingStep`.
- User profile conversion and persistence are handled through the Appwrite database module.
- The product's vendor types are intended to support product sellers, service providers, digital creators, wholesalers, and other vendors.

Vendor approval and activation behavior depends on stored profile fields and Function checks. Do not change vendor/account status values merely to make a test pass.

### Products, services, and storefronts

- Product data is represented in `client/src/types/product.ts`.
- A product includes an ID, title, descriptions, image URL, price, stock, rating, category, tags/badge/featured metadata, status, legacy listing type, and seller identity/contact fields.
- Product and service detail pages support discovery and vendor contact/action flows.
- Public seller storefronts are implemented under `client/src/pages/seller/`.
- In the current legacy product model, `vendorType` is `seller` or `service`; this should not be confused with the five onboarding-level vendor types.

### Cart and product orders

- The customer shopping flow supports adding physical products to a cart and placing product orders.
- Seller dashboards include order-related management; customer dashboards include order history.
- Multi-seller order/lead work has been developed, but exact checkout atomicity, payment processing, and production transaction guarantees were not confirmed by this documentation review.
- A contact/lead action must not be treated as a purchase or change inventory unless an explicit purchase workflow does so.

**Payments:** A production payment provider and complete payment-settlement flow were not confirmed in the inspected source. Do not represent the application as processing online payments unless a separate verified integration exists.

### Service booking

- Service listings use a booking-request flow rather than the product add-to-cart action.
- The existing `public-seller-profile` Function validates booking requests, checks that the requested date/time is in the future, verifies provider/service records, and stores a booking with buyer/provider/service references and snapshots of service title and price.
- Booking fields include requested date/time, customer contact details, optional service mode/location/notes, status, and lifecycle timestamps.
- The Function defines booking statuses: `requested`, `accepted`, `declined`, `cancelled`, `completed`, `no_show`, and `expired`.
- Customer and provider dashboards expose booking-related views and status/history handling.

Provider capacity, availability calendars, conflict prevention, and automated expiry behavior require separate verification; a date/time field and status list do not by themselves guarantee full scheduling.

### Leads and WhatsApp contact

- Product contact flows can create a lead and then open WhatsApp with a prefilled message.
- Lead records are intended to let sellers track buyer enquiries and their follow-up status.
- Lead contact should not create a completed purchase or decrement stock.
- Archive/restore behavior was implemented so archived leads leave the active list and can be restored without losing their contacted status.

The exact lead schema, all status transitions, and permission matrix should be validated against the deployed Appwrite database and Function before production rollout.

### Dashboards and access by role

The route tree includes dashboard areas for customers/users, sellers/providers, and administrators.

- **Customer:** overview/activity, orders, bookings, favorites, profile, notifications, wallet, settings, and feedback-related pages/routes.
- **Seller/provider:** product and service management, orders, bookings, analytics, profile, notifications, and settings.
- **Admin:** user, order, product, analytics, report, marketing, notification, finance, settings, feedback, testimonial, review, and support pages.

The presence of a page or route does not prove every underlying workflow is complete. Some customer account areas have previously been identified as placeholders/coming-soon; verify the live implementation before describing each as fully functional.

Role-appropriate navigation and direct-route guards should be tested together with Appwrite permissions. Front-end route guards are not a substitute for server/database authorization.

The shared dashboard shell and footer use theme tokens. Customer/seller dashboard cards and selected order/support views have received responsive and dark-mode adjustments. Full cross-page visual validation at every viewport remains a separate QA task.

### Collections, categories, and landing page

- The landing page is the public entry point and provides marketplace positioning and routes into discovery/authentication.
- Collection listing and single-collection pages live in `client/src/pages/collections/`.
- The page metadata in `client/index.html` includes title, description, Open Graph, and Twitter card tags.
- Category/business taxonomy is intended to be data-driven; verify the configured Appwrite data and live filtering behavior before assuming every category or filter is populated.
- Dynamic social metadata for every individual product/store URL has not been confirmed in this review.

### Ratings, testimonials, feedback, and support

Admin routes exist for review moderation, testimonial management, feedback, and support. Previous development work also added rating/review capabilities, vendor replies/rollups, feedback/complaint submission, and a customer support modal with quick answers. The full production permissions, moderation edge cases, and authenticated end-to-end coverage were not independently audited as part of this README update.

## Data model

Zemelix uses Appwrite database documents/collections (Appwrite may label these as tables depending on the database API/version). The application expects its schema to exist in the Appwrite project; the front-end repository does not serve as a complete schema migration.

### Core entities and relationships

| Entity | Known fields/relationship | Notes |
|---|---|---|
| **User profile** | Profile document ID aligns with Appwrite user identity; email, full name, role, account status, phone/country, vendor type, business metadata, onboarding and vendor status fields | User collection ID is configured by `VITE_APPWRITE_USER_COLLECTION_ID`. |
| **Product/listing** | `sellerId` references the vendor profile; title, description, price, stock, category, rating, status, legacy `vendorType` | The client type is in `client/src/types/product.ts`. Service listings use the legacy `service` value. |
| **Order** | Order workflow associates buyer/customer and seller/listing data | Function source refers to the `orders` collection. Exact deployed schema and item-level relationships need confirmation. |
| **Booking** | `buyerId`, `providerId`, `serviceId`, title/price snapshots, requested date/time, customer details, status, lifecycle timestamps | Function source uses the `bookings` collection and assigns read access to buyer and provider. |
| **Lead** | Buyer enquiry associated with a seller and product/listing, plus follow-up/archive state | Exact collection ID and complete attribute list were not fully confirmed in this review. |
| **Review/rating** | Rating/review associated with a marketplace listing/vendor and reviewer | Exact deployed schema and verified-purchase enforcement must be confirmed in Appwrite. |
| **Feedback/support ticket** | Submission by a customer or vendor, with category/priority and support status | Full schema and permissions should be checked against deployed configuration. |
| **Testimonial** | Public-facing testimonial with administrative moderation | Exact collection/table ID and schema require confirmation. |
| **Storage file** | File ID stored/referenced by a profile or listing; bucket ID is environment-configured | Upload helper applies owner update/delete permissions and can optionally grant public read. |

### Relationship summary

- A **user profile** represents a buyer and may also carry vendor/business information.
- A **vendor profile** can own multiple listings.
- A **buyer** can have multiple orders, booking requests, leads/interactions, reviews, and feedback submissions.
- A **service booking** references one buyer, one provider profile, and one service listing.
- An **order** relates a buyer to purchased listing(s) and seller(s); the exact current order-to-item cardinality should be checked in the Appwrite schema.
- **Storage files** are referenced by their file IDs and are governed by bucket/file permissions.

This is a code-informed logical model, not a replacement for a schema export. Confirm attribute types, required fields, indexes, relationship rules, and document-level permissions in Appwrite before creating or modifying a production database.

## Security and data integrity

- Keep server-only credentials out of `VITE_*` variables. Vite-exposed variables are bundled for the browser and must never contain secrets.
- Keep local environment files out of version control.
- Use Appwrite document and storage permissions as the authorization boundary; validate access in Functions as well as the UI.
- Derive the acting customer identity from the authenticated Appwrite request context on the server. Do not trust a client-provided customer ID.
- Reload authoritative product/service title and price data server-side when creating transaction records rather than trusting browser-submitted values.
- A WhatsApp contact/lead action must not modify inventory.
- Do not weaken account/vendor status checks or permissions to make a workflow pass.
- Use snapshot fields for historical transaction details where the implementation already stores them.
- Review rate limits, abuse prevention, error logging, data retention, and privacy obligations before a broad public launch.

These are implementation constraints and recommended operating rules, not a claim that every production threat scenario has been fully audited.

## Build, lint, and deployment

Run commands from the `client/` directory.

| Command | Purpose |
|---|---|
| `npm install` | Install front-end dependencies |
| `npm run dev` | Start Vite development server |
| `npm run build` | Run TypeScript project builds and create the Vite production bundle |
| `npm run lint` | Run ESLint |
| `npm run preview` | Serve the built bundle locally for preview |

No `test` script is declared in `client/package.json`. Playwright and Vitest-related packages are dependencies, but their presence alone does not establish that a maintained automated test suite exists.

### Front-end deployment

The project is associated with Vercel. Confirm the intended Vercel project, production branch, build root, environment variables, and output settings before deployment. Based on the package scripts, the front-end build command is:

```bash
npm run build
```

The Vite project is inside `client/`; configure Vercel's root/build settings accordingly for the repository layout. Confirm the actual deployment configuration in Vercel rather than assuming a root-level configuration file exists.

### Appwrite Function deployment

The Function package is under `functions/public-seller-profile/` and declares `node-appwrite` as a dependency. Deploy it using the Appwrite Console or the deployment process configured for the project. The exact deployment command, runtime version, entrypoint settings, and complete environment-variable names were not confirmed here. Verify these against the current Appwrite Function configuration.

Front-end deployment and Appwrite deployment are separate operations. After deploying either, test the live integration against the correct Appwrite project.

## Feature status

Status below is based on the code areas and prior project handoff context available during documentation. It is not a substitute for a fresh end-to-end test on production.

| Area | Status | Notes |
|---|---|---|
| React/Vite/TypeScript application | Implemented | Build and lint scripts are defined. |
| Appwrite authentication/session helpers | Implemented | Includes email/password registration/login, session helpers, and email verification helpers; delivery/configuration still depends on Appwrite. |
| Five vendor types and capability map | Implemented foundation | Digital, wholesale, and generic quote capabilities are defined; not all workflows are confirmed end to end. |
| Product listings and seller storefronts | Implemented | Legacy product listing type remains `seller` / `service`. |
| Product cart/order flow | Implemented foundation | Payment processing and transaction atomicity not confirmed. |
| Service booking requests and status lifecycle | Implemented foundation | Booking validation and persistence exist in the Function; capacity/conflict-free scheduling needs further validation. |
| Seller leads, contact, archive/restore | Implemented foundation | Preserve distinction between a lead and a purchase. |
| Customer/seller/provider/admin dashboards | Implemented, uneven completeness | Some account areas may still be placeholders. |
| Collections and landing page | Implemented | Validate data population, filters, responsive states, and live SEO metadata. |
| Theme-aware dashboard shell and selected responsive cards | Updated | User reported the dashboard test passed; full independent viewport matrix was not run during this README task. |
| Ratings/reviews, testimonials, feedback, support | Partially verified | UI and backend work exists; audit deployed permissions and end-to-end moderation flows. |
| Digital delivery, wholesale checkout/pricing, quote requests | Capability foundation / status unconfirmed | Do not assume complete production workflows. |
| Automated CI and comprehensive E2E suite | Unconfirmed | No front-end `test` script is defined in package scripts. |
| Payments, refunds, settlement | Unconfirmed | No complete payment provider integration was confirmed in the inspected files. |

## Known limitations and roadmap

### Known limitations / verification gaps

1. **Schema documentation:** The complete live Appwrite schema, indexes, and permission settings are not versioned as a verified migration in this README.
2. **Scheduling:** Provider availability, slot capacity, double-booking prevention, and expiry automation need validation.
3. **Transaction integrity:** Confirm multi-seller order behavior, stock consistency, idempotency, and failure recovery under concurrent requests.
4. **Feature completeness:** Recheck customer favorites/profile/notifications/wallet/settings and other routes; some have previously been placeholders.
5. **Authorization:** Audit every role-specific route and direct API/Function operation against Appwrite permissions.
6. **Quality gates:** Add or verify automated unit/integration/E2E tests and run them in CI; package dependencies alone are not proof of test coverage.
7. **Production configuration:** Confirm Appwrite email, Function runtime/secrets, Vercel build settings, domains, redirects, and metadata.
8. **Business model coverage:** Finish and test digital-product delivery, wholesale pricing/orders, and quote requests before marketing them as supported transaction flows.
9. **Payment processing:** Clearly document whether payment is offline/manual or online; add a provider only with a defined payment, webhook, reconciliation, refund, and security design.

### Recommended next steps

1. Export/document the production Appwrite schema and permissions, without exposing secrets.
2. Create a repeatable environment setup and deployment checklist for staging and production.
3. Add automated tests for authentication/verification, onboarding, product order and stock invariants, booking authorization/status transitions, and lead archive/restore.
4. Test customer, seller/provider, and admin access on mobile/tablet/desktop, including dark and light themes.
5. Complete scheduling/capacity rules and transaction concurrency/idempotency safeguards.
6. Resolve or clearly label placeholder routes and incomplete vendor capability flows.
7. Verify ratings/review eligibility, moderation, vendor replies, testimonial moderation, support-ticket permissions, and data privacy.
8. Run a release checklist against the deployed Vercel front end and Appwrite Function/database configuration.

## Contributing

- Work on `mvp-development` for ongoing MVP changes.
- **Do not modify the stable `appwrite` branch unless explicitly authorized.**
- Keep changes focused and review existing architecture before adding a new Appwrite Function or schema field.
- Do not commit secrets, environment files, production data, or private user information.
- Do not change role/vendor status or weaken permissions to make tests pass.
- For transaction-related changes, test authorization, invalid inputs, repeated requests, stock/booking invariants, and failure paths.
- Report what was changed and which checks were actually run. Distinguish verified behavior from assumptions and untested work.

## License

A license was not confirmed in the inspected repository. Until a license is added, do not assume the project is open source or that reuse rights have been granted.
