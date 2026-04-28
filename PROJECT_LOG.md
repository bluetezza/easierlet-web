# EasierLet — Project Log

Canonical reference for Terry + Claude. Update at the end of each working session.
Newest entries at the top of each section.

---

## Who / What

- **Owner:** Terry Baldwin — director & sole owner of **Oakrise Estates Ltd** (Company No. 16852456), UK buy-to-let residential property company, Warwick area.
- **Product:** EasierLet — native SwiftUI iOS property-management app for UK landlords. Terry is both developer and target user (first-time landlord).
- **Brand:** Deep teal `#0F6E56` / lighter teal `#1D9E75`. Dual-font wordmark: "easier" in DM Serif Display, "Let" in DM Sans Light. Horizontal key icon. No tagline.

---

## Stack

| Layer | Tool |
|---|---|
| Frontend | SwiftUI / Xcode |
| Backend | Supabase (project `ffzknvcptqjlkxmkdxuk`) |
| File storage | Cloudflare R2 |
| Email | Resend (domain `[easierlet.com](http://easierlet.com)` **verified**) |
| Web forms | GitHub Pages |
| iOS repo | `bluetezza/easierlet-swift` — local `~/Documents/EasierLet/` |
| Web repo | `bluetezza/easierlet-web` — local `~/easierlet-web/` |
| Tenant portal (planned) | `[portal.easierlet.com](http://portal.easierlet.com)` — separate repo `bluetezza/easierlet-portal` |

### Domain

**We own `[easierlet.com](http://easierlet.com)`. We do NOT own `[easierlet.app](http://easierlet.app)`.** Never reference `.app`.

### Tab bar (current)

1. Dashboard
2. Transactions
3. Maintenance
4. Documents
5. More (contains Tenants, Lettings, Inventories, Director's Loan, Landlord Profile, Useful Links, Account)

---

## Build roadmap

### Completed ✅

1. **Dashboard** — unified activity feed, 30s auto-refresh, summary strip, per-property `DashboardPropertyCard` with `PropertySummarySheet`.
2. **Referencing** — Vorensys Phase 1 deep-link (landlord completes on Vorensys site, report emailed, uploaded manually). 30× rent affordability check with pass/marginal/fail. Interpretation help: income, CCJ flags, Right-to-Rent prompt.
3. **Tenancy agreement** — `tenancy-workflow` and `tenant-workflow` Edge Functions. Multi-tenant signing. Lead/joint role system. Generic referencing language. Only finalised agreements saved to Documents.
4. **Inventory** — `inventory_reports`/`inventory_rooms`/`inventory_items` tables. Excellent/Good/Fair/Poor/Damaged scale. Web form for landlord ratings, tenant adds own. `inventory-workflow` Edge Function. Digital signature: tenant via `signature_pad`, landlord via native `LandlordSignatureView`. Meter readings at move-in and move-out.
5. **Public website + portals on easierlet.com** ✅ (2026-04-26) — Homepage with hero search, `/properties/` searchable index (area / beds / max rent / available-by / furnishing), unified `/login/` that routes by `profiles.role`, full landlord portal with iOS parity (Properties CRUD with postcode lookup, full Listing editor, Inventory create+send+finalise, Tenancy agreement create+sign with canvas signature, Maintenance triage, Useful links, Director's loan placeholder), tenant portal with Applications/Viewings/Tenancy/Documents/Settings. Listing media upload manager (R2 presigned PUT). All RLS-scoped — same auth as iOS.
6. **Maintenance overhaul + Property visits** ✅ (2026-04-26) — Full triage workflow (Acknowledge / Reject / Request more info), 13-trade picker + group-by-trade list, 8-status flow (`new → acknowledged → awaiting_info → scheduled → in_progress → completed → closed` + `rejected`), structured rejection reasons, contractor + scheduled-date fields, transaction linking, vertical timeline. Tenant portal handles awaiting-info reply + post-completion confirm. Three new Edge Functions (`maintenance-notify`, `visit-notify`, `visit-response`) wired through Resend. Unified property visits table with 24hr UK notice enforcement, tenant accept/reschedule via tokenised `/visit-response/` web form. Visits surfaced on dashboard activity feed, summary actions, and per-property cards. Certificate-renewal action items prompt scheduling when gas/EICR/EPC expire within 60 days with no matching visit booked.
7. **Onboarding + Billing + Documents compliance** ✅ (2026-04-27) — Public `/signup/` landing page with hero / features / 4-tier pricing / Turnstile-protected form. New `landlord-signup` EF creates auth user + landlord_profile + 14-day trialing landlord_subscriptions row + Resend welcome email. New Stripe-backed `create-checkout-session` / `stripe-webhook` / `billing-portal` EFs (deployed; gracefully fail with `stripe_not_configured` until Stripe keys are added). Per-property billing limits enforced in iOS at `+ Add property` with upgrade alert. Dashboard onboarding card (10 derived steps), better empty states across Dashboard / Transactions / Maintenance / Tenants, first-visit intro banners on Documents / Maintenance / Transactions. Tenant Portal Guide rewritten as 5 collapsible sections + status-aware home guide card. `MandatoryDocuments` constants drive a new compliance UI in DocumentsView (per-property, 3 urgency tiers, placeholder cards for missing items with Upload Now). Per-property compliance pill on dashboard cards + COMPLIANCE section on PropertySummarySheet + Actions Needed list flags missing/expired legal docs. All items linked to archived properties are now hidden from the active dashboard / lists / activity feed (iOS + web).
8. **Admin, Audit, Privacy, Retention & DSAR** ✅ (2026-04-28) — Append-only `audit_log` table + `log_audit()` helper with `RULE … DO INSTEAD NOTHING` to block update/delete from any role. 11 existing Edge Functions instrumented + iOS `AuditLogger` for direct-DB writes (documents, properties, transactions, maintenance). `admin_users` table + mandatory-TOTP admin auth via new `admin-auth` and `admin-api` Edge Functions. New repo `bluetezza/easierlet-admin` deployed at `admin.easierlet.com` — login + dashboard + landlord detail + audit explorer + retention queue + DSAR generator + settings. Sensitive-column inventory via Postgres `COMMENT ON COLUMN PII:…`. `security-check` EF for system health. `retention_rules` table + retention-tracking columns on tenants/viewing_requests + nightly `retention-enforce` EF + `pg_cron` schedule. `generate-dsar` EF generates branded HTML exports (printable to PDF) for admins and tenant self-serve. `tenant-delete-account` EF for tenant erasure. Public privacy + retention + terms pages on easierlet.com. Three internal policy docs in admin repo. iOS adds Privacy / Terms / Retention links + tenant Download My Data + Delete My Account.

### In progress 🟡

7. **Tenant portal** — iOS side complete: Home/Docs/Maintenance/Guide views, visual timeline, maintenance workflow (acknowledge/urgency/dates/transaction link), role-based auth routing, archived docs section, two-stage referencing flow, password-based tenant signup at pre-app approval. Now also: visits section on Home tab with inline confirm / request-reschedule.

   **Pending items on tenant portal:**
   - [ ] Delete account from tenant profile
   - [ ] Force password reset on first login
   - [ ] Dashboard action nav (1 action → detail, >1 → list)
   - [ ] Single-property display fix in `AddTenantView` (hide property picker when only one option)

### Queued

8. Monthly invoicing (additive to existing transactions — rent only, income side)
9. CT600 export
10. Landlord in-app help/guides
11. App Store preparation

### Standalone features — completed

- **Property listings** ✅ — Public listings page with sticky CTA (`[Apply now]` / `[Book a viewing]`). Apply → `/apply-v2/?slug=X` (Turnstile-protected cold-apply form, POSTs to `listing-apply v10`). Book a viewing → in-page modal via `viewing-request` Edge Function. Landlord can: propose a time (viewer accepts via `/viewing-response/?token=X`), archive confirmed viewings, or invite to apply (creates tenant via `invite-tenant`, auto-archives viewing). `let_agreed` state hides CTAs and shows banner. 360 photo support via Pannellum in lightbox. Short opaque listing codes (7-char base58) replace address-based slugs. Optional `property_number` (TEXT, nullable) for landlord reference.
- **Web landlord + tenant portals on easierlet.com** ✅ (2026-04-26) — see roadmap item 5 above. Means the website now offers full feature parity with the iOS app for landlords who don't have an iPhone, plus a tenant-side surface for tracking applications/viewings/tenancy. Lives on the existing `bluetezza/easierlet-web` repo (no separate portal subdomain).

### Standalone features — interleaved where logical

- **Contractor grouping** — Group-by-trade list view ✅ shipped 2026-04-26 as part of the maintenance overhaul. Future: postcode-based Checkatrade deep-link from a trade group header.
- **Inventory intelligence** — `dispute_flag`, AI agent that diffs move-out vs move-in, auto-raises maintenance tasks

### Future features (scoped, not yet built)

- ~~**Maintenance overhaul**~~ — ✅ shipped 2026-04-26 (see Completed item 6).
- ~~**Property visits**~~ — ✅ shipped 2026-04-26 (see Completed item 6).
- **Email-based maintenance submission** — tenant emails `[maintenance@easierlet.com](mailto:maintenance@easierlet.com)`, system parses, returns GitHub Pages web form pre-filled with tenant/property/issue. Submitted form creates `maintenance_request` row.
- **Viewing workflow fork** — `viewing_manager` field at **property level** (not listing) = `'self'` or `'agent'` (+ `agent_email`). Agent route: plain forwarded email via Resend, timestamp logged. Self route: accept/propose alternative, `.ics` calendar invite (address/time/landlord contact). Manual "viewing completed" button triggers application form send (no auto-fire, avoids no-show sends).
- **Room metadata on listing photos** — enum `listing_room_type` (exterior/living/kitchen/dining/kitchen_diner/bedroom_main/bedroom/bathroom/ensuite/wc/hallway/garden/garage/parking/other) + `is_hero` bool (unique per listing) + `room_caption` + `room_label_source` (ai/landlord/default). AI pre-fill via Claude Haiku in `listing-media-upload` confirm; landlord can override.
- **AI social video ads for listings** — Shotstack template composition (~£0.15/video), 27s 9:16 vertical reel driven by room metadata. New `property_listings` fields: `social_video_status` enum, `social_video_url`, `social_video_job_id`, `social_video_generated_at`. Edge Function `generate-listing-video`. Template + HTML preview designed April 2026.
- **Open Banking** (TrueLayer / Plaid) for bank balance — future phase. GoCardless free route closed July 2025. Phased plan: Phase 1 CSV/OFX import with auto-tagging (free, all banks), Phase 2 Starling personal access token for own account, Phase 3 paid aggregator at scale.
- **Vorensys Phase 2** — white-label REST API with webhook report return — when platform scales
- ~~Web tenant portal at `portal.easierlet.com`~~ — **delivered on `easierlet.com/tenant/`** (2026-04-26). Subdomain not used; the full site is one repo and one host.
- **Landlord onboarding + Stripe billing** — web signup flow, Stripe Checkout for payment, webhook to activate account. Per-property pricing model under consideration.
- **In-app guided onboarding** — progressive checklist on Dashboard, contextual empty states, "next steps" prompts adapting to landlord journey stage.

---

## Infrastructure snapshot

### Edge Functions deployed

| Function | Version | JWT | Purpose |
|---|---|---|---|
| `tenant-workflow` | **v44** | Yes | Dispatcher: `get_reference`, `send_application`, `send_reference`, `reject_tenant`, `approve_pre_application`, `references_passed`, `submit_application`, `get_invite`, `notify_vorensys_submitted` (legacy), `notify_reference_submitted` (legacy) |
| `tenancy-workflow` | current | Yes | Tenancy agreement signing |
| `inventory-workflow` | current | Yes | Email/form/PDF for inventories |
| `listing-public-fetch` | current | No | Public listing detail fetch by slug |
| `listings-search` | **NEW (2026-04-25)** | No | Public search index for `/properties/`. Joins `property_listings` + `properties`, filters on `status='live'`, area `ilike` across city/postcode/address_line1, bedroom/rent/availability/furnishing, paginated. Returns minimal payload + hero thumbnail per listing. |
| `listing-apply` | v10 | No | Turnstile-protected application submission. Cold-apply (slug) and invited (token) modes. Computes ranking, inserts with `role='pending'` and optional `preferred_role`. |
| `listing-media-upload` | current | Yes | Two actions: `presign` (R2 PUT URL) and `confirm` (insert `listing_media` row). Now also called from the website's landlord portal media manager. |
| `viewing-request` | current | No | Public Book a Viewing endpoint. Inserts `viewing_requests` with `access_token`, emails landlord. |
| `viewing-response` | v2 | No (token-auth) | Public viewer accept/decline. GET returns viewing+property+landlord by token; POST updates status. Idempotent. |
| `send-viewing-confirmation` | v8 | Yes | Viewer email when landlord proposes (with accept-link); both-parties confirmation with .ics when confirmed. |
| `invite-tenant` | v11 (2026-04-22) | Yes | Uses `getUser(jwt)` correctly. Creates tenant row with `role='pending'`, URL `/apply-v2/?invite=<token>`. Optional `message` field for landlord note. Now also called from the website's landlord portal Invite-tenant modal. |
| `tenant-portal` | current | Yes (tenant JWT) | Tenant-side endpoint; returns own data scoped by RLS. |
| `address-lookup` | current | Yes | Postcode → addresses via [ideal-postcodes.co.uk](http://ideal-postcodes.co.uk); wraps API key. Now also called from `/landlord/properties/` add/edit form. |
| `notify_vorensys_submitted` | **DEPRECATED** | — | Renamed to `notify_referencing_submitted` in tenant-workflow. Kept until in-flight invites drain. |
| `maintenance-notify` | **NEW (2026-04-26)** | Yes | Resend wrapper. Actions: `new_request` (emails landlord with priority callout), `status_changed` (emails tenant per status: acknowledged / rejected / awaiting_info / scheduled / completed). Skips silently if no email on file. |
| `visit-notify` | **NEW (2026-04-26)** | Yes | Resend wrapper for property visits. Actions: `send_notice` (validates ≥24h notice, emails active tenants with tokenised confirm link, sets visit→`notice_sent`), `send_update` (re-sends with "Updated" subject), `send_cancellation` (emails + sets visit→`cancelled`). |
| `visit-response` | **NEW (2026-04-26)** | No (token-auth) | Tenant accepts or requests reschedule via per-row `access_token`. GET returns visit+property+landlord snapshot for the web form; POST `accept` flips `tenant_response=accepted` + status→`confirmed` + emails landlord; POST `request_reschedule` stores note + emails landlord. |
| `landlord-signup` | **NEW (2026-04-27)** | No (Turnstile) | Public landlord registration. Verifies Turnstile, creates auth user (`email_confirm=true`), upserts `landlord_profiles` + trialing `landlord_subscriptions` (14 days, 2-property limit), upserts `profiles.role='landlord'` for routing, sends Resend welcome email. Returns `{ok, user_id}`. |
| `create-checkout-session` | **NEW (2026-04-27)** | Yes | Reads `STRIPE_SECRET_KEY` + `STRIPE_PRICE_{STARTER,GROWTH,PROFESSIONAL}`. Finds-or-creates the Stripe customer for the user, creates a Checkout session in subscription mode, returns `checkout_url`. Returns 503 `stripe_not_configured` until secrets are set. |
| `stripe-webhook` | **NEW (2026-04-27)** | No (signed) | Verifies Stripe HMAC signature with `STRIPE_WEBHOOK_SECRET`. Handles `checkout.session.completed`, `invoice.payment_succeeded`, `invoice.payment_failed`, `customer.subscription.deleted`, `customer.subscription.updated` — syncs `landlord_subscriptions` (plan / status / property_limit / current_period_end). Emails landlord on payment failure. |
| `billing-portal` | **NEW (2026-04-27)** | Yes | Returns Stripe Customer Portal URL for the user's customer. 404 `no_customer` if they haven't started a subscription yet. |
| `admin-auth` | **NEW (2026-04-28)** | No (handles auth itself) | Admin login flow — password sign-in, admin_users gate, MFA challenge / verify / enrol. Issues an aal2 session for admin-api. |
| `admin-api` | **NEW (2026-04-28)** | Yes (aal2 enforced) | All admin operations: dashboard_stats, list_landlords, view_landlord, view_tenant, extend_trial, view_audit_log, list_retention_pending, override_retention, generate_dsar (proxy), whoami. Every read of landlord/tenant data audited. |
| `seed-admin` | **NEW (2026-04-28)** | No (SEED_SECRET) | One-time bootstrap: creates the first admin auth user + admin_users row. Idempotent. |
| `security-check` | **NEW (2026-04-28)** | Yes (admin) | Returns a structured health report: RLS, policy coverage, orphaned data, retention queue, audit recent writes, service-role-in-URL sanity. |
| `retention-enforce` | **NEW (2026-04-28)** | No (RETENTION_CRON_SECRET) | Nightly job (03:00 UTC via pg_cron) — Pass 1 sends 30-day warnings, Pass 2 anonymises records past their retention deadline. Handles tenants + viewing_requests. |
| `generate-dsar` | **NEW (2026-04-28)** | Yes | Builds a branded HTML export of all data we hold for a user. Two modes: `admin` (proxied via admin-api with service-role) and `self` (tenant JWT). Filters out landlord-only fields when self-serve. Returns a 24-hour signed URL. |
| `tenant-delete-account` | **NEW (2026-04-28)** | Yes (tenant JWT) | Tenant-initiated erasure — anonymises tenant + tenant_references rows, deletes auth account, emails landlord. |

#### Key Edge Function behaviours

- `approve_pre_application` side effects: updates tenant → `referencing`, marks latest `tenant_reference` → `approved`, creates Supabase auth account with temp password (format: `WordWord###!`), emails tenant with referencing notice + portal sign-in credentials
- `reject_tenant` emails the tenant a rejection message with optional reason
- `get_invite` (no JWT) — public lookup by `invite_token`, returns `{name, email, listing_id, property, listing}` for form pre-fill. Only active while tenant is `invited` or `awaiting_review`.

### Edge Function secrets configured

`RESEND_API_KEY`, `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_PUBLIC_BUCKET`, `R2_PRIVATE_BUCKET`, `R2_PUBLIC_URL_BASE`, `IDEAL_POSTCODES_API_KEY`, `TURNSTILE_SECRET_KEY`, `APP_BASE_URL=https://easierlet.com`, `WEB_BASE_URL=https://easierlet.com` (plus auto-injected `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DB_URL`).

### Public web pages

| URL | Edge Function | Purpose |
|---|---|---|
| `/` | — | **NEW (2026-04-26)** Marketing homepage with hero search (area / bedrooms / available-by) and tenant + landlord portal CTAs. |
| `/properties/` | `listings-search` | **NEW (2026-04-26)** Searchable listings index with filters, pagination and sort. Cards link to `/listings/?slug=…`. |
| `/login/` | — | **NEW (2026-04-26)** Unified sign-in / sign-up + magic link. After auth, looks up `profiles.role` and routes to `/tenant/` or `/landlord/`. |
| `/tenant/login/` and `/landlord/login/` | — | **NEW (2026-04-26)** Thin redirect stubs to `/login/`, preserving `?next=`, query and hash for legacy magic-link emails. |
| `/tenant/` | various | **NEW (2026-04-26)** Tenant portal (overview, applications, viewings, tenancy, documents, settings). Reads RLS-scoped via PostgREST. |
| `/landlord/` | various | **NEW (2026-04-26)** Landlord portal home with tabbed Dashboard / Listings / Viewings / Tenants / Tenancies / Transactions / Documents. Action modals for add transaction, upload document, invite tenant, add viewing, tenant detail. Listing media manager (R2 presigned upload). |
| `/landlord/properties/` | `address-lookup` | **NEW (2026-04-26)** Properties CRUD with UK postcode lookup, mortgage details, archive/restore. |
| `/landlord/listing/?id=…` | — | **NEW (2026-04-26)** Full listing editor (headline, description, rent, deposit, available-from, 24-amenity tag grid, status workflow, performance stats sidebar). |
| `/landlord/inventory/` and `/landlord/inventory/?id=…` | `inventory-workflow` | **NEW (2026-04-26)** List + create + per-room/item condition editor. Default room/item template pre-populated. Send to tenant + Finalise. |
| `/landlord/tenancy/?id=…` | `tenancy-workflow` | **NEW (2026-04-26)** APT agreement create/sign: property + dates + DPS scheme + multiple signers (lead/joint) + custom clauses. Generate-and-send + landlord canvas signature + Finalise. |
| `/landlord/maintenance/` | — | **NEW (2026-04-26)** Maintenance request inbox with open/acknowledged/resolved tabs, detail modal with notes + state transitions, log new request. |
| `/landlord/loan/` | — | **NEW (2026-04-26)** Director's loan placeholder (matches the iOS "coming soon"). |
| `/landlord/useful-links/` | — | **NEW (2026-04-26)** UK landlord references (DPS schemes, right-to-rent, EPC, How to rent, tax & finance). |
| `/listings/?slug=…` | `listing-public-fetch` | Public listing detail. Gallery (photos + 360 via Pannellum + video), description, rent/deposit, map, sticky CTA. `let_agreed` state hides CTAs and shows banner. |
| `/apply-v2/?slug=…` or `/apply-v2/?invite=…` | `listing-apply` | **Unified apply form** (2026-04-22). Cold-apply (slug, Turnstile, listing card) and invited (token, no Turnstile, no card). `preferred_role` radio (lead/joint/unsure). Full validation. |
| `/book-viewing/` | `viewing-request` | Standalone book-a-viewing page (same modal also lives in-page on /listings/). |
| `/viewing-response/?token=…` | `viewing-response` | Viewer accepts or declines a proposed viewing time. |
| `/visit-response/?token=…` | `visit-response` | **NEW (2026-04-26)** Tenant confirms a landlord property visit or requests a reschedule with optional note. Branded teal layout matching `/viewing-response/`. |
| `/signup/` | `landlord-signup` | **NEW (2026-04-27)** Public landlord registration with hero, feature grid, 4-tier pricing table, Turnstile-protected signup form. On success, signs the user in and redirects to `/landlord/`. |
| `/billing/` | `create-checkout-session` + `billing-portal` | **NEW (2026-04-27)** Authenticated billing dashboard — current plan, property usage, trial countdown, upgrade buttons (Stripe Checkout), Manage billing button (Stripe Customer Portal). Shows `Billing setup pending` graceful state until Stripe keys are configured. |
| `/billing/success/` | — | **NEW (2026-04-27)** Stripe Checkout `success_url` — confirms subscription is active. |
| `/billing/cancel/` | — | **NEW (2026-04-27)** Stripe Checkout `cancel_url` — explains nothing was charged, links back to `/billing/`. |
| `/privacy/` | — | **REWRITTEN (2026-04-28)** Full UK GDPR privacy policy v2 with table of contents, retention summary, processor list. |
| `/privacy/retention/` | — | **NEW (2026-04-28)** Plain-English retention summary table with periods + legal basis per data category. |
| `/terms/` | — | **NEW (2026-04-28)** Landlord Terms of Service: account, billing, acceptable use, data-controller/processor split, liability, governing law (England & Wales). |
| `/sign-tenancy/?token=…` | `tenancy-workflow` | Per-signer tenancy agreement signing. `signature_pad` canvas. |
| `/inventory/?token=…` | `inventory-workflow` | Tenant-side inventory web form. |
| `/privacy/` | — | Privacy policy. |
| `/assets/easierlet.css` + `easierlet.js` | — | Shared styles + helpers. |
| `/assets/portal.css` + `portal.js` | — | **NEW (2026-04-26)** Sidebar shell, Supabase client (esm.sh CDN), auth helpers, tab routing, toast — used by all `/tenant/` and `/landlord/` pages. |
| `/assets/signature.js` | — | **NEW (2026-04-26)** DPR-aware canvas signature pad (mouse + touch + stylus, base64 PNG output matching iOS). |
| `/apply/` | — | **Pending retirement** — superseded by `/apply-v2/`. Delete after E2E test passes. |

### Database (`properties` table)

All columns as of April 2026:

```
id, user_id, address (NOT NULL), purchase_price, monthly_rent, created_at,
name, address_line1, address_line2, city, postcode,
mortgage_type, mortgage_lender, mortgage_start_date, mortgage_original_balance,
mortgage_term_months, mortgage_interest_rate,
archived, latitude, longitude, uprn,
bedrooms, bathrooms, square_feet, epc_rating, council_tax_band, furnished_status,
status (default 'available'),
property_number (TEXT, nullable — optional landlord reference e.g. "OAK-01"),
location geography(Point, 4326) -- GENERATED from latitude/longitude
```

- PostGIS extension enabled
- GiST index: `idx_properties_location`
- B-tree index: `idx_properties_postcode`
- Partial unique index: `(user_id, property_number) WHERE property_number IS NOT NULL`
- `location` is auto-maintained — app writes lat/lng, DB maintains `location`. Never written directly.
- Coordinates NEVER shown to user. `location` is for server-side spatial queries only (contractor radius, nearest-property).

### Database (`tenants` table)

Full column list (April 2026):

```
id, user_id, property_id, full_name (NOT NULL), email, phone,
tenancy_start, tenancy_end, monthly_rent, deposit, status, created_at,
role, preferred_role, tenancy_id, name,
right_to_rent_status, right_to_rent_checked_at,
preferred_tenancy_start, number_of_occupants, rejection_reason,
tenant_auth_id, invite_token, invite_sent_at,
referencing_submitted_at, references_passed_at,
application_source, listing_id,
date_of_birth, nationality,
right_to_rent_visa_type, right_to_rent_visa_expiry,
number_of_adults, number_of_children, has_pets, pet_details, is_smoker,
preferred_tenancy_length, guarantor_available,
employment_status, employer_name, job_title, years_in_role,
annual_income, additional_income, additional_income_source,
has_adverse_credit, adverse_credit_details,
has_been_evicted, eviction_details,
has_been_in_arrears, arrears_details, reason_for_moving,
consented_accuracy, consented_referencing, consented_privacy, consented_at,
ranking_score, ranking_band, ranking_rationale (jsonb), shortlisted
```

#### Key CHECK CONSTRAINTs on tenants

- `tenants_role_check` — `role IN ('lead','joint','pending','guarantor')`. `'pending'` added 2026-04-22.
- `tenants_preferred_role_check` — `preferred_role IS NULL OR preferred_role IN ('lead','joint','unsure')`. Added 2026-04-22.
- `tenants_one_pipeline_lead_per_property` — partial unique index. Prevents two leads on the same property pipeline.

### Tenant status flow (current)

```
draft → invited → awaiting_review → approved → referencing → refs_passed → active → archived
                        ↓
                    rejected
```

- **draft** — tenant row exists, invite not yet sent
- **invited** — pre-application link emailed, awaiting submission
- **awaiting_review** — pre-application submitted, landlord needs to review
- **approved** — landlord approved pre-app; tenant moves to referencing
- **referencing** — references being gathered (external Vorensys flow)
- **refs_passed** — references back clean; landlord can finalise
- **active** — tenancy agreement signed, tenant in property
- **archived** — historical
- **rejected** — declined at pre-application stage

### Tenant role flow (current — as of 2026-04-22)

```
pending (every applicant on entry)
    │
    ▼  (landlord clicks Mark Passed)
lead   if first applicant marked passed on this property pipeline
joint  if a lead already exists
```

- DB partial unique index enforces "at most one lead per property pipeline"
- `preferred_role` (advisory) records applicant's preference at apply time. Default `'unsure'`. Landlord uses Manage Roles to swap if needed.

### Database (`property_listings` table)

Status flow: `draft → live → let_agreed → archived`. `let_agreed` hides apply/book-viewing CTAs and shows a banner on the public page.

Listing slugs: 7-character base58 codes generated by `generate_unique_listing_slug()` RPC (no-arg, collision retry). Existing listings keep legacy address-based slugs.

### Database (`maintenance_requests` table) — overhauled 2026-04-26

Added columns: `trade_type`, `rejection_reason`, `rejection_notes`, `rejected_at`, `scheduled_date`, `contractor_name`, `contractor_phone`, `completed_at`, `linked_visit_id` (FK → `property_visits`).

CHECK constraints (replaced):
- `status` ∈ `new`, `acknowledged`, `awaiting_info`, `scheduled`, `in_progress`, `completed`, `closed`, `rejected` (default `new`)
- `trade_type` ∈ `plumbing`, `electrical`, `gas`, `carpentry`, `roofing`, `glazing`, `locksmith`, `plastering`, `decorating`, `cleaning`, `pest_control`, `appliance`, `general` (nullable)
- `rejection_reason` ∈ `tenant_responsibility`, `duplicate`, `cosmetic`, `pre_existing`, `other` (nullable)

Index added: `idx_maintenance_requests_user_status (user_id, status)` for badge polling.

Status flow (landlord-side):

```
new → acknowledged → scheduled → in_progress → completed → closed
                  ↘ awaiting_info ↗
                  ↘ rejected
```

Tenant-portal flow: `new` (initial insert) → may be flipped back to `new` when tenant replies to an `awaiting_info` request; tenant can confirm `completed` → `closed`.

`tenant_id` is now set on every tenant-portal insert so the landlord triage UI can attribute the request and `maintenance-notify` can email the right tenant.

### Database (`property_visits` table) — new 2026-04-26

```
id, user_id, property_id, visit_type, title, description,
scheduled_date (NOT NULL), scheduled_time_from, scheduled_time_to,
contractor_name, contractor_phone, contractor_email,
status (default 'draft'), notice_sent_at, tenant_response (default 'none'),
tenant_reschedule_note, completion_notes, linked_document_id,
access_token (UUID UNIQUE NOT NULL DEFAULT gen_random_uuid()),
created_at, updated_at
```

CHECK constraints:
- `visit_type` ∈ `maintenance`, `inspection`, `gas_safety`, `eicr`, `epc`, `inventory`, `other`
- `status` ∈ `draft`, `notice_sent`, `confirmed`, `completed`, `cancelled`
- `tenant_response` ∈ `none`, `accepted`, `requested_reschedule` (nullable)

Indexes: `idx_property_visits_user_status (user_id, status)`, `idx_property_visits_property_date (property_id, scheduled_date)`.

`updated_at` maintained by trigger `trg_property_visits_updated_at` calling `public.set_updated_at()`.

RLS:
- Landlord owns: `auth.uid() = user_id`
- Active tenants on the property: SELECT-only via subquery on `tenants` table

`access_token` is the only auth for the public `visit-response` flow. Per-row scope, idempotent. Same pattern as `viewing_requests.access_token`.

### Database (`visit_maintenance_links` table) — new 2026-04-26

Junction for many-to-many visit ↔ maintenance request:

```
visit_id uuid REFERENCES property_visits(id) ON DELETE CASCADE,
maintenance_id uuid REFERENCES maintenance_requests(id) ON DELETE CASCADE,
PRIMARY KEY (visit_id, maintenance_id)
```

RLS: row visible/manageable iff caller owns the visit. Used by Create-visit form to attach in-flight maintenance requests; iOS also back-fills `maintenance_requests.linked_visit_id` for fast lookup from the maintenance side.

### Database (`landlord_subscriptions` table) — new 2026-04-27

```
id, user_id (UNIQUE FK auth.users), stripe_customer_id (UNIQUE),
stripe_subscription_id (UNIQUE), plan (default 'trial'), status (default 'trialing'),
trial_ends_at, current_period_end, property_limit (default 1),
created_at, updated_at
```

CHECK constraints:
- `plan` ∈ `trial`, `starter`, `growth`, `professional`
- `status` ∈ `trialing`, `active`, `past_due`, `cancelled`, `expired`

RLS: `Users can read own subscription` — `auth.uid() = user_id` (SELECT only; writes happen via service role from `landlord-signup` and `stripe-webhook`).

Pricing tiers + property limits:
| Plan | Properties | Monthly |
|---|---|---|
| Trial | 2 | Free 14d |
| Starter | 3 | £9.99 |
| Growth | 10 | £24.99 |
| Professional | 25 | £49.99 |

Migration backfilled an existing trialing row for every legacy `landlord_profiles.user_id` so nobody is locked out of new property creation.

### Database (`landlord_profiles` table) — onboarding column added 2026-04-27

`onboarding_completed_at timestamptz` (nullable). Set to `now()` when the landlord taps "I'll do this later" on the dashboard onboarding card; the card hides permanently once set.

### Database (`audit_log` table) — new 2026-04-28

```
id, actor_id, actor_type CHECK ∈ {landlord,tenant,admin,system},
action, resource_type, resource_id, metadata jsonb,
ip_address, user_agent, created_at
```

Indexes: `(actor_id, created_at DESC)`, `(resource_type, resource_id, created_at DESC)`, `(action, created_at DESC)`, `(created_at DESC)`.

RLS enabled; **no user-facing policies** — service-role only. `RULE audit_no_update DO INSTEAD NOTHING` and `RULE audit_no_delete DO INSTEAD NOTHING` enforce true append-only semantics from any role including service_role.

`log_audit(...)` helper function (SECURITY DEFINER) is the canonical writer — granted EXECUTE to `authenticated` and `service_role`. iOS calls it via `supabase.rpc("log_audit", …)`; Edge Functions call it via the same RPC (fire-and-forget pattern with `.then(() => {}, console.error)`).

### Database (`admin_users` table) — new 2026-04-28

```
id, auth_id (FK auth.users UNIQUE), name, email UNIQUE, role CHECK ∈ {owner,support},
mfa_verified, is_active, created_at, last_login_at
```

RLS enabled; **no user-facing policies** — admin-api service-role only.

### Database (`retention_rules` table) — new 2026-04-28

```
id, resource_type UNIQUE, retention_period_months,
retention_basis (text — legal justification),
anonymise_fields text[], delete_after_anonymise, created_at
```

Seeded with 8 rules: `tenant_active` (72mo), `tenant_rejected` (6mo, delete), `tenant_reference` (72mo), `document_gas_safety` (24mo), `document_eicr` (72mo), `viewing_request` (12mo, anonymise), `transaction` (84mo), `audit_log` (84mo).

### Tenants retention columns — added 2026-04-28

`retention_expires_at`, `retention_warning_sent_at`, `anonymised_at`, `retention_deferred_until`. Computed via `BEFORE UPDATE` trigger `compute_tenant_retention()` on status transitions to `archived` or `rejected`. Backfilled for existing archived/rejected tenants.

### Viewing requests retention columns — added 2026-04-28

`retention_expires_at`, `anonymised_at`. Computed via `BEFORE INSERT` trigger.

### Sensitive data inventory — column comments

Every PII column tagged with one of `PII:personal`, `PII:financial`, `PII:employment`, `PII:sensitive`, `PRIVATE:landlord`, `AUDIT:consent` via `COMMENT ON COLUMN`. Run this to list:

```sql
SELECT c.table_name, c.column_name, pgd.description
FROM information_schema.columns c
JOIN pg_catalog.pg_statio_all_tables st ON st.schemaname = c.table_schema AND st.relname = c.table_name
LEFT JOIN pg_catalog.pg_description pgd ON pgd.objoid = st.relid AND pgd.objsubid = c.ordinal_position
WHERE c.table_schema = 'public' AND pgd.description LIKE 'PII%' ORDER BY c.table_name, c.column_name;
```

### Database (`viewing_requests` table)

Key columns:

```
id, user_id, property_id, listing_id,
prospect_name, prospect_email, prospect_phone,
preferred_times, message,
status, proposed_datetime, confirmed_datetime,
landlord_notes, created_at, updated_at,
access_token (UUID, UNIQUE, NOT NULL, DEFAULT gen_random_uuid())
```

Status flow: `pending → proposed → (viewer-accepts) → confirmed → completed`. Decline from proposed reverts to `pending`.

`access_token` is the only auth for the public viewing-response flow. Per-row scope, idempotent, no expiry needed.

### Ranking bands

`ranking_band` values observed: see `PreApplicationReviewView.bandColor`. Bands stored as strings.

---

## Decisions & rationale

### Web portal architecture (April 2026)

- **One repo, one host.** The web landlord + tenant portals live alongside the existing companion pages on `easierlet.com` (the `bluetezza/easierlet-web` repo). Earlier plans had a separate `portal.easierlet.com` subdomain on its own repo; we collapsed that. Less infra, simpler deploys (GitHub Pages picks up `main`), one place for the brand.
- **No build step, no framework.** Plain static HTML + CSS + JS. Supabase JS SDK loaded from `esm.sh` CDN. Matches the rest of the site.
- **PostgREST + RLS.** Portal pages read/write directly via REST/RPC with the user's JWT. Same RLS policies that gate the iOS app gate the website — there's no separate auth model. Edge Functions are only used where they already exist (uploads, workflows, address lookup, invites).
- **One sign-in for both roles.** `/login/` looks up `profiles.role` after auth and routes to `/tenant/` or `/landlord/`. Fallbacks: `tenants.tenant_auth_id` match → tenant; otherwise → landlord (the iOS app's pre-existing user base). `/tenant/login/` and `/landlord/login/` kept as redirect stubs so legacy magic-link emails still work.
- **`?next=` is role-fenced.** A tenant who tried to view `/landlord/something` without auth gets bounced to `/login/`, but after sign-in we don't honour the `next=` (it'd land them on a portal that has no data for them). They go to their role's home.

### Maintenance overhaul architecture (April 2026)

- Full triage branching: acknowledge / reject / request more info — replaces flat four-button status update
- Trade type assignment at triage enables contractor grouping by trade across properties
- Property visits as unified scheduling backbone — maintenance, inspections, gas safety, EICR, EPC all use same `property_visits` table
- 24hr notice enforcement for UK legal compliance (Section 11, Landlord and Tenant Act 1985)
- Rejection reasons structured (tenant_responsibility, duplicate, cosmetic, pre_existing, other) with free-text notes
- Junction table `visit_maintenance_links` for many-to-many visit↔request linking
- Spec document: `[maintenance-and-visits-prompt.md](http://maintenance-and-visits-prompt.md)` (for Claude Code)

### Short listing codes (April 2026)

- 7-char base58 (excludes `0`/`O`/`I`/`l`), ~2 trillion possibilities, zero realistic collision concern
- New RPC `generate_unique_listing_slug()` replaces old `generate_listing_slug(text)`
- Existing listings keep legacy address-based slugs (not migrated — avoids breaking shared links)

### Property numbers (April 2026)

- `property_number` is TEXT (not INTEGER) — supports both "1" and "OAK-01"
- Nullable — optional for landlords who don't want them
- Partial unique index: per-landlord uniqueness only when field is set
- Displayed as `#N` teal pill badge on PropertyCard, DashboardPropertyCard, PropertySummarySheet

### Unified apply form (April 2026)

- Single `/apply-v2/` page handles both cold-apply (slug) and invited (token) modes
- Cold-apply: Turnstile-protected, listing card shown, `preferred_role` radio
- Invited: token auth, Turnstile hidden, listing card hidden, name+email pre-filled from invite
- Legacy `?token=` URLs from old invite emails mapped to invite mode for back-compat

### Viewing workflow — viewer-driven accept (April 2026)

- Landlord proposes a time → viewer gets email with "Confirm this time" CTA
- Viewer accepts or declines via `/viewing-response/?token=X`
- Landlord can: archive confirmed viewings, or invite to apply (auto-archives viewing)
- No auto-fire of application form after viewing (prevents no-show sends)

### Open Banking investigation (April 2026)

- GoCardless free route closed July 2025
- Phased plan: Phase 1 CSV/OFX import + auto-tagging (free), Phase 2 Starling personal access token (own account only), Phase 3 paid aggregator at scale
- Cannot use personal access tokens for third-party landlords without FCA AISP authorisation

### 360 photo handling (April 2026)

- Must upload via "360°" button to get `media_type = 'photo_360'` — regular photo upload sets `media_type = 'photo'`
- Hero carousel always renders 360 as flat preview — Pannellum drag-to-rotate only in lightbox
- No automatic equirectangular validation (2:1 aspect ratio check) yet — soft warning planned

### Structured addresses with PostGIS (April 2026)

- `properties` table has structured fields; legacy `address` column kept NOT NULL for back-compat
- App reads structured fields via `Property.fullAddress`, falls back to `address` if structured empty
- `Property.hasStructuredAddress` requires `address_line1 + postcode + latitude + longitude` all populated
- Chose **generated PostGIS column** (`location geography(Point, 4326)`) over application-side PostGIS handling

### Money type

- Stored as `numeric` in DB, decoded as `Double?` in Swift (consistent with existing code)
- When listings code expects `Decimal?`, convert at use site: `.map { Decimal($0) }`
- Do NOT migrate storage type — cascading breakage in `AddPropertyView`/`EditPropertyView`/`PropertyViewModel`

### Tenant portal on web vs iOS

- Backend (Edge Functions, RLS, DB) is 100% shared
- Web client: vanilla JS + Supabase JS SDK, no build step
- Lives at `easierlet.com/tenant/` (we collapsed the separate `portal.easierlet.com` plan into the main site)
- Pending iOS items 1 & 2 (delete account, force password reset) require shared backend work — same gaps apply to the web portal

### Invite tenant flow

- Two toolbar buttons on `TenantsView`: **+** for direct-add, **✉️** for invite (with property picker + optional message)
- `AddTenantChooserView.swift` obsolete — delete from Xcode project
- Web parity: landlord portal `/landlord/` has an Invite-tenant modal that calls the same `invite-tenant` edge fn

### Dashboard action nav

- Rule: **1 pending action → detail screen, >1 → list screen**
- Implemented for Pre-applications inbox card
- Viewing requests always go to list (single-viewing detail deferred)

---

## Conventions & gotchas

- **No Python patching scripts for large Swift files** — full file rewrites or targeted str_replace only. Python patching is explicitly unreliable; use download+cp.
- **`.onAppear` not `.task`** for main tab view reloads; refresh after every state-changing action
- **Edge Function deployment via terminal**, not MCP: `supabase functions deploy [name] --no-verify-jwt` from `~/Documents/EasierLet/`. MCP `deploy_edge_function` is unreliable.
- **Supabase SQL via MCP works reliably** — `execute_sql` and `apply_migration`
- **CHECK CONSTRAINT debug pattern:** when DB update fails silently, first query `pg_constraint` before investigating Swift/RLS/encoding
- **`deno.json` required** in every Edge Function folder
- **esbuild to verify clean compile** before every Edge Function deployment
- **`IdentifiableURL` item-based `.sheet(item:)` pattern** for document viewers — resolves first-open failures
- **File-scoped URL/anon-key constants** in repos where needed because supabase-swift marks `client.supabaseURL`/`client.supabaseKey` as internal (applies to `ListingsRepository`, `DashboardBadges`)
- **`NavigationLink(destination:isActive:)` is deprecated on iOS 16+** but still works — codebase uses the old pattern consistently; migrate later
- **Tenancy agreements are signed BEFORE inventories** (not after)
- **Draft tenancy agreements not saved to Documents** — only finalised versions; old agreement rows deleted on each new finalise
- **`Tenant.role` is `String?` (optional)** — handles legacy tenants from before role system existed
- **`hasLeadTenantForProperty` requires explicit `selectedProperty`** — no fallback to `properties.first` (prevents cross-property contamination)
- **`TenancyAgreementView` start date** defaults from `preferred_tenancy_start`, falls back to `tenancy_start`
- **Direct DB updates bypass Edge Function side-effects** — any status transition needing side-effects (emails, account creation) MUST go through an Edge Function. Learned from portal email bug 2026-04-25.
- **`verify_jwt=false` + in-function auth pattern** — used for Edge Functions called via `URLSession` directly (not `.functions.invoke()`). Function reads Bearer token itself, calls `supabase.auth.getUser(jwt)`. Avoids supabase-swift session refresh edge case. Used in: `address-lookup`, `send-viewing-confirmation`.
- **`.ics` calendar attachments — Apple iCloud auto-invite trap** — omit `ATTENDEE`, set `ORGANIZER` to non-Apple address (e.g. `[no.reply@easierlet.com](mailto:no.reply@easierlet.com)`), use `METHOD:PUBLISH` (not `REQUEST`). Prevents Apple Mail auto-generating second invite.
- **Numeric → String coercion at API boundaries** — third-party APIs return identifiers as unquoted integers. Coerce at server boundary (`String(a.uprn)`) not in Swift struct.
- **PostgREST RPC return-type decoding** — `RETURNS text` decodes as `String`, not `[String]`. `[String]` expects `RETURNS SETOF text`.
- **PostgREST embedded selects require declared FKs** — `table!inner(...)` only works with declared FK. Sibling tables (e.g. `viewing_requests.user_id` and `landlord_profiles.user_id` both → `auth.users`) cannot be joined. Solution: two separate queries, stitch on shared ID.
- **Web portal pages use plain `fetch` to PostgREST** — same RLS as iOS. The shared `assets/portal.js` exposes `ELP.rest()` and `ELP.callFn()` that send the user JWT. No `.functions.invoke()`-style helper needed.
- **Web magic-link redirect URLs.** Supabase Auth → URL Configuration must include `https://easierlet.com/login/` (and `localhost:4173/login/` for testing) or magic links will bounce. Legacy `/tenant/login/` + `/landlord/login/` are kept as redirect stubs so old emails still resolve.

### Referencing language

- Tenant-facing UI uses "independent referencing provider"
- Never says "Vorensys" to the tenant

### Paths

- Swift project: `~/Documents/EasierLet/` (Xcode project root)
- Web forms: `~/easierlet-web/`
- Functions deploy dir: `~/Documents/EasierLet/supabase/functions/`

### Claude Code setup

- `[CLAUDE.md](http://CLAUDE.md)` drafted at repo root — points to `PROJECT_[LOG.md](http://LOG.md)`, captures deploy commands, key conventions, "what NOT to do" list
- `.mcp.json` for Supabase MCP server (add to `.gitignore` — contains token)
- GitHub repo: `bluetezza/easierlet-swift`

---

## Current priorities (as of 2026-04-26)

1. **End-to-end smoke-test the maintenance overhaul + visits build** — tenant raises a request → landlord acknowledges with trade + ack notes → tenant receives `maintenance-notify` email → landlord schedules a visit linked to the request → tenant receives `visit-notify` email → tenant accepts via `/visit-response/` → landlord marks visit completed (+ linked maintenance) → tenant receives completion email → tenant confirms in portal. Key checks: `tenant_id` populated on every new request, RLS lets active tenants see their property's visits, 24h notice gate fires, junction `visit_maintenance_links` populated. The MCP migrations and EF deploys are already live.
2. **Verify the website portals end-to-end** with a real landlord and tenant account: properties CRUD, listing publish from web, viewing-request confirm, tenancy generate+sign canvas signature, inventory send, document upload. Particularly check that all the RLS policies allow inserts via the user JWT (everything that works in iOS should work here, but worth confirming).
3. **Add `https://easierlet.com/login/` to Supabase Auth → URL Configuration → Redirect URLs** so magic links sent by `/login/` actually land back on it (the legacy `/tenant/login/` and `/landlord/login/` redirect stubs already preserve the auth fragment, but the canonical URL should be in the allow-list).
4. TEST `invite-tenant` `getUser(jwt)` fix end-to-end — deployed 2026-04-22 but unverified
5. Backfill Sean Lock + Judge Live test tenant auth accounts (portal email test)
6. FIX floating map on public `/listings/` page overlapping sticky CTA bar
7. Reorganise `ViewingRequestsView` by property (flat list → per-property sections / filter chips)
8. Surface per-property viewing counts on `DashboardPropertyCard` / `PropertySummarySheet`
9. Delete `AddTenantChooserView.swift` from Xcode project
10. Re-verify Stonebridge Drive + remaining 10 properties via postcode picker (populate structured fields + coords)
11. Delete `/apply/` (old form) after E2E test of `/apply-v2/` passes
12. Wire **Group-by-trade list header → Checkatrade postcode deep-link** for the contractor batching flow.

---

## Remaining small items (parked)

- [ ] Guarantor-as-tenant with role "guarantor" (separate creation flow needed)
- [ ] Number-of-occupants discrepancy warning on joint tenancies
- [ ] Deploy app icon (`AppIcon.appiconset` in v4 zip)
- [ ] 360 photo: add soft warning in `ListingMediaPicker` when upload isn't equirectangular (2:1 aspect ratio)
- [ ] Pre-application review on its own web page (the tenant detail panel covers the read side; full review form on web is a TODO)
- [ ] Maintenance request → transactions linkage on web (`transaction_id` exists in the schema; UI not yet wired)
- [ ] Tenant-side maintenance reporting on `/tenant/`
- [ ] Director's loan implementation (web placeholder matches iOS placeholder)

---

## Session history (newest first)

### 2026-04-28 — Admin, Audit, Privacy, Retention & DSAR

End-to-end build of roadmap item 8. Five parts shipped together: append-only audit log, separate admin domain with mandatory MFA, RLS audit + sensitive-data inventory + automated security check, GDPR-compliant retention with nightly enforcement, and DSAR export (admin + tenant self-serve). Plus public privacy/terms/retention pages on easierlet.com and three internal policy documents in the new admin repo.

**Database (live)**
- New `audit_log` table with append-only `RULE … DO INSTEAD NOTHING` and a `log_audit()` SECURITY DEFINER helper. RLS enabled with no user-facing policies — service-role only from Edge Functions, but `authenticated` can call the helper RPC.
- New `admin_users` table (RLS, no user-facing policies) — bridges Supabase auth → admin role.
- New `retention_rules` table (8 seeded rules) + retention-tracking columns on `tenants` (`retention_expires_at`, `retention_warning_sent_at`, `anonymised_at`, `retention_deferred_until`) and `viewing_requests`.
- BEFORE-UPDATE trigger `compute_tenant_retention()` sets retention deadlines on status transitions to `archived` (72mo) or `rejected` (6mo). Backfilled for existing terminal-status rows.
- BEFORE-INSERT trigger on `viewing_requests` sets a 12mo deadline.
- Sensitive PII columns annotated with `PII:personal | PII:financial | PII:employment | PII:sensitive | PRIVATE:landlord | AUDIT:consent` via `COMMENT ON COLUMN`.
- `pg_cron` + `pg_net` extensions enabled. `retention-enforce-nightly` cron at `0 3 * * *` UTC, calling the EF with a `RETENTION_CRON_SECRET` bearer (read from Vault).

**Edge Functions (deployed)**
- 11 existing EFs **instrumented** with `log_audit()` calls (invite-tenant, listing-apply, viewing-request, viewing-response, send-viewing-confirmation, landlord-signup, stripe-webhook, maintenance-notify, visit-notify, visit-response, tenant-workflow, tenancy-workflow, inventory-workflow). All audit calls fire-and-forget with `.then(() => {}, console.error)` so they never block the primary action. IP + user-agent captured per request.
- `admin-auth` — password sign-in + admin_users gate + TOTP MFA (challenge / verify / first-time enrol).
- `admin-api` — every action verifies AAL2, admin_users.is_active, then runs with service-role and writes to audit. 11 actions implemented.
- `seed-admin` — one-time bootstrap (SEED_SECRET-gated), idempotent.
- `security-check` — admin-only health report (RLS, orphaned data, retention queue, audit recent writes, service-role-in-URL sanity).
- `retention-enforce` — nightly job, two passes (warnings + anonymisation), shared-secret authenticated.
- `generate-dsar` — branded HTML export, 24-hour signed URL, admin + self-serve modes with self-serve filter excluding landlord-only fields.
- `tenant-delete-account` — tenant-initiated erasure (anonymise + auth.admin.deleteUser + landlord email + audit).

**iOS (`bluetezza/easierlet-swift`)**
- New `AuditLogger.shared.log(...)` helper. Wired into `DocumentsView` (uploaded/viewed/deleted), `PropertyViewModel` (created/updated/archived), `TransactionsViewModel` (created), `TenantsViewModel.updateMaintenanceRequest` (status_changed).
- Tenant portal Profile menu: Download My Data, Delete My Account, Privacy Policy, Terms of Service. New `TenantStatusGuide` already present from item 7.
- Tenant Guide tab adds a sixth section: "Your data & privacy" — what we hold, why, how long, your rights, contacts.
- More tab → new "LEGAL" section linking to /privacy/, /privacy/retention/, /terms/.

**Web (`bluetezza/easierlet-web`)**
- Privacy policy at /privacy/ rewritten to v2 — 11 sections, ToC, processor list, ICO contact.
- New /privacy/retention/ — plain-English retention summary table.
- New /terms/ — landlord Terms of Service: account, billing, acceptable use, data-controller/processor split (this is the load-bearing legal note), liability cap, governing law.

**New repo (`bluetezza/easierlet-admin`)**
- Pure static site at `admin.easierlet.com`. 7 pages: index (login + MFA flow), dashboard, landlord, audit, retention, dsar, settings. Shared `assets/admin.css` (dark teal admin header) and `assets/admin.js` (auth helpers + admin-api wrapper).
- Three internal policy docs at `docs/internal/`: data-protection-policy.md, admin-operations-manual.md, security-policy.md.
- DNS pending: add `admin CNAME bluetezza.github.io.` at the easierlet.com host.

**Activation steps remaining**
1. Set `SEED_SECRET` and `RETENTION_CRON_SECRET` in Supabase secrets.
2. Add the cron secret to Vault: `SELECT vault.create_secret('retention_cron_secret', '<value>');` then re-run the `retention_cron_schedule` migration so pg_cron picks it up.
3. Bootstrap the admin: `curl -X POST 'https://ffzknvcptqjlkxmkdxuk.supabase.co/functions/v1/seed-admin' -H 'Authorization: Bearer <SEED_SECRET>' -H 'Content-Type: application/json' -d '{"email":"admin@easierlet.com","password":"<strong-12+>","name":"Terry Baldwin","role":"owner"}'`. Then unset `SEED_SECRET`.
4. Add `admin CNAME bluetezza.github.io.` at the DNS host.
5. Sign in at admin.easierlet.com — first login prompts QR enrolment in Microsoft Authenticator.

**Audit catalogue** — full list of action strings is in `docs/internal/admin-operations-manual.md` Section 10 and reflected in the admin app's audit-filter dropdown.

### 2026-04-27 — Onboarding, Billing (Stripe placeholder), Compliance & Documents guidance

End-to-end build of roadmap item 7. Four parts: automated landlord signup + billing scaffolding, in-app guided onboarding, tenant portal guidance, and Documents-section mandatory-document compliance UI. Stripe is wired but failing-closed until keys are set.

**Database**
- `landlord_subscriptions` table created (RLS-scoped, user_id UNIQUE, plan + status CHECKs, property_limit). Existing landlords back-filled with a 14-day trialing row.
- `landlord_profiles.onboarding_completed_at` added (nullable, sets when landlord dismisses dashboard onboarding card).

**Edge Functions (live, deployed via terminal)**
- `landlord-signup` (no-JWT, Turnstile-protected) — creates auth user, profile, trialing subscription, profiles.role='landlord', sends Resend welcome email.
- `create-checkout-session` (JWT) — Stripe Checkout subscription mode. Returns 503 `stripe_not_configured` until secrets are set.
- `stripe-webhook` (no-JWT, signed) — verifies HMAC signature, syncs `landlord_subscriptions` from `checkout.session.completed`, `invoice.payment_succeeded`, `invoice.payment_failed`, `customer.subscription.deleted`, `customer.subscription.updated`. Emails landlord on payment failure.
- `billing-portal` (JWT) — Stripe Customer Portal session for plan changes / card update / cancel.

**Web (`bluetezza/easierlet-web`)**
- New `/signup/` landing page — hero + feature grid + 4-tier pricing + Turnstile-protected signup form. On success signs in and redirects to `/landlord/`.
- New `/billing/` dashboard — shows plan, usage, trial countdown, upgrade buttons, Manage billing button. Gracefully shows "Billing setup pending" while Stripe keys are absent.
- `/billing/success/` and `/billing/cancel/` confirmation pages.
- Sidebar gains "Billing" entry on every landlord page.
- Landlord dashboard now mirrors the iOS onboarding card (10 derived steps, progress bar, Continue / I'll do this later) and shows a per-property compliance pill on each property card (Compliance: X/Y · expired flag in red).
- All dashboard / tab queries (maintenance, transactions, documents, tenancies, tenants, visits) filter out items linked to archived properties so the active surfaces stay clean.

**iOS (`bluetezza/easierlet-swift`)**
- `SubscriptionManager.shared` singleton — caches subscription, exposes `atPropertyLimit` + `canAddProperty`, opens Checkout / Customer Portal in Safari, auto-refreshes every 30 minutes.
- `SubscriptionView` in More tab → Account section. `TrialStatusBanner` on DashboardView for past-due / expired / trial-ending-soon cases.
- `+ Add property` toolbar button gated: shows "Plan limit reached" alert with Upgrade CTA when at the property limit.
- New `OnboardingProgress` struct + `OnboardingCard` view — derives 10 steps from existing data (no new tables), renders dashboard card with progress bar + tappable continue. Dismiss writes `onboarding_completed_at` and hides the card permanently.
- `ContextualPromptBanner` + `FirstVisitBanner` shared components. First-visit banners on Documents / Maintenance / Transactions tabs (UserDefaults-keyed, "Got it" dismisses).
- Better empty states on Dashboard (Welcome → Add Your First Property), Transactions, Maintenance (with how-it-works steps), Tenants (two paths explained).
- Tenant portal Guide rewritten as 5 collapsible sections (Your responsibilities, How maintenance works, Understanding your documents, Moving out, Your rights) with concrete 999 / 0800 emergency contacts. Tenant home gains a status-aware `TenantStatusGuide` card explaining what each pipeline step means.
- New `MandatoryDocuments` constants (7 items across Legal / Essential / Recommended urgency tiers). DocumentsView restructured to show per-property compliance bar + grouped mandatory cards; missing items render placeholder cards with `Upload Now →` (opens AddDocumentView pre-selected to that category and property). `OTHER DOCUMENTS` section preserves the existing categorised list.
- `AddDocumentView` accepts `initialCategory` for pre-selection.
- Dashboard `PropertyCard` shows compliance pill; `PropertySummarySheet` shows COMPLIANCE section. Actions Needed list now includes missing legal docs and expired certs at the top.
- All view models (Dashboard / Tenants / Transactions / Inventory / PropertyVisits) filter items linked to archived properties so the main surfaces stay focussed.

**Stripe activation steps** (when keys are ready):
1. `supabase secrets set STRIPE_SECRET_KEY=sk_… STRIPE_WEBHOOK_SECRET=whsec_… STRIPE_PRICE_STARTER=price_… STRIPE_PRICE_GROWTH=price_… STRIPE_PRICE_PROFESSIONAL=price_…`
2. In Stripe Dashboard → Webhooks: add endpoint `https://ffzknvcptqjlkxmkdxuk.supabase.co/functions/v1/stripe-webhook`, subscribe to the five event types listed in the EFs table above.
3. Stripe Dashboard → Settings → Customer Portal: enable + configure plan-switching and cancellation rules.
No further code changes required — the EFs flip from 503 `stripe_not_configured` to live behaviour as soon as the env vars are present.

### 2026-04-26 — Maintenance overhaul + Property visits shipped (Claude Code build)

End-to-end build of roadmap item 6. Both the iOS app (`bluetezza/easierlet-swift`) and the web (`bluetezza/easierlet-web`) now share the new flow. Production migrations applied direct to project `ffzknvcptqjlkxmkdxuk`; three Edge Functions deployed.

**Database (live)**

- `maintenance_requests`: added `trade_type`, `rejection_reason`, `rejection_notes`, `rejected_at`, `scheduled_date`, `contractor_name`, `contractor_phone`, `completed_at`, `linked_visit_id`. Replaced `status` CHECK with the 8-state flow. Added `trade_type` and `rejection_reason` CHECKs. Default status flipped to `'new'`. Added `idx_maintenance_requests_user_status`.
- New `property_visits` table — see "Database (`property_visits` table)" above for full schema. RLS: landlord owns; active tenants on the property get SELECT.
- New `visit_maintenance_links` junction.
- `maintenance_requests.linked_visit_id` → FK to `property_visits.id` once that table existed.
- `set_updated_at()` trigger function (re-installable via `CREATE OR REPLACE`) wired to `property_visits`.

**Edge Functions (live)**

- `maintenance-notify` — Resend wrapper. `new_request` emails landlord; `status_changed` emails tenant per status (acknowledged / rejected / awaiting_info / scheduled / completed). Branded shell matching `viewing-response`.
- `visit-notify` — `send_notice` (24h gate, returns `notice_too_short` if violated; emails active tenants with tokenised confirm link; sets visit→`notice_sent`), `send_update`, `send_cancellation`.
- `visit-response` — token-auth public endpoint. GET returns visit/property/landlord snapshot; POST `accept` flips `tenant_response=accepted` + status→`confirmed` + emails landlord; POST `request_reschedule` saves note + emails landlord.

All three: `deno.json` present, esbuild-clean, deployed via `supabase functions deploy …` from `~/Documents/EasierLet/`. `visit-response` deployed with `--no-verify-jwt` (token-auth).

**iOS — bluetezza/easierlet-swift**

- `MaintenanceRequest` struct expanded with all new columns + computed `statusLabel`/`statusColor`/`tradeLabel`/`rejectionReasonLabel`/`isOpen`.
- `TenantsViewModel`: replaced `updateMaintenanceStatus` with a flexible `updateMaintenanceRequest(_:updates:notifyAction:notifyStatus:notifyNotes:)` that hooks into `MaintenanceNotifier`; legacy method kept as a wrapper. Added `loadTransactions(for:)` and `tenantById(_:)`.
- `MaintenanceDetailView` rebuilt — header card, triage section (Acknowledge / Reject / Request more info each with inline forms), progress section (status chip row, contractor + dates + resolution notes + transaction picker + Schedule visit button), rejection card with Reopen, vertical timeline.
- `MaintenanceView` (PlaceholderViews): filter chips All / Open / Completed / Rejected, group-by-trade toggle, emergency-first sort, trade pills on rows.
- Tenant portal maintenance card (`TenantMaintenanceCard`) handles awaiting-info reply (appends timestamped note + flips status back to `new`), shows rejection reason, lets tenant confirm completed → closed.
- `DashboardView`: open/maintenance counts updated for new statuses; activity feed reflects per-status colour + label; `PropertySummaryData` carries a `nextVisit` field; PropertySummarySheet shows next visit; cert renewal action items prompt scheduling when gas/EICR/EPC expire ≤60d with no matching visit booked; "X visits in next 2 weeks" surfaced in actions list.
- New files: `MaintenanceNotifier.swift`, `VisitNotifier.swift`, `PropertyVisit.swift` (model + `PropertyVisitsViewModel`), `PropertyVisitsView.swift` (list + Create + Detail).
- More tab gains a "Visits" section linking to `PropertyVisitsView`. `MaintenanceDetailView` exposes "Schedule visit" pre-linked to the request.
- Tenant portal Home tab gains `TenantVisitsSection` — upcoming + collapsible past list, inline Confirm / Reschedule buttons that hit `visit-response` directly via the per-row token (no auth needed).

**Web — bluetezza/easierlet-web**

- `/landlord/maintenance/` rewritten — open / completed / rejected / all tabs, group-by-trade toggle, full triage modal mirroring iOS (acknowledge / reject / request-info forms), progression chip row, contractor + dates + resolution editor, reopen, timeline, status badge palette.
- New `/visit-response/` — branded teal page mirroring `/viewing-response/`. Reads visit by token, shows date / type / who / address, Accept or Request Reschedule (with optional note). Handles cancelled / already-responded states.
- All web maintenance writes call `maintenance-notify` via `ELP.callFn` after the PATCH so emails fire from the web too.

**Conventions reinforced**

- Direct Swift → Supabase REST update for the `maintenance_requests` row, then `MaintenanceNotifier.shared.notify(...)` for the email. Justifies keeping the EF separate from a status-only mutation EF — avoids duplicating the column-set logic on both sides.
- Edge Function emails always from `no.reply@easierlet.com` via Resend, branded shell duplicated rather than shared (each EF stays self-contained).
- `[String: String?]` updates dictionary handles nullable field clears (e.g. on Reopen).

### 2026-04-26 — easierLet website live: homepage, search, full landlord portal, unified login

The website went from a set of companion pages (no homepage, no logged-in surface) to a full public site with feature parity to the iOS landlord app. Three PRs landed today, all on `bluetezza/easierlet-web` and live on `easierlet.com`.

**[PR #1](https://github.com/bluetezza/easierlet-web/pull/1) — Homepage, properties search and tenant + landlord portals (squash `2a25a46`)**

- New homepage `/` with hero search (area / bedrooms / available-by) and two-portal CTAs.
- New `/properties/` searchable index with filters (area, min beds, max rent, available-by, furnishing), pagination, sort.
- New `/tenant/login/` and `/landlord/login/` (later collapsed in PR #3).
- New `/tenant/` portal: overview, applications, viewings, tenancy, documents, settings.
- New `/landlord/` portal: dashboard, listings (status switcher + new-listing modal), viewing requests inbox (confirm/decline), tenants, tenancies, transactions, documents, settings.
- Shared `assets/portal.js` (Supabase client via esm.sh CDN, auth helpers, sidebar shell, tab routing, toast) and `assets/portal.css`.
- New Edge Function `listings-search` (lives in the swift repo at `supabase/functions/listings-search/`) — joins `property_listings` + `properties`, filters on `status='live'`, area `ilike` across city/postcode/address_line1, paginated. Deployed via `supabase functions deploy listings-search` from `~/Documents/EasierLet/`.
- Then media upload manager added to the landlord listings tab — drag-drop / click-to-browse, photo / 360° / floorplan / video tabs, presign → R2 PUT (with progress) → confirm flow using the existing `listing-media-upload` edge fn. First photo on a fresh listing auto-marked as hero. Means non-iOS landlords can publish listings end-to-end from the website.

**[PR #2](https://github.com/bluetezza/easierlet-web/pull/2) — Full iOS parity on the landlord portal (squash `37b1993`, +2,995 lines / 10 files)**

- New `/landlord/properties/` — full CRUD with UK postcode lookup (`address-lookup` edge fn), collapsible mortgage details, archive/restore.
- New `/landlord/listing/?id=…` — full editor (headline, description, rent, deposit, available-from, 24-amenity tag grid, status workflow with publish hints, performance stats sidebar).
- New `/landlord/inventory/` and `/landlord/inventory/?id=…` — list + create + per-room/item condition editor; default room template pre-populated; Send to tenant + Finalise via `inventory-workflow` edge fn.
- New `/landlord/tenancy/?id=…` — APT agreement: property + dates + DPS scheme + multiple signers (lead/joint) + custom clauses; Generate-and-send + landlord canvas signature + Finalise via `tenancy-workflow`.
- New `/landlord/maintenance/` — open / acknowledged / resolved tabs, detail modal with notes + state transitions; Log new request modal.
- New `/landlord/loan/` — Director's loan placeholder (matches iOS).
- New `/landlord/useful-links/` — DPS schemes, right-to-rent, EPC, "How to rent", tax & finance.
- New `assets/signature.js` — DPR-aware canvas signature pad (mouse + touch + stylus, base64 PNG matching iOS).
- Action modals on `/landlord/`: Add transaction (type-aware categories), Upload document (Supabase Storage `documents` bucket), Invite tenant (`invite-tenant` edge fn), Add viewing (offline-arranged), Tenant detail panel (Approve / Send-to-referencing / Archive).
- Sidebar nav adds Properties, Inventories, Maintenance, Director's loan, Useful links.

**[PR #3](https://github.com/bluetezza/easierlet-web/pull/3) — One sign-in for tenants and landlords (squash `806b795`)**

- New `/login/` — single sign-in / sign-up + magic link. On signup the user picks Tenant or Landlord (URL `?role=` pre-picks).
- After auth, looks up `profiles.role`. Fallbacks: `tenants.tenant_auth_id = auth.uid()` → tenant; otherwise → landlord.
- `/tenant/login/` and `/landlord/login/` rewritten as thin redirect stubs to `/login/`, preserving `?next=`, query and hash so legacy magic-link emails still work.
- Homepage nav collapsed to single "Sign in" CTA. Portal cards still split visually but each links to `/login/` with the role pre-picked for signup.
- `?next=` is honoured if it points at the role's home, `/properties/`, `/`, or a legacy login URL — otherwise routes to the role's home so a tenant doesn't accidentally land on `/landlord/`.
- All 9 portal pages updated to `ELP.requireSession("/login/")`. Net code reduction (-164 lines: duplicate forms gone).

**Production state**

- `listings-search` edge fn deployed to project `ffzknvcptqjlkxmkdxuk`. Smoke-tested live: returns real listings.
- Three PRs merged into `main`. GitHub Pages auto-deployed each time. All pages live on `easierlet.com`.
- Smoke-tested: `/`, `/properties/`, `/login/`, `/tenant/login/`, `/landlord/login/`, every `/landlord/*` page → all 200, no console errors.

**Known follow-ups (also under "Current priorities" above)**

- Add `https://easierlet.com/login/` to Supabase Auth redirect URL allow-list.
- End-to-end smoke test with a real landlord + tenant account.
- Director's loan, full pre-application review form on web, web-side maintenance request → transaction linkage, tenant-side maintenance reporting.

### 2026-04-26 — Maintenance & visits planning + onboarding discussion

- Reviewed current maintenance workflow end-to-end: identified 6 gaps (no `tenant_id` on insert, `BadgeCounts` filtering on wrong status, no landlord editing UI for notes/dates, no structured triage step, no notifications, no category UI)
- Designed full maintenance lifecycle: `new → acknowledged → awaiting_info → scheduled → in_progress → completed → closed` + `rejected` branch
- Designed property visits system: unified scheduling for maintenance/inspections/certificates, `property_visits` + `visit_maintenance_links` tables, 24hr notice enforcement, tenant response flow
- Designed rejection workflow with structured reasons (tenant_responsibility, duplicate, cosmetic, pre_existing, other)
- Designed trade type grouping for contractor batching
- Created comprehensive Claude Code prompt (`[maintenance-and-visits-prompt.md](http://maintenance-and-visits-prompt.md)`) covering both Part A (maintenance overhaul) and Part B (property visits)
- Discussed landlord onboarding: web signup + Stripe billing architecture, in-app guided onboarding checklist, contextual empty states
- Discussed [CLAUDE.md](http://CLAUDE.md) setup for Claude Code

### 2026-04-25 — Fault finding & bug fixes (6 sub-sessions)

- **Portal email bug — FIXED:** Root cause was `TenantDetailView` doing a direct DB update (`supabase.from("tenants").update(["status": "referencing"])`) instead of calling `tenant-workflow?action=approve_pre_application`. Bypassed auth account creation and email sending. Fixed by replacing inline code with call to `vm.approvePreApplication(tenant)`.
- **`preferred_role` NULL bug — FIXED:** All tenants had `preferred_role = NULL` despite apply-v2 form having the code. Root cause: stale deployed `listing-apply` Edge Function. Re-copied local file (5 occurrences of `preferred_role`) and redeployed. Verified via SQL with Forrest Gump test tenant showing `preferred_role = 'joint'`.
- **Apply-v2 validation overhaul** (commit 468ff57): All fields required except `additional_income`/`additional_income_source`/`children`. Conditional required: pet details, visa type/expiry, adverse/eviction/arrears details. Validations: email regex, UK phone, DoB 18+, visa expiry future, income 1–10M, years 0–60, start date today+, adults 1–20. `novalidate` on form, red asterisks, inline errors + summary block, scroll-to-first-error.
- **ListingEditorView preview link** (commit 93a452e): For live listings, three-button HStack (View / Share / Delist) with tappable URL.
- **360 photo diagnosis:** Confirmed flat rendering caused by uploading via "Photos" instead of "360°" button — sets wrong `media_type`. Pannellum only activates in lightbox for `photo_360` type.
- **`tenant-workflow` deploy investigation:** `approve_pre_application` and `get_invite` actions not reaching live function — root cause was `cp` command using placeholder path instead of actual `~/Downloads/` path. Redeployment instructions given.
- Updated Edge Functions table with all current functions and versions
- Added key learnings: direct DB updates bypass EF side-effects, `verify_jwt=false` pattern, `.ics` auto-invite trap, numeric coercion at API boundaries

### 2026-04-25 — Claude Code setup

- Drafted `[CLAUDE.md](http://CLAUDE.md)` for repo root with key conventions, deploy commands, and "what NOT to do" list
- Discussed `.mcp.json` for Supabase MCP server
- Advised on working patterns: Claude Code for multi-file refactors + EF development, chat for planning sessions

### 2026-04-25 — Git setup

- Walked through git init/push for `~/Documents/EasierLet/` → `bluetezza/easierlet-swift`
- `.gitignore` for Xcode/Swift projects (build/, DerivedData/, xcuserdata/, Pods/, secrets)

### 2026-04-20 — Short listing codes + property numbers

- Migration: `generate_unique_listing_slug()` RPC (7-char base58, collision retry) replaces `generate_listing_slug(text)`. Old RPC dropped.
- Migration: `[properties.property](http://properties.property)_number TEXT NULL` + partial unique index `(user_id, property_number) WHERE property_number IS NOT NULL`
- `Property` struct: `propertyNumber: String?` + `numberBadge` computed property
- `AddPropertyView`: new FormField "Property Number (optional)". Both Encodable structs updated.
- `PropertyViewModel.load()` select list extended. Same for `AddViewingView`.
- `#N` teal pill badge on `PropertyCard`, `DashboardPropertyCard`, `PropertySummarySheet`
- `ListingsRepository.createListing` calls RPC with no params
- Files delivered: SQL migration, `UserProfile.swift`, `PropertyViewModel.swift`, `ListingsRepository.swift`, `DashboardView.swift`, `AddViewingView.swift`

### 2026-04-19 — Property listings full build + viewing workflow

- Built public listings page (`/listings/?slug=…`) with gallery, 360 support (Pannellum), sticky CTA
- Built `/apply-v2/` cold-apply form (Turnstile-protected)
- Built viewing workflow: `viewing-response` Edge Function (token-auth, accept/decline), `send-viewing-confirmation` v8 with teal CTA button, `/viewing-response/` web form
- iOS: removed "Mark as completed" button, added Archive + Invite to Apply buttons on confirmed viewings
- Built `listing-public-fetch` Edge Function
- Fixed `viewing-response` v1 crash: PostgREST `!inner` join on sibling tables (no FK) — split into two queries
- Fixed `invite-tenant` `invalid_auth`: `supabase.auth.getUser()` no-arg reads nonexistent session — fixed to `getUser(jwt)` with JWT from Authorization header
- `let_agreed` listing state: hides CTAs, shows banner on public page
- `invite-tenant` v11: `getUser(jwt)` fix deployed but not yet verified end-to-end
- Floating map overlapping sticky CTA flagged as bug — pending fix

### 2026-04-18 — Property listings wiring + structured addresses

- Structured address migration: PostGIS + generated location column + GiST/postcode indices
- Property listings wiring: 6 of 6 targets done (viewings link, marketing section, tenant routing, invite button, dashboard badges, address picker)
- Tenant struct expanded with pre-application fields + `RankingRationaleItem`
- `TenantsViewModel`: `approvePreApplication`, `rejectTenant`, `setShortlisted` added
- `TenantsView` routing: `awaiting_review` → `PreApplicationReviewView`, envelope toolbar → `InviteTenantView`
- DashboardView: `BadgeCounts.shared` + "INBOX" strip
- Files delivered: `UserProfile.swift`, `PropertyViewModel.swift`, `PlaceholderViews.swift`, `Tenant.swift`, `InviteTenantView.swift`, `DashboardView.swift`
- This `PROJECT_[LOG.md](http://LOG.md)` created

### 2026-04-18 — Open Banking investigation

- Investigated free UK open banking APIs for bank transaction tagging
- GoCardless free route confirmed closed (July 2025)
- Established regulatory distinction: own account (free via personal access token) vs third-party (requires FCA AISP or paid aggregator)
- Phased plan agreed: CSV/OFX import → Starling personal token → paid aggregator

### 2026-04-18 — AI social video ads design

- Chose Path A (Shotstack template composition, ~£0.15/video) over Path B (generative video — legal risk of fabricated rooms)
- Designed 27s 9:16 vertical reel format driven by room metadata
- Created Shotstack template JSON + HTML preview
- Scoped `generate-listing-video` Edge Function + new `property_listings` fields

### Earlier sessions (reconstructed from memory, not exhaustive)

- Tenant portal iOS build (Home, Docs, Maintenance, Guide, timeline, maintenance workflow, role-based auth, archived docs, two-stage referencing, password-based signup)
- `tenant-workflow` Edge Function iterated to v44
- `CHECK CONSTRAINT` updated to allow `'referencing'` status
- Inventory PDF + digital signatures + meter readings (item 4 complete)
- Tenancy agreements multi-tenant signing
- Vorensys Phase 1 deep-link integration
- Dashboard build
- Tab bar restructure: Maintenance promoted to tab 3, Tenants demoted to More
