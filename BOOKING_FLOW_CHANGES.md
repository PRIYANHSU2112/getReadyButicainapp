# Beautician App: Booking Flow Changes

Changes made for the live-visit flow: customer "I'm Ready", mid-visit extra services
(customer approval), the add-on payment gate, and End OTP completion.

> **Note:** `node_modules` was not installed in this checkout, so these changes were not
> type-checked or run here. Run `npm install` and `npx tsc --noEmit` before release.

## Flow at a glance

1. The customer taps **I'M READY** in their app. The beautician sees it on the Start OTP screen.
2. The beautician enters the customer's **Start OTP**, and the booking becomes `STARTED`.
3. The beautician can **propose extra services**. The customer approves or declines them in their app.
4. Once approved, the customer owes the add-on amount. The **End OTP stays locked** until it is paid:
   - the customer pays by UPI, card or Glow Wallet in their app, or
   - the customer pays cash and the beautician taps **Cash Collected**.
5. The beautician enters the **End OTP**, and the booking becomes `COMPLETED`.

## Files changed

### `src/services/bookingService.ts`
Two new API calls:
- `proposeAddOns(bookingId, serviceIds)` → `POST /bookings/:id/add-ons`
  The server prices the services from the catalog; prices are never sent from the app.
- `addOnCashCollected(bookingId)` → `POST /bookings/:id/add-ons/cash-collected`

### `src/hooks/queries.ts`
- `useBookingDetail(id, pollMs?)`: new optional `pollMs`, so a screen refreshes while it waits on the customer.
- New mutations: `useProposeAddOns()` and `useAddOnCashCollected()`. Both refresh bookings and the home summary.

### `src/services/mappers.ts`
`BookingDetail` has three new fields, filled by `toBooking`:

| Field | Meaning |
|---|---|
| `customerReady` | The customer tapped I'M READY |
| `addOnRequests` | Extra-service requests: `{id, items, amount, proposedBy, status}`, where status is `PROPOSED`, `APPROVED` or `DECLINED` |
| `addOnAmountDue` | Unpaid add-on amount. While it is above 0, the End OTP is refused |

New exported type: `AddOnRequest`.

### `src/screens/Bookings/AddExtraServiceScreen.tsx`
- **Send Addition Request** now calls the API and then opens Awaiting Approval. Before this change it only navigated, and nothing reached the server.
- Shows a loader while sending, and an error alert if the request fails.
- Limited to 5 services per request (the server rule).
- Removed the fake ₹245 fallback price from the selected total.

### `src/screens/Bookings/AwaitingApprovalScreen.tsx`
- Refreshes the booking every 4 seconds:
  - **Approved:** opens Service Added Success.
  - **Declined:** shows an alert and goes back.
- Removed the hardcoded "Classic Manicure" sample items and the **Simulate Client Approval** demo button.
- "Resend Request" is now **Remind Customer**. It tells the beautician the customer can approve from their app.
- "Cancel Request" is now **Back to Service**. The server has no withdraw action, so the request stays with the customer to answer.
- Removed the fake "Request sent 2 mins ago" text.

### `src/screens/Bookings/EndOtpScreen.tsx`
- Real summary instead of the hardcoded "4 selected Service", "1 hr 15 min" and "₹2,379.00": service count, duration since start, and total charge.
- **Payment card:** appears when `addOnAmountDue > 0` and shows "Customer must pay ₹X for added services", with a **Cash Collected ₹X** button (asks for confirmation first).
- **Finalize Service** is disabled while an add-on payment is pending.
- If End OTP verification fails, the booking is refetched and the alert explains why: unpaid add-ons, or a wrong OTP / unfinished services.
- Refreshes every 5 seconds, so the payment card clears when the customer pays in their app.

### `src/screens/Bookings/StartOtpScreen.tsx`
- New status pill: **✓ Customer is ready (workspace prepared)**, or "Customer hasn't marked ready yet". Refreshes every 10 seconds.
- A wrong Start OTP now shows an error toast. It used to fail silently.

## Server rules the app relies on

- Only the **assigned beautician** can confirm cash, and only the **customer** can approve or decline an add-on. Anyone else gets HTTP 403.
- Extra services can be added only while the visit is `STARTED`, `IN_PROGRESS` or `SERVICES_COMPLETED`.
- Only one beautician proposal can be open at a time. A second one gets 409 `ADD_ON_PENDING`.
- An approved add-on joins the visit as in-progress items assigned to the beautician. They must be marked done with the existing item-complete flow before the End OTP.
- End OTP with unpaid add-ons returns 409 `ADDITIONAL_PAYMENT_PENDING`.
- Add-on items count toward beautician payouts (the payout is calculated from item totals).

## How to test

1. Start a booking with the Start OTP. Before that, check the "Customer is ready" pill after the customer taps I'M READY.
2. Open **Add Extra Service**, pick a service and send it. The customer gets an approval card in their app.
3. **Customer approves:** this screen moves to Service Added Success.
4. On the End OTP screen, the payment card shows the amount due:
   - Tap **Cash Collected** and confirm. The card disappears.
   - Or have the customer pay in their app. The card disappears within 5 seconds.
5. Mark the new item done, enter the End OTP, and the visit completes.
6. **Customer declines instead:** the "Request declined" alert appears.
