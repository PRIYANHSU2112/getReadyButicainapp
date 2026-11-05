# UI Audit — Beautician Partner App vs Figma

**Scope:** every screen in `gr-butician/src` compared against every design in `src/assets/Get Ready💄/`.
**Status:** analysis only. No code has been changed.
**Date:** 2026-11-02

---

## Implementation status (updated 2026-11-03)

Approved plan: proceed in the order of §6. `tsc --noEmit` is clean and the touched files lint with no errors. **Not yet run on a device** — everything below needs a visual pass.

**Done**

| Item | What changed |
|---|---|
| A2 KYC bypass | Removed the "Preview View" switcher; status now comes only from `partner.kycStatus`. Added pull-to-refresh (`reloadPartner`) so a waiting partner can see approval. "Go To Dashboard" no longer sets `approved`. |
| A3 fake requested items | Check-In and Service-Added screens render the real items; removed the invented "Classic Manicure ₹245/₹445", `bk-101` fallbacks and `₹1500` default. |
| A4 Delete Account | Now files a real support ticket (`POST /support`, category `Partner`) and says so; no fake "scheduled for deletion", no forced logout. Removed the unreachable duplicate in `ProfileScreen`. Partner-specific copy in the modal. |
| A5 transaction status | Status, payment text, bank row and ids come from the transaction; removed the invented PNB / PhonePe / date / id. |
| A6 end service | Needs a press-and-hold (800 ms); a plain tap shows a hint. |
| A1 SOS | Opens the dialer on **112** instead of claiming police and contacts were notified. Modal copy fixed. *Interim only — see below.* |
| A7 cashback banner | Removed (no top-up flow exists). |
| A8 / reviews | "Service Review" sections render only when real reviews exist; removed the dead "View All" and the fake alert. |
| A10 tier | Shared `utils/tier.ts` drives the Dashboard tier badge, the "N bookings away from …" banner and the Profile badge. |
| Also found | Fake price band in `EditPackageScreen` (now ±10 % of the fixed price); `PaymentStatusCard` defaults (`879` / `1500`) and a false "Advance of ₹0 was paid"; Dashboard rating showed a seeded value for unrated partners. |
| §2.1 tokens | `colors.ts` converted to UTF-8; Figma brand colours added; light theme `primary` is now `#114B44`. |
| §2.2 typography | Defined the missing `h4`, `body1`, `body2`, `captionSmall` (previously `undefined`, so `Input` text and small `Badge` text were unstyled). |
| §2.4 headers | New `BackButton` (crimson on blush); used by the shared `Header` and `OnboardingHeader`. 15 hand-rolled back-button circles + 13 chevrons retuned to Figma colours. |
| §3.1 Auth | Splash rebuilt (green panel, peak, GET/READY wordmark); Login copy and title fixed; onboarding slide text order fixed; brand green tokenised in auth, tab bar, duty switch. |
| §4.1 missing designs | Dashboard **offline state** with swipe-to-go-online (`SwipeToConfirm`); My Services **Active / Paused** cards; Notifications **"Quiet for now"** via a new shared `EmptyState`. |

**Not done — and why**

| Item | Reason |
|---|---|
| A1 real SOS (alert contacts / ops with live location) | Needs a backend SOS endpoint; none exists. |
| A9 Dark Mode / Language / App Version | Needs your decision: implement, or hide the rows. |
| SVG icon set, bundled fonts | Needs the Figma icon/font assets and a native rebuild. |
| Splash logo glyph, "CLOSED" sign illustration | Drawn with plain Views as stand-ins; replace with the real assets. |
| Onboarding hero photos | The app's three images are different artwork from Figma's photos; need the originals. |
| 9 Bookings screens with a bare dark chevron (no circle) | Structural change; belongs to the per-flow pass (Phase 4). |
| Remaining `#114B3E` literals (≈370 in 78 files), emoji → icons, shared `FilterChips` / `StatusPill` / `ServiceRowCard` / `OtpInput` | Phase 4, per flow. |
| Expertise / leaderboard screen; completed-booking before/after photos and review | Need API data. |

---

## 0. How to read this report

| Priority | Meaning |
|---|---|
| **Critical** | The screen shows false information, a safety/security control doesn't work, or the brand is wrong. Fix before release. |
| **High** | Visible mismatch on a primary screen, or a designed screen/state that doesn't exist in the app. |
| **Medium** | Component-level mismatch on a secondary screen, or a shared-component gap that affects many screens. |
| **Low** | Polish. |

**Impact column** — every recommendation states its effect on functionality:
- **UI only** — style/markup change, no logic, API, navigation or state touched.
- **UI only (data exists)** — new UI that renders data the app already fetches.
- **Needs API** — requires a backend field or endpoint that doesn't exist today.
- **Behaviour change** — alters what a control does; needs your decision.

### Inputs

| | Count |
|---|---|
| Files in the Figma folder | 180 |
| Exact byte-duplicates (`(2)`/`(3)` copies) | 44 |
| Section-label frames with no UI (`Frame 8`, `Frame 2147207561/62/65/66`) | 5 |
| **Unique designs reviewed** | **131** |
| App screens (`src/screens/**`) | 65 |
| Shared components (`src/components/**`) | 38 |

> Note: `Profile-N (2).png` and `Home-N (2).png` are **not** duplicates of `Profile-N.png` / `Home-N.png`. They are separate design sets. Only files with identical content were collapsed.

### Limitation — read this before implementation

The exported PNGs are low resolution (≈240 px wide). Layout, structure, components, copy, icons and colours can be compared reliably — colours below were **sampled from the PNG pixels**, not eyeballed. **Exact pixel spacing, font sizes and font families cannot be measured from these exports.** For a true pixel match, implementation needs either Figma Dev Mode / Inspect access or 2× / 3× exports. Where this report gives a size, it's marked *approx*.

---

## 1. Executive summary

### 1a. Found during the audit — not UI, but must be fixed first

These came up while mapping screens. They are not styling problems; they are places where the app tells the user something untrue or a safety/security control doesn't work. I've kept them separate because they need your decision, not a design match.

| # | Issue | File | Why it matters | Priority |
|---|---|---|---|---|
| A1 | **SOS does not send anything.** Dashboard SOS shows *"Emergency Response Team, Police Helpline (112), and your verified safety contacts have received your live location"* — but makes no API call and shares no location. It only toggles duty off. In Service Check-In, SOS confirm just closes the dialog. | `screens/Home/DashboardScreen.tsx:430-440`, `screens/Bookings/ServiceCheckInScreen.tsx:208` | A partner in danger is told help is coming when it isn't. | **Critical** · Needs API |
| A2 | **KYC can be bypassed from the UI.** Verification Center ships a visible "Preview View:" demo switcher. Tapping **Verified** calls `updatePartner({kycStatus: "approved"})`; **Go To Dashboard** does the same. `RootNavigator.tsx:79` gates `MainTabs` on that in-memory value, so an unverified partner gets into the full app until restart. | `screens/Profile/VerificationCenterScreen.tsx:34-47, 82-132` | Business-logic hole. Fix is subtractive: remove the switcher; gate "Go To Dashboard" on `reloadPartner()`. | **Critical** · Behaviour change |
| A3 | **Requested extra items show fabricated prices.** Every requested item renders as `"Classic Manicure"`, tag `Nails`, `45 min`, **`₹245.00` struck from `₹445.00`**, whatever was actually requested. | `screens/Bookings/ServiceCheckInScreen.tsx:139-150` | Partner sees wrong prices mid-service. | **Critical** · UI only (data exists) |
| A4 | **Delete Account doesn't delete.** Shows *"scheduled for permanent deletion"*, makes no API call, then logs out. | `screens/Profile/FaqScreen.tsx:67-74` | False confirmation; Play Store requires working in-app account deletion. | **Critical** · Needs API |
| A5 | **Transaction status always says "Completed".** Mapper produces `processing` / `failed`, screen ignores it. Every credit also says **"Payment from PhonePe"**; a missing date falls back to the literal `"23 Jul 2026, 12:04 am"`. | `screens/Wallet/TransactionDetailsScreen.tsx:93-105` | A failed payout displays as completed. | **Critical** · UI only (data exists) |
| A6 | **"Tap and Hold to End Service" ends on a single tap** (`onPress`, not `onLongPress`). | `screens/Bookings/ServiceCheckInScreen.tsx:174-186` | Accidental taps end a live service and trigger billing. | **High** · Behaviour change |
| A7 | **Static promo for a feature that doesn't exist.** "10% Cashback on top-up! … Valid till 31 Jul" + Claim → alert about adding money via UPI. There is no top-up flow. | `screens/Wallet/EarningsDashboardScreen.tsx:53-58, 133-149` | Advertises a non-existent offer with an expired date. | **High** · UI only |
| A8 | **"View All" reviews crashes navigation.** Navigates to `RatingsReviews`, which is declared in `types.ts` but never registered. | `screens/Services/PackageDetailsScreen.tsx:199` | Navigation error on tap. | **Medium** · UI only |
| A9 | **Cosmetic-only controls.** Dark Mode switch flips local state, never touches the theme. Language picker changes a label, no i18n behind it. App Version shows hardcoded `"V.11. 265"`. | `screens/Profile/ProfileScreen.tsx:50, 57-59, 267` | Controls that look functional but do nothing. | **Medium** · Behaviour change |
| A10 | **Hardcoded "⭐ Gold Expert"** on the Dashboard for every partner, while Profile computes the real tier. | `screens/Home/DashboardScreen.tsx:146` | A new partner is labelled Gold Expert. | **Medium** · UI only (data exists) |

### 1b. Top UI findings

1. **No design system in use.** The theme exists, but only **6 of 65 screens** call `useTheme()`. There are **391 hardcoded brand-green literals in 84 files**, and the theme's own primary (`#0A7C4E`) doesn't match Figma (`#114B44`). → §2.1
2. **Emoji used as icons — 284 occurrences in 82 files** (🔔 💵 ⭐ ✅ ⏳ 📈 📅 📞 🧭 🚨 …). Figma uses a consistent line-icon set throughout. Emoji render differently per OEM, can't be tinted, and are the single biggest visual gap. → §2.3
3. **Two competing header implementations, neither matching Figma.** 27 screens use the shared `Header` (bare `‹`, hairline border); 32 hand-roll their own. Figma uses a crimson chevron in a blush circle. → §2.4
4. **Brand identity is wrong on first launch.** Splash uses a ✂️ emoji and **gold** "GetReady"; Figma's wordmark is green "GET" + **crimson** "READY" with "Beauty salon at home". Login copy ("Welcome back… journey of elegance, style and self-care") is from the **customer** app. → §3.1
5. **No bundled fonts.** Figma uses a geometric sans plus a serif display face (package names, "Service Review", empty states). The app uses system fonts, with ad-hoc `Georgia`/`serif`. → §2.2
6. **Missing designed screens/states:** Dashboard **offline state** (closed-sign illustration + swipe-to-go-online), **Expertise / gamification** screen, My Services **Active/Paused** summary, Completed Booking **before/after photos + review**, Notifications **"Quiet for now"** empty state. → §4
7. **Theme typography keys used but undefined:** `h4`, `body1`, `body2`, `captionSmall` resolve to `undefined`, silently dropping styles in shared `Input` and `Badge`. → §2.2

---

## 2. Design-system (global) findings

These affect every screen. Fixing them first makes every per-screen fix in §3 smaller.

### 2.1 Colour tokens

Colours sampled from the Figma PNGs (dominant pixel in region):

| Role | Figma (sampled) | Where sampled | App today |
|---|---|---|---|
| Primary green | **`#114B44`** | Splash bg, login button, onboarding CTA, tab FAB — all agree | Hardcoded `#114B3E` ×391; theme `primary` was `emerald[500] = #0A7C4E` *(corrected — an earlier draft said `#0A3F2F`, which is only `emerald[900]`)* |
| Primary gradient (hero cards) | `#043C36` → `#0A433C` | Home earnings card | Flat `#114B3E` |
| Brand crimson | **`#B02B58`** | "READY" logo tile | `#A61E4D` (login title), `#E11D48` (back chevrons — too bright) |
| Mint tint (active chip, status pill) | **`#E8F4F2`** | Bookings active chip, "Assigned" pill | `#E6F4EA`, `#DCFCE7`, `#F0FDF4` (varies by screen) |
| Back-button circle | `#FAEDF1` | All sub-screen headers | `#F3F4F6` grey or none |
| Page background (top) | `#FEFAFB` (very faint blush) → `#FFFFFF` | My Services, Check-In, Wallet | `#F9FAFB` grey |
| SOS red | **`#BA1A1A`** | SOS button | `#EF4444`-family |
| Gold (tier only) | amber/yellow *approx* | "Gold Expert" pill, milestone banner | Theme `gold #D4AF37` used for splash title |

**Findings**
- The theme's light `primary` was `#0A7C4E` — a noticeably **brighter** green than Figma's `#114B44` — so the shared `Button`/`Input`/`Header`/`Badge` rendered the wrong green. The hardcoded `#114B3E` used by most screens is within a few units of Figma, so screens looked roughly right *despite* the theme, not because of it.
- **Crimson is missing from the theme entirely.** Figma uses it for the wordmark, back chevrons, category tags, "Most Popular" pills, serif section accents. The theme's secondary is gold, which Figma uses only for the tier badge.
- `src/theme/colors.ts` is saved in **Windows-1252, not UTF-8** (the header comment's em-dash is mangled). The Edit tool refuses it; it needs re-encoding before it can be changed safely.

**Recommendation (High · UI only)**
1. Re-encode `colors.ts` to UTF-8.
2. Set `primary = #114B44`, add `primaryGradient`, `crimson = #B02B58`, `crimsonTint = #FAEDF1`, `mintTint = #E8F4F2`, `pageBg = #FEFAFB`, `sos = #BA1A1A`.
3. Migrate screens off literals **file by file**, as each screen is touched in §3. Don't do a 391-site find/replace in one pass — some literals are deliberately different shades and a blind replace will shift them.

### 2.2 Typography

| | Figma | App |
|---|---|---|
| UI sans | Geometric sans, Inter-like *(confirm in Figma Inspect)* | `sans-serif` / `System` |
| Display serif | Used for package/service names ("Bridal Package", "Classic Facial"), "Service Review", "Quiet for now" | `Georgia`/`serif` on Login only; nowhere else |
| Section-title accent | Serif title + 3 px crimson vertical bar ("Service Review") | Not present |

**Undefined keys (bug):** these are referenced but don't exist in `src/theme/typography.ts`, so the style silently resolves to `undefined`:

| Key | Used by |
|---|---|
| `body1` | `components/common/Input.tsx` (**the input text itself**), `ServiceChecklistScreen`, `IncomingJobScreen` |
| `body2` | `DocumentUploadCard`, `EnRouteScreen`, `ServiceChecklistScreen`, `AvailabilityScreen`, `SlotManagerScreen`, `IncomingJobScreen` |
| `h4` | `DocumentUploadCard`, `EnRouteScreen`, `AvailabilityScreen` |
| `captionSmall` | `components/common/Badge.tsx` (**small badges**), `DocumentUploadCard`, `IncomingJobScreen` |

**Recommendation**
- Add the four missing keys as aliases (`body1 → body`, `body2 → bodySmall`, `h4 → title`, `captionSmall → 10px caption`). **Medium · UI only.** Restores styling that was always intended.
- Bundle the two Figma font families (≈4 static `.ttf` files; no JS dependency) and point `fontFamilies` at them. **High · UI only.** Requires a native rebuild (fonts go into `android/app/src/main/assets/fonts`).
- Add a `serifTitle` typography token and a `SectionTitle` component (serif + crimson bar).

### 2.3 Icons

- **284 emoji / unicode glyphs used as icons across 82 files.** Figma uses one consistent outline icon set (≈1.5 px stroke) in tinted rounded squares.
- `components/common/AppIcon.tsx` (1,480 lines) builds ~35 icons out of stacked `View`s and text glyphs. It can't reproduce Figma's icons (calendar, navigation arrow, sort, sparkle, receipt, headset, shield-check, etc.), and some shapes depend on font metrics (`›`, `?`, `⌄`).
- There is **no `react-native-svg`** in the project.

**Recommendation (High · UI only, one native dependency)**
Add `react-native-svg` (single native dependency, standard in RN) and replace `AppIcon`'s internals with SVG paths **exported directly from the Figma file**, keeping the same `<AppIcon name=… />` API so every existing call site keeps working. Avoid a full icon library — export only the ~50 icons the designs use. Then replace emoji call-sites screen by screen.
**Trade-off:** this adds a native module (APK rebuild needed). The alternative — PNG icons — avoids the dependency but can't be tinted and multiplies assets by density.

### 2.4 Header / navigation chrome

| | Figma | Shared `Header` (27 screens) | Hand-rolled headers (32 screens) |
|---|---|---|---|
| Back button | Crimson `‹` in 36 px `#FAEDF1` circle | Bare black `‹` glyph, no circle | Mix: grey circle + rose `#E11D48` chevron (Services), bare green (KYC), black (Bookings) |
| Title | Bold, left-aligned next to back | Left, `h3` | Some centred with spacer, some left |
| Bottom border | None | Hairline | Varies |
| Right action | Pill button ("+ Add services", "Edit", "Remove") or kebab | `rightAction` slot | Ad hoc |

**Recommendation (High · UI only):** update the shared `Header` to the Figma spec (blush circle, crimson chevron icon, no border, transparent bg so the page blush shows through), then migrate the 32 hand-rolled headers to it. Navigation callbacks stay exactly as they are — only the wrapper changes.

### 2.5 Other shared elements

| Element | Figma | App | Rec. | Priority |
|---|---|---|---|---|
| Bottom tab bar | Home · Bookings · (+) · Wallet · Profile; active icon filled green | Matches structurally; icons from `TabIcon` (View-drawn) | Swap to SVG icons (§2.3) | Low |
| `CalendarTab` | Not in designs | Declared in `MainTabParamList`, not registered | Remove from type or register | Low |
| Primary button | `#114B44`, radius ≈10, height ≈48, no visible shadow | Same colour family, **coloured drop shadow** on most | Drop the shadow; use shared `Button` | Medium |
| Outline button | 1.5 px green border, white fill | Close | — | — |
| Filter chips | Pill, `#E8F4F2` fill + green text active; white + grey border inactive | Close, tints vary per screen | Shared `FilterChips` | Medium |
| Status pills | Assigned/Completed `#E8F4F2` + green; Cancelled pink + red; Pending pink; Approved green | Implemented per screen | Shared `StatusPill` | Medium |
| Cards | White, radius ≈14–16, 1 px `#EEF0F0` border, very light shadow | Mostly matches; shadows vary | Shared `Card` (exists, little used) | Low |
| Page background | Faint blush top fade | Flat `#F9FAFB` | Token `pageBg` | Low |
| Fallback images | Real photos / initials | **Remote Unsplash URL** in `BookingCard.tsx:33`; stock `IMAGES.CLIENT_AVATAR` for every client in `JobDetailScreen.tsx:115`; `IMAGES.SERVICE_HERO_BRIDAL` for every booked item in `ServiceCheckInScreen.tsx:108` | Initials avatar / neutral local placeholder | **Medium** (perf + truthfulness) |

### 2.6 Reusable components to create or consolidate

| Component | Replaces | Used on |
|---|---|---|
| `AppIcon` (SVG-backed, same API) | 284 emoji + View-drawn icons | Everywhere |
| `Header` (Figma spec) | 32 hand-rolled headers | All sub-screens |
| `SectionTitle` (serif + crimson bar, optional "View all") | Ad-hoc section headings | Package/Service details, Dashboard, Wallet |
| `FilterChips` | 5 separate implementations | Bookings, Earnings History, My Services, My Leaves |
| `StatusPill` | Per-screen pill styles | Bookings, Leaves, Verification, Services |
| `ServiceRowCard` (thumb · title · tag · duration · price · strike · trailing slot) | ≥5 copies | My Services, Add Extra Service, Check-In, Items Details, Awaiting Approval |
| `OtpInput` (N boxes, error state) + `NumericKeypad` | 3 OTP implementations | OTP, Start OTP, End OTP |
| `EmptyState` (illustration, serif title, subtitle, CTA) | Text-only empties | Notifications, Bookings, Services, Wallet |
| `ConfirmDialog` (icon, title, body, two buttons) | `LogoutModal`, `EmergencySosModal`, `ServiceUnderReviewModal` | 3 modals |
| `Avatar` (image → initials fallback) | Stock-photo fallbacks | Bookings, Job Detail, Dashboard |
| `AccordionSection` (status icon, Edit/Pending, "+ Add Details") | KYC Review rows | KYC Review, FAQ, Privacy Policy |
| `StepProgressHeader` | Already exists as `OnboardingHeader` ✓ | KYC steps 1–7 |

---

## 3. Screen-by-screen comparison

Format per screen: **Figma refs → App file**, then Current / Expected / Differences / Recommendation / Priority / Impact.

### 3.1 Auth

#### Splash
**Figma:** `Splash Screen.png`, `Splash Screen-1.png` → **App:** `screens/Auth/SplashScreen.tsx`
- **Current:** Full-screen emerald, ✂️ emoji in translucent circle, gold "GetReady", "PARTNER & BEAUTICIAN APP", spinner.
- **Expected:** Two-stage. (1) Top half `#114B44` with a chevron/peaked lower edge and a white rounded-square outline icon (beautician glyph); bottom half white with the wordmark. (2) White screen, wordmark only. Wordmark: **GET** green, **READY** crimson `#B02B58`, tagline "Beauty salon at home".
- **Differences:** Wrong logo, wrong brand colours (gold vs crimson), wrong tagline, emoji icon, no shaped divider.
- **Recommendation:** Rebuild visuals using a logo asset exported from Figma (SVG or PNG @3x). Keep the existing `useEffect` routing and 600 ms timer untouched.
- **Priority:** **Critical** (brand identity) · **Impact:** UI only.

#### Onboarding
**Figma:** `Onboarding screen 1/2/3.png` → **App:** `screens/Auth/OnboardingScreen.tsx`
- **Current:** Matches layout (hero photo, white fade, title, body, bar dots, Next, Skip pill).
- **Differences:**
  - **Slide order swapped.** Figma: 2 = "Bookings at Your Fingertips", 3 = "Earn More, Track Better". App (`:30-52`) has them reversed.
  - Title weight: Figma looks medium (~500); app `700`. *approx*
  - Last-slide CTA: app says "Get Started", Figma says "Next" on all three. App's choice is better UX — keep.
  - (Figma error: the active dot doesn't advance on slides 2/3 — the app's animated dots are correct.)
- **Recommendation:** Swap slides 2 and 3 (check the images still pair with their titles). Lighten title weight.
- **Priority:** Medium · **Impact:** UI only.

#### Login
**Figma:** `login mobile.png` → **App:** `screens/Auth/LoginScreen.tsx`
- **Current:** Background image (`IMAGES.LOGIN_ONE`) with baked-in photo, peak, logo and doodles; form overlaid at 38 % height.
- **Differences:**
  - **Copy is from the customer app.** App: "Welcome back" / "continue your journey of elegance, style and self-care." Figma: **"Welcome, Beautician."** / "Enter your registered mobile number to continue to your dashboard."
  - Title: app burgundy serif `#A61E4D`; Figma green bold sans.
  - "Beauty Salon at Home" corner ribbon (top-left) — verify it's in the baked image.
  - **Responsiveness risk:** baked image with `cover` + fixed `38 %` spacer means the logo inside the image and the form can drift apart on tall/short screens.
- **Recommendation:** Fix copy and title style. Split the hero (photo + peak + logo) from the doodle footer so they lay out independently.
- **Priority:** **High** (copy) · **Impact:** UI only.

#### OTP
**Figma:** `login mobile-1/-2/-3.png` (default / error / resend timer) → **App:** `screens/Auth/OTPScreen.tsx`
- **Differences:**
  - **Figma shows 4 boxes; app has 6.** App is correct — `OTP_LENGTH = 6` matches the backend (`:28`). **Do not change.** Ask the designer to update the frame.
  - Error state: Figma has a red ⓘ icon + "Invalid OTP", left-aligned, boxes red. App: plain red text, centred.
  - Timer state: Figma replaces the line with "Code Resend in **30 second**"; app keeps "Code not Received Yet?" + "Resend in 30s".
  - Button: both say "Get OTP" (Figma's copy) — "Verify" would be clearer; your call.
- **Priority:** Low · **Impact:** UI only.

### 3.2 KYC onboarding (Steps 1–7)

Shared header `components/onboarding/OnboardingHeader.tsx` matches Figma's "ONBOARDING · Step N of 7" + progress bar. ✓ Good reuse. Only global header styling (§2.4) differs: back chevron is bare green, Figma uses the crimson-in-blush-circle.

| Step | Figma | App file | Findings | Priority |
|---|---|---|---|---|
| 1 Personal Details | `Profile.png`, `Profile-3.png`, `Profile-18.png` (OTP verify), `Profile-21.png` (gender dropdown + date picker) | `Kyc/PersonalInfoScreen.tsx` | Structure matches. Verify the **inline "Enter OTP · Save" row** for mobile change (`Profile-18`). Avatar placeholder: Figma uses a camera icon in a grey circle with green "+" badge. Language chips ✓. | Medium |
| 2 Primary Address | `Profile-19.png`, `Profile-20.png` | `Kyc/PrimaryAddressScreen.tsx` | Map + radius slider + **"0 km / 8 km" green pill tooltip** on the map + Preferred Hours card. Check the pill tooltip exists. | Low |
| 3 Identify Documents | `Profile-1.png` (verified/rejected), `Profile-2.png` (pending upload) | `Kyc/IdUploadScreen.tsx`, `components/onboarding/IdentityDocumentCard.tsx` | States: VERIFY (green), REJECT (red, "Image is blurry", red-outline "Re-upload Document"), PENDING (amber, dashed pink upload zone). Uses ✔/emoji badges. | Medium |
| 4 Skills & Experience | `Profile-4.png`, `Profile-15.png` (empty), `Profile-16.png` (multi-select open) | `Kyc/ExperienceScreen.tsx`, `MultiSelectSkillsDropdown.tsx` | Work-history card: **green left border** + trash icon. Certification card: thumbnail + trash. Skill chips with ×. | Low |
| — Add Work Experience | `Profile-17.png` | `Kyc/AddWorkExperienceScreen.tsx` | Start→End date in a grey grouped container with arrow. | Low |
| — Add Certificate | `Profile-13.png`, `Profile-14.png` | `Kyc/AddCertificateScreen.tsx` | Dashed pink "Upload File" button beside a pink-bordered date field. **Figma labels both fields "Full Name"** — designer error; use "Certificate Title" / "Issuing Organization". | Low |
| 5 Payout Details | `Profile-5.png` | `Kyc/BankDetailsScreen.tsx` | "Bank name will be fetched automatically" info row; dashed upload passbook; OPTIONAL divider; UPI field with QR icon. | Low |
| 6 Selfie | `Profile-6.png` | `Kyc/SelfieScreen.tsx` | Dashed oval face guide on photo; "Look straight, ensure good lighting" overlay; tips card with ⓘ. | Medium |
| 7 Review & Submit | `Profile-7/-8/-9.png`, `Step 1_ Personal Details.png` (component spec) | `Kyc/KycReviewScreen.tsx` | Accordion rows: green ✓ "Completed All Details" + **Edit**, or red ↻ "Remaining Details" + red **Pending**; expanded shows key/value list or "+ Add Details". Consent checkbox; footnote "Verification typically takes 24-48 business hours". → build `AccordionSection`. | Medium |

### 3.3 Verification Center
**Figma:** `Profile-10.png` (under review), `Profile-11.png` (verified), `Profile-12.png` (rejected) → **App:** `screens/Profile/VerificationCenterScreen.tsx`
- **Current:** All three states implemented with matching copy ("Hang tight…", "You're Verified", "Verification Failed", "Fix & Resubmit", "Contact Support").
- **Differences:** **Extra demo "Preview View:" switcher bar** that isn't in any design and changes real KYC state — see **A2**.
- **Recommendation:** Remove the switcher; derive the state only from `partner.kycStatus`; "Go To Dashboard" should `reloadPartner()` and navigate only if the server says approved.
- **Priority:** **Critical** · **Impact:** Behaviour change (removes a bypass; real flows unchanged).

### 3.4 Home / Dashboard
**Figma:** `wallet-1.png` (online), `wallet.png` (**offline**), `SOS.png` (with SOS button), `Confirm sos.png`, `wallet-2.png` (incoming request) → **App:** `screens/Home/DashboardScreen.tsx`

**Online state** — structure matches closely (greeting, tier + online dot, duty switch, bell, earnings hero card, upcoming bookings carousel, "Add More Services", Overview 2×2, My Services grid).

| Element | Figma | App | Priority |
|---|---|---|---|
| Tier label | Real tier | Hardcoded "⭐ Gold Expert" (`:146`) — **A10** | Medium |
| Duty toggle | Small iOS-style switch, light grey when off | `BigDutySwitch` with ON/OFF text, slate `#374151` when off | Medium |
| Bell | Outline bell icon, red dot | 🔔 emoji | Medium |
| Earnings card | Gradient `#043C36→#0A433C`, rating chip "★ 4.8" | Flat green | Low |
| Milestone banner | Gold/amber: "You're **3 bookings away** from Gold Expert" | Generic duty text with 🛡️ (`:220-225`) | Medium — can compute from `completed` + the tier thresholds already in `ProfileScreen` (UI only, data exists) |
| Upcoming card | Avatar, name, ⭐ "Glow Club Member", **navigate-arrow icon button**, date · time, service with icon | Same layout; emoji ➤ 💆 | Medium |
| Overview tiles | Icon in tinted square, label, value | Emoji 💵 ⭐ ✅ ⏳ | Medium |
| My Services tiles | Photo, **crimson category tag**, ★ rating, **serif title**, description, price + strike | Sans title, neutral tag | Medium |
| SOS button | Red rounded **square** with siren icon + "SOS", bottom-right | `FloatingSosButton` — verify shape (Figma asset `Button.png`) | Low |

**Offline state — MISSING.** Figma `wallet.png`: "Sorry, we're CLOSED" hanging-sign illustration, "No bookings yet today", "New requests will appear here. Make sure you're Online to receive bookings.", a **swipe-to-go-online slider** ("Swap to login" — Figma typo, should read "Swipe to go Online"), and a "● Currently Offline" chip. The app shows the same dashboard whether online or offline.
- **Recommendation:** When `!isOnline`, render the offline view instead of the dashboard body; the slider calls the existing `toggleDuty`. **Priority: High · Impact: UI only.**

#### Incoming booking modal
**Figma:** `wallet-2.png` → **App:** `components/booking/IncomingBookingModal.tsx`
- Matches (NEW REQUEST, Incoming Booking, ring countdown, PAY / SERVICE / DATE & TIME / ADDRESS tiles, distance pill, Accept / Reject).
- Diffs: emoji icons (💵 ✒ 📅 📍); Figma countdown ring is pink-filled with grey track.
- **Priority:** Medium · **Impact:** UI only.

#### Emergency SOS dialog
**Figma:** `Confirm sos.png` → **App:** `components/common/EmergencySosModal.tsx`
- Visual: red ⚠ in circle, "Are you in Emergency?", Cancel (outline red) + SOS (filled `#BA1A1A`). Close.
- Body copy in Figma is copied from Logout ("You will stop receiving real-time booking notifications…") — designer error; write SOS-specific copy.
- **Functional: A1.**

#### Notifications
**Figma:** `notifications.png`, `-1`, `-2` (menu open), `clear list.png` (empty) → **App:** `screens/Home/NotificationsScreen.tsx`
- List, Today/Earlier grouping, blue unread dot, kebab menu with "Mark as all read" / red "Clear List" — all present. ✓
- **Empty state differs:** Figma "Quiet for now" (serif), large circular bell illustration with pink/green confetti dots, subtitle, **"Go To Dashboard"** button. App: 🔔 emoji + "No Notifications".
- Icon tile: Figma uses a ★ in a light grey square for every type; app uses emoji per type. Per-type icons are more useful — keep, but as SVG.
- Kebab: Figma crimson `⋮` icon; app text glyph.
- **Priority:** Medium · **Impact:** UI only.

### 3.5 Bookings

#### Bookings list
**Figma:** `bookings.png`, `bookings-1/-2/-3.png` → **App:** `screens/Bookings/BookingsListScreen.tsx` + `components/common/BookingCard.tsx`
- **Matches well:** header, All/Upcoming/Completed/Cancelled chips, "Sort by" pill, card with date + status pill, thumb, name, booking ID, price, two-button row varying by status.
- **Differences:** 📅 emoji calendar, ⚑ sort glyph (Figma: sort-lines icon), remote Unsplash fallback thumbnail (`BookingCard.tsx:33`).
- (Figma error: `bookings.png` / `-1.png` show two stacked tab bars; tab label "Appointments" vs "Bookings" varies across frames — keep "Bookings".)
- **Priority:** Medium · **Impact:** UI only.

#### Booking details (upcoming)
**Figma:** `bookings-10.png`, `bookings-11.png` → **App:** `screens/Bookings/JobDetailScreen.tsx`
- **Matches:** client card + call button, green "Today 02:00 PM" tile + dark "URGENT Start in 2 Hours" tile, map + ADDRESS + "Open in Google Maps", Services Requested, Client Notes callout, subtotal/taxes/total, PREPAID pill, sticky "Start Journey" CTA.
- **Differences:** every client shows the same stock photo (`:115`); "Glow Club Member" line absent (membership not in payload); emoji 📞 📅 📍 🧭 📝 ✦; app adds a "Cancel" text link in the header (not in Figma — keep, it's functional).
- **Priority:** Medium · **Impact:** UI only (membership: Needs API).

#### Completed booking details
**Figma:** `bookings-4.png` → **App:** `screens/Bookings/CompletedBookingDetailScreen.tsx`
- **Matches:** header card, mobile/address rows, Services Rendered, Service Details, Your Earnings, Special Instructions, Previous Bookings link, View Receipt / Need Help.
- **Missing:**
  1. **"Before and after photo"** pair — `WorkPortfolioComparison` component exists in `components/common` but isn't used here.
  2. **Customer review** (★★★★★ 5.0, quote, reviewer). Styles `reviewCard` etc. are defined at `:517-560` but **never rendered**.
  3. Added-during-service package line ("Mini Glow Cleanup Package — Requested by client during session").
- **Priority:** High · **Impact:** Needs API if photos/review aren't in the booking payload — verify first.

#### Previous bookings
**Figma:** `bookings-5.png` → `screens/Bookings/PreviousBookingsScreen.tsx` — same card as list. Low.

#### Cancel booking
**Figma:** `bookings-9.png`, `bookings (2).png` → `screens/Bookings/CancelBookingScreen.tsx`
- "Appointment Cancel" red card, Booking Services card with **red left border**, radio list, "Write Statement" grey textarea, CTA. Check radio style (Figma: green filled dot) and the red accent bar. Medium.

#### Cancellation details
**Figma:** `bookings-6.png`, `-7.png` (by customer, with System Rule Check), `-8.png` (by beautician) → `screens/Bookings/CancellationDetailsScreen.tsx` + `SystemRuleCheckCard`
- Structure present. Figma: "Cancel by: Customer" filter pill at top, red title "Appointment Cancelled", quote card on grey, "Late (< 3 hours)" in red, compensation + "Payout Credited to Wallet #4412". Medium.

### 3.6 In-service flow

| Screen | Figma | App file | Findings | Priority |
|---|---|---|---|---|
| Start OTP | `Home-16.png` | `Bookings/StartOtpScreen.tsx` | Shield icon in mint circle, 4 boxes (**keep backend length**), lock pill "Service cannot start until verified", custom keypad (Clear / ⌫), disabled grey-green "Verify & Start Service". Matches structurally; emoji icons. | Medium |
| Service Check-In | `Home-7.png`, `Resume.png` | `Bookings/ServiceCheckInScreen.tsx` | Timer card ✓. **A3** (fake requested-item data), **A6** (tap vs hold), **A1** (SOS no-op). Static thumbnail for every booked item (`:108`). (The "⊕ + Add Service / Package" button shows two plus signs, but Figma draws it the same way, so it is not a defect.) SOS button: Figma solid red `#BA1A1A` with siren icon. | **Critical** |
| Add Extra Service | `Home-11.png`, `Home-12.png` | `Bookings/AddExtraServiceScreen.tsx` | Same `ServiceRowCard` with "+ Add" / "Added" pill; sticky "2 Item Selected · +₹799" bar + "Send Addition Request to Customer ➤". | Medium |
| Awaiting Approval | `Home-8.png` | `Bookings/AwaitingApprovalScreen.tsx` | Grey card with spinner-in-green-circle "Awaiting Approval…", requested items, customer "Request sent 2 mins ago · SENT", lock pill, Resend / Cancel Request. | Medium |
| Service Added | `Booking Summary & Earnings.png` | `Bookings/ServiceAddedSuccessScreen.tsx` | Big green check circle with soft glow, "Item addeD" (Figma typo), "Resume service →". | Low |
| Check-Out photos | `Home-9.png` (before only), `Home-10.png` (both) | `Bookings/ServiceCheckOutScreen.tsx` | BEFORE / AFTER SERVICE pills, edit pencil FAB, dashed pink corner-bracket camera zone, Quality Assurance info card. | Medium |
| Completion OTP | `Home-13.png` (disabled), `Home-14.png` | `Bookings/EndOtpScreen.tsx` | "SERVICE SESSION ENDED" summary card, shield, 4 boxes, "Finalize Service ➤", "Resend OTP to Customer". **Figma shows `$85.00`** — designer error, app uses ₹ correctly. | Medium |
| Items Details | `Home-15.png` | `Bookings/ItemsDetailsScreen.tsx` | Booked items with **green left border**, requested items with "Added", duration + Total Charge, "Enter OTP" outline button. | Low |
| Service Completed | `Booking Summary & Earnings-1.png` | `Bookings/JobCompletedScreen.tsx` | Green check, "Earnings Credited +₹1,900" bar, itemised breakdown, Grand Total, Payment Status "Collect Balance", advance note, Work Portfolio before/after, "Complete & Return to Dashboard". | Medium |
| Invoice | `INVOICE.png` | `Bookings/BookingReceiptScreen.tsx` | EARNINGS +₹4,125 header strip, client block with Gold Member, Service/Address/Payment rows, grey breakdown card (Provider Earnings green, Taxes red), Total Payout, "BACK TO HOME →" pill button. | Medium |

### 3.7 Services & Packages

#### My Services
**Figma:** `Home-3.png`, `Home-6.png` (grouped), `Home-5 (2).png`, `Home-6 (2).png` (with **Active/Paused** cards), `Home.png` (packages, large cards), `Home-10 (2).png` (packages, **compact list**) → **App:** `screens/Services/MyServicesScreen.tsx`
- **Matches:** segmented Individual / Package control, search, category chips, grouped sections with "View all", row cards with tag · duration · price · strike · switch · chevron, "+ Add services" pill.
- **Missing:** **Active / Paused summary cards** (two cards, coloured left border, big numbers) above search. Counts derivable from loaded data (`status === "approved"` & `isEnabled`). **High · UI only (data exists).**
- **Conflicting designs for the Package tab:** `Home.png` shows large banner cards (what the app has); the newer `Home-10 (2).png` shows compact rows with a toggle and "+ Add Packages". **Needs designer confirmation** before changing.
- Back chevron `#E11D48` should be crimson `#B02B58`.

#### Package details
**Figma:** `Home-1.png` → `screens/Services/PackageDetailsScreen.tsx`
- Hero with "Most Popular" pill, **serif title**, Discounted Price green pill vs Fixed price strike, numbered "What's Included" list (green circles), **"Service Review" serif heading with crimson bar**, horizontal review cards, Edit Details / Add Service.
- **A8**: "View All" → unregistered route.
- Priority: Medium.

#### Manage Service (view)
**Figma:** `Home-5.png` → `screens/Services/ManageServiceScreen.tsx` — hero, "Edit" pill top-right, serif title, check-circle list, Service Review section. Medium.

#### Add / Edit Service & Package forms
**Figma:** `Add service.png`, `Select categories.png` (dropdown open), `Home-7 (2).png` (empty), `Home-8 (2).png` (edit service), `Add Details.png`, `Home-9 (2).png`, `Edit service.png` (edit package) → `Services/AddServiceScreen.tsx`, `Services/EditPackageScreen.tsx`
- All Figma sections exist in `AddServiceScreen` (Cover Image, Select Categories, Service Details, Duration, Gallery, Service Price, Additional Information, What's Included). ✓
- Figma details to verify: each section is a white card with a **green pencil** edit icon; "Fixed" grey pill on Duration/Price; Duration shows clock icon + "Hour / Minut" inputs; price-range hint card ("Admin allows ±10% adjustment…"); "Remove" pill top-right on edit; bottom Cancel / Add|Update|Verify|Send Request.
- Priority: Medium.

#### Service Under Review modal
**Figma:** `Home-2.png`, `Home-4.png` → `components/common/ServiceUnderReviewModal.tsx` — centred card, title, body, "Back to Home". Low.

### 3.8 Wallet

| Screen | Figma | App file | Findings | Priority |
|---|---|---|---|---|
| Wallet | `wallet (2).png` | `Wallet/EarningsDashboardScreen.tsx` | Total Balance card, Monthly / Total Withdrawal sub-stats, Withdrawal Fund / History buttons, **cashback promo (A7)**, "Transactions History" with green bar accent, security footnote. Figma balance card has faint pink corner tint. | **High** (A7) |
| Earnings History | `Home (2).png`, `Home-1 (2).png`, `Home-2 (2).png`, `Home-4 (2).png` | `Wallet/EarningsHistoryScreen.tsx` | Chips + green summary card + list — matches. **Figma titles this "My Services"** — designer error; app's "Earnings History" is right. Figma shows "+12% vs last month" — needs previous-month data (**Needs API**); app's current fallback text is honest. | Low |
| Transaction Details | `Home-3 (2).png` | `Wallet/TransactionDetailsScreen.tsx` | Initial avatar, big amount, green "● Completed", bank card, UPI fields, Having issues? / Share. **A5.** | **Critical** (A5) |
| Withdraw | `widthdrw.png`, `widthdrw-1.png` | `Wallet/PayoutRequestScreen.tsx` | Matches (Secure Balance pill, amount box, "Withdraw All", bank row + Change, Bank-Level Security card, disabled "Withdraw ₹0" → enabled "Withdraw ₹567"). Figma "Min: $10.00" — designer error; app uses ₹. Figma "Transfer Trems" typo. | Low |
| Withdrawal requested | `widthdrw-2.png` | `Wallet/WithdrawalSuccessScreen.tsx` | Matches. Figma `$450.00` — designer error. Alternate design `Add money.png` ("Money Windthrow!" — typo) is a different layout; pick one with the designer. | Low |

### 3.9 Profile

#### Profile tab
**Figma:** `Profile-24.png` … `Profile-29.png` (pressed-row variants) → `screens/Profile/ProfileScreen.tsx`
- **Matches:** avatar + edit badge, name, phone, badges, 3-stat row, menu list, Language / Dark Mode / App Version / Logout.
- **Differences:**
  - Expert badge: Figma **gold/amber** pill; app green `#DCFCE7`.
  - Stats: Figma has no card container — plain row with dividers; app wraps in a bordered card.
  - Menu icons: Figma outline icons; app View-drawn `AppIcon`.
  - Pressed row: Figma shows blush `#FAEDF1` highlight on press.
  - Avatar fallback 👩‍🦰 emoji (`:109`).
  - **A9** (Dark Mode / Language / App Version).
  - `DeleteAccountModal` is mounted but unreachable here (no `setShowDeleteModal(true)`); Figma puts Delete Account in FAQ, which the app also does. Dead code.
- **Priority:** Medium.

#### HRM

| Screen | Figma | App file | Findings | Priority |
|---|---|---|---|---|
| Attendance | `Profile (2).png` | `Profile/AttendanceScreen.tsx` | Calendar with coloured day tiles (green present, blue leave, red absent, grey future), legend, Leave Management list with status pills, "+ Apply Leave" pill. Matches. | Low |
| My Leaves | `Profile-1/-2/-3 (2).png` | `Profile/MyLeavesScreen.tsx` | Three quota cards with **coloured left borders** (green / crimson / green) + icons, tabs, request rows with pink border. Matches. | Low |
| Submit Leave | `Profile-4 (2).png` | `Profile/SubmitLeaveScreen.tsx` | Matches (type dropdown, Full/Half segmented, dates, Calculated Duration mint bar, reason, dashed upload, peak-weekend warning, CTA). | Low |
| Salary Breakdown | `Profile-5 (2).png` | `Profile/SalaryBreakdownScreen.tsx` | Layout matches. **Line items differ:** Figma (Basic, HRA, Conveyance, Commission, Bonus / Professional Tax, PF) vs app (payslip-driven: Service Earnings, Bonuses / Platform Commission, TDS, Other). App reflects the real data model — **keep**. Figma adds amount-in-words and "DOWNLOAD PAYSLIP"; app has "SHARE PAYSLIP". | Low |
| My Performance | `Profile-6/-7/-8 (2).png` | `Profile/MyPerformanceScreen.tsx` | Today / This Week / This Month tabs, earned hero card, 2×2 stat tiles with icons, revenue bar chart with "Peak" label, recent bookings, quick links. Matches structurally. (Figma frame `-7` labels two tabs "This Month" — designer error.) | Low |
| **Expertise / gamification** | `Attendance & Gamification Flow.png` | **MISSING** | "Earnings Boost" progress card, **Career Journey** level ladder (Beginner → Senior Pro → Gold Expert → Specialist → Elite Beautician), **Top Performers** podium + "You #14" row. | **High** · **Needs API** (levels, leaderboard) |

#### Edit profile & sub-screens

| Screen | Figma | App file | Findings | Priority |
|---|---|---|---|---|
| Edit Profile | `Profile-10 (2).png`, `-12 (2).png` (OTP), `-15 (2).png` (pickers) | `Profile/EditProfileScreen.tsx` | Figma combines personal info + current address card + working-radius slider + hours in one scroll. Confirm the address/radius/hours block is present. | Medium |
| Primary Address | `Profile-13 (2).png`, `-14 (2).png` | `Profile/PrimaryAddressScreen.tsx` | Map with km tooltip pill. | Low |
| Bank Details | `Profile-11 (2).png` | `Profile/BankDetailsScreen.tsx` | Info banner, bank card with VERIFIED pill, masked number, IFSC, passbook image, UPI row with Edit, PCI-DSS footnote, "Request Account Change". | Low |
| Edit Bank | `Profile-21 (2).png` | `Profile/EditBankDetailsScreen.tsx` | Same as KYC step 5. | Low |
| Documents & Certificates | `Profile-17 (2).png`, `-18 (2).png`, `-16 (2).png` | `Profile/DocumentsCertificatesScreen.tsx` | Sections Documents / Work History / Certifications with "+ Add"; cards with **coloured left border** (green, or **crimson** for Aadhaar with ✓ Verified). | Medium |
| Add Certificate | `Profile-19 (2).png` | `Profile/AddCertificateScreen.tsx` | Same as KYC version (and same "Full Name" ×2 Figma label error). | Low |
| Add Work Experience | `Profile-20 (2).png` | `Profile/AddWorkExperienceScreen.tsx` | Same as KYC version. | Low |
| Emergency Contacts | `Profile-22.png` | `Profile/EmergencyContactsScreen.tsx` | Photo, name, phone, relation, pencil; info card "Data is encrypted…". "+ Add" pill top-right. | Low |
| Add Emergency Contact | `Profile-23.png` | `Profile/AddEmergencyContactScreen.tsx` | Green "Your Safety Matters" banner with icon tile; photo upload; relationship dropdown; **Auto-Share Location** toggle card. | Medium |
| Logout dialog | `Profile-9 (2).png` | `components/common/LogoutModal.tsx` | Yellow ⚠ circle, title, body, Cancel outline / "Yes, Log Out" filled. Matches. | Low |
| FAQ | `FAQ.png` | `Profile/FaqScreen.tsx` | Search, accordion, "Still have questions?" card with Call / WhatsApp, Delete Account row. Matches. (Figma FAQ text is customer-app placeholder about "membership" — the app loads real FAQs from API; keep.) | Low |
| Delete Account sheet | `FAQ-1.png` | `components/common/DeleteAccountModal.tsx` | Bottom sheet, illustration, "Are you sure…" card, loss list, No / Yes buttons. **Loss list is customer-app copy** (Saved Stylists, Loyalty Points, Saved Addresses) in both Figma and app — rewrite for partners (pending payouts, work history, ratings, documents). App uses 👩‍🦰 emoji instead of the illustration. **A4.** | **Critical** (A4) / Medium (copy) |
| Help & Support | `Help n support.png` | `Profile/HelpSupportScreen.tsx` | Call / Email tiles, Quick Answers, Common Issues rows with icons, privacy-team contact, For More Query. Matches. | Low |
| Privacy Policy | `privacy policy.png` | `Profile/PrivacyPolicyScreen.tsx` | "Your privacy matters" card + accordion + contact card. App renders API content. Matches. | Low |

---

## 4. Coverage

### 4.1 Designed screens/states missing from the app

| Design | What's missing | Priority | Impact |
|---|---|---|---|
| `wallet.png` | Dashboard **offline state** + swipe-to-go-online | High | UI only |
| `Attendance & Gamification Flow.png` | **Expertise** screen (levels, leaderboard) | High | Needs API |
| `Home-5 (2).png`, `Home-6 (2).png`, `Home-10 (2).png` | My Services **Active / Paused** cards | High | UI only (data exists) |
| `bookings-4.png` | Completed booking **before/after photos** + **customer review** | High | Verify payload; may need API |
| `clear list.png` | Notifications **"Quiet for now"** empty state | Medium | UI only |
| `login mobile-2.png` | OTP error state with ⓘ icon | Low | UI only |

### 4.2 App screens with no Figma reference (need design)

| App screen | Notes |
|---|---|
| `Bookings/EnRouteScreen.tsx` | Reached from "Start journey". Uses shared theme — visually inconsistent with the rest. |
| `Bookings/ServiceChecklistScreen.tsx` | Uses undefined typography keys (§2.2). |
| `Calendar/AvailabilityScreen.tsx`, `Calendar/SlotManagerScreen.tsx` | No tab entry; reachable via `SlotManager` route. |
| `Kyc/KycPendingScreen.tsx` | 8-line stub. |
| `Bookings/IncomingJobScreen.tsx` | **Unreachable** — nothing navigates to `IncomingJob`; Dashboard uses `IncomingBookingModal`. Shows a literal `₹ 2,499`. Candidate for removal (not removed — your call). |

### 4.3 Declared but unregistered routes

`LeaveRequest`, `TransactionsHistory`, `RatingsReviews` (in `RootStackParamList`), `CalendarTab` (in `MainTabParamList`). Only `RatingsReviews` is navigated to (A8).

### 4.4 Figma errors — don't copy these

| Figma | Problem | Do instead |
|---|---|---|
| `login mobile-1/-2/-3` | 4 OTP boxes | Keep 6 (backend `OTP_LENGTH`) |
| `Home-13/-14`, `widthdrw*`, `Add money` | `$` currency | ₹ |
| `Add money.png` | "Money Windthrow!" | "Money Withdrawn" |
| `widthdrw*` | "Transfer Trems" | "Transfer Terms" |
| `wallet.png` | "Swap to login" | "Swipe to go Online" |
| `Profile-4.png` | "Step 4 of 4" | "Step 4 of 7" |
| `Profile-13/-14`, `Profile-19 (2)` | Both fields labelled "Full Name" | "Certificate Title" / "Issuing Organization" |
| `Home (2)` series | Transactions screen titled "My Services" | "Earnings History" |
| `Profile-7 (2)` | Two tabs both "This Month" | Today / This Week / This Month |
| `Booking Summary & Earnings` | "Item addeD" | "Items Added" |
| `Confirm sos.png` | SOS body copied from Logout | SOS-specific copy |
| `FAQ.png`, `FAQ-1.png`, `clear list.png` | Customer-app copy (membership, saved stylists, "pampering session") | Partner copy |
| `bookings.png`, `bookings-1.png` | Two tab bars stacked | One |
| Various | Tab label "Appointments" vs "Bookings" | "Bookings" |
| `Onboarding screen 2/3` | Active dot doesn't advance | App's animated dots |

---

## 5. Performance & functionality impact of the UI plan

| Change | Perf effect | Functionality risk |
|---|---|---|
| Colour/typography tokens | None (static objects) | None — style only. Migrate per screen, not by global replace. |
| `react-native-svg` icons | Small native module. SVG icons are lighter than the current multi-`View` icons (one native view vs 5–10). | None if `AppIcon` keeps its API. Needs APK rebuild. |
| Bundled fonts | +≈200–400 KB APK | None. Needs APK rebuild. |
| Shared `Header` migration | None | Low — keep each screen's existing `onBackPress`. |
| Local image fallbacks (replace Unsplash) | **Positive** — removes a network fetch per booking card | None |
| Offline dashboard view | Positive — renders less when offline | Must keep `IncomingBookingModal` and duty toggle wiring identical |
| Active/Paused cards | `useMemo` over already-loaded list | None |
| Removing the Verification demo switcher | None | Removes a bypass; real KYC flow unchanged |

**Constraint for every change:** no API payloads, query keys, navigation params, validations or context state change unless the row says *Behaviour change* or *Needs API*.

---

## 6. Suggested implementation order

1. **Phase 0 — truth & safety (non-UI, your decision):** A1–A6. A3 and A5 are UI-only and quick. A1 and A4 need backend endpoints. A2 and A6 change behaviour.
2. **Phase 1 — foundations:** re-encode `colors.ts`; add Figma tokens; define the 4 missing typography keys; bundle fonts; SVG-backed `AppIcon` with same API. *(One APK rebuild.)*
3. **Phase 2 — shared components:** `Header`, `SectionTitle`, `FilterChips`, `StatusPill`, `ServiceRowCard`, `OtpInput` + `NumericKeypad`, `EmptyState`, `ConfirmDialog`, `Avatar`, `AccordionSection`.
4. **Phase 3 — brand surfaces:** Splash, Login copy, Onboarding order, Dashboard (incl. offline state).
5. **Phase 4 — per-flow migration:** Bookings → in-service flow → Services → Wallet → Profile/HRM → KYC. Each flow: replace emoji, adopt shared components, move literals to tokens.
6. **Phase 5 — missing designs:** Active/Paused, completed-booking photos/review, Notifications empty state, Expertise screen (after API).

**Needs from you / design before starting:**
- Figma Dev Mode access or @2x/@3x exports (exact spacing and font names).
- Logo + illustration assets (wordmark, splash icon, "CLOSED" sign, notification bell, delete-account illustration) as SVG/PNG.
- Decision on Package-tab layout (large cards vs compact list).
- Decisions on A2, A6, A9.

---

## Appendix — Figma file → app screen map (all 131 designs)

| Figma file(s) | App screen / component |
|---|---|
| Splash Screen, Splash Screen-1 | `Auth/SplashScreen` |
| Onboarding screen 1, 2, 3 | `Auth/OnboardingScreen` |
| login mobile | `Auth/LoginScreen` |
| login mobile-1, -2, -3 | `Auth/OTPScreen` |
| Profile, Profile-3, Profile-18, Profile-21 | `Kyc/PersonalInfoScreen` |
| Profile-19, Profile-20 | `Kyc/PrimaryAddressScreen` |
| Profile-1, Profile-2 | `Kyc/IdUploadScreen` |
| Profile-4, Profile-15, Profile-16 | `Kyc/ExperienceScreen` |
| Profile-17 | `Kyc/AddWorkExperienceScreen` |
| Profile-13, Profile-14 | `Kyc/AddCertificateScreen` |
| Profile-5 | `Kyc/BankDetailsScreen` |
| Profile-6 | `Kyc/SelfieScreen` |
| Profile-7, -8, -9, Step 1_ Personal Details | `Kyc/KycReviewScreen` |
| Profile-10, -11, -12 | `Profile/VerificationCenterScreen` |
| Profile-22 | `Profile/EmergencyContactsScreen` |
| Profile-23 | `Profile/AddEmergencyContactScreen` |
| Profile-24 … Profile-29 | `Profile/ProfileScreen` |
| Profile (2) | `Profile/AttendanceScreen` |
| Profile-1 (2), -2 (2), -3 (2) | `Profile/MyLeavesScreen` |
| Profile-4 (2) | `Profile/SubmitLeaveScreen` |
| Profile-5 (2) | `Profile/SalaryBreakdownScreen` |
| Profile-6 (2), -7 (2), -8 (2) | `Profile/MyPerformanceScreen` |
| Profile-9 (2) | `components/common/LogoutModal` |
| Profile-10 (2), -12 (2), -15 (2) | `Profile/EditProfileScreen` |
| Profile-11 (2) | `Profile/BankDetailsScreen` |
| Profile-13 (2), -14 (2) | `Profile/PrimaryAddressScreen` |
| Profile-16 (2), -17 (2), -18 (2) | `Profile/DocumentsCertificatesScreen` |
| Profile-19 (2) | `Profile/AddCertificateScreen` |
| Profile-20 (2) | `Profile/AddWorkExperienceScreen` |
| Profile-21 (2) | `Profile/EditBankDetailsScreen` |
| Attendance & Gamification Flow | **Missing — Expertise screen** |
| wallet-1, SOS | `Home/DashboardScreen` (+ `FloatingSosButton`) |
| wallet | **Missing — Dashboard offline state** |
| wallet-2 | `components/booking/IncomingBookingModal` |
| Confirm sos | `components/common/EmergencySosModal` |
| Button | SOS icon asset (`FloatingSosButton`) |
| notifications, -1, -2 | `Home/NotificationsScreen` |
| clear list | `Home/NotificationsScreen` empty state (**missing design match**) |
| bookings, -1, -2, -3 | `Bookings/BookingsListScreen` + `BookingCard` |
| bookings-4 | `Bookings/CompletedBookingDetailScreen` |
| bookings-5 | `Bookings/PreviousBookingsScreen` |
| bookings-6, -7, -8 | `Bookings/CancellationDetailsScreen` |
| bookings-9, bookings (2) | `Bookings/CancelBookingScreen` |
| bookings-10, -11 | `Bookings/JobDetailScreen` |
| Home-16 | `Bookings/StartOtpScreen` |
| Home-7, Resume | `Bookings/ServiceCheckInScreen` |
| Home-11, Home-12 | `Bookings/AddExtraServiceScreen` |
| Home-8 | `Bookings/AwaitingApprovalScreen` |
| Booking Summary & Earnings | `Bookings/ServiceAddedSuccessScreen` |
| Home-9, Home-10 | `Bookings/ServiceCheckOutScreen` |
| Home-13, Home-14 | `Bookings/EndOtpScreen` |
| Home-15 | `Bookings/ItemsDetailsScreen` |
| Booking Summary & Earnings-1 | `Bookings/JobCompletedScreen` |
| INVOICE | `Bookings/BookingReceiptScreen` |
| Home, Home-3, Home-6, Home-5 (2), Home-6 (2), Home-10 (2) | `Services/MyServicesScreen` |
| Home-1 | `Services/PackageDetailsScreen` |
| Home-2, Home-4 | `components/common/ServiceUnderReviewModal` |
| Home-5 | `Services/ManageServiceScreen` |
| Home-7 (2), Home-8 (2), Add service, Select categories, Add Details | `Services/AddServiceScreen` / `ManageServiceScreen` |
| Home-9 (2), Edit service | `Services/EditPackageScreen` |
| Home (2), Home-1 (2), Home-2 (2), Home-4 (2) | `Wallet/EarningsHistoryScreen` |
| Home-3 (2) | `Wallet/TransactionDetailsScreen` |
| wallet (2) | `Wallet/EarningsDashboardScreen` |
| widthdrw, widthdrw-1 | `Wallet/PayoutRequestScreen` |
| widthdrw-2, Add money | `Wallet/WithdrawalSuccessScreen` (two alternative designs) |
| FAQ | `Profile/FaqScreen` |
| FAQ-1 | `components/common/DeleteAccountModal` |
| Help n support | `Profile/HelpSupportScreen` |
| privacy policy | `Profile/PrivacyPolicyScreen` |
| Frame 8, Frame 2147207561/62/65/66 | Section labels — no UI |
