import {
  AppNotification, Booking, BookingStatus, CatalogStatus, CertificationItem, DetailedServiceItem, KycStatus,
  PackageItem, PartnerProfile, ServiceCardItem, UpcomingBookingItem, WorkHistoryItem,
} from "../types";
import type {BookingCardData, TransactionItem} from "../components/common";

// Backend → app shape adapters. Keep screens unaware of raw API payloads.

const STATUS_MAP: Record<string, BookingStatus> = {
  ASSIGNED: "assigned", PARTIALLY_ASSIGNED: "assigned", CONFIRMED: "assigned",
  ARRIVING: "en_route", STARTED: "in_progress", IN_PROGRESS: "in_progress",
  SERVICES_COMPLETED: "in_progress", COMPLETION_PENDING: "in_progress",
  COMPLETED: "completed", CANCELLED: "cancelled",
};

const fmtDate = (d?: string | Date | null) =>
  d ? new Date(d).toLocaleDateString("en-IN", {day: "2-digit", month: "short", year: "numeric"}) : "";
const fmtTime = (d?: string | Date | null) =>
  d ? new Date(d).toLocaleTimeString("en-IN", {hour: "2-digit", minute: "2-digit"}) : "";

const idOf = (o: any): string => String(o?.id ?? o?._id ?? "");

const addressText = (a: any): string =>
  a?.fullAddress ?? [a?.houseNumber, a?.addressLine1, a?.addressLine2, a?.locality, a?.city, a?.pincode].filter(Boolean).join(", ");

const coordsOf = (a: any) => {
  const c = a?.location?.coordinates; // GeoJSON [lng, lat]
  return {
    latitude: Number(a?.latitude ?? a?.lat ?? (Array.isArray(c) ? c[1] : 0)) || 0,
    longitude: Number(a?.longitude ?? a?.lng ?? (Array.isArray(c) ? c[0] : 0)) || 0,
  };
};

const KYC_MAP: Record<string, KycStatus> = {
  VERIFIED: "approved", APPROVED: "approved",
  UNDER_REVIEW: "submitted", SUBMITTED: "submitted",
  REJECTED: "rejected", EXPIRED: "rejected",
};

// `p` = /beautician/me (may be null before onboarding), `user` = /auth/me
export const toPartner = (p: any, user: any): PartnerProfile => {
  return {
    id: idOf(p) || idOf(user),
    userId: p?.userId ?? (idOf(user) || undefined),
    bio: p?.bio ?? undefined,
    fullName: p?.fullName ?? p?.name ?? user?.name ?? "",
    phoneNumber: user?.phone ?? p?.phone ?? "",
    email: user?.email ?? p?.email,
    avatar: p?.profilePhoto?.url ?? user?.avatar ?? undefined,
    dutyStatus: p?.operationalStatus === "ONLINE" || p?.operationalStatus === "AVAILABLE" ? "online" : "offline",
    kycStatus: p ? KYC_MAP[p.kycStatus] ?? KYC_MAP[p.status] ?? "pending" : "pending",
    rating: p?.ratingAvg ?? 0,
    totalBookings: p?.completedBookingsCount ?? 0,
    experienceYears: p?.experienceYears ?? 0,
    walletBalance: 0,
    todayEarnings: 0,
    skills: p?.skills ?? [],
    gender: p?.gender ?? user?.gender,
    dob: user?.dob ?? p?.dateOfBirth ?? p?.dob,
    languages: user?.languages?.length ? user.languages : p?.languages,
    addressLine1: p?.address?.line1,
    city: p?.address?.city,
    state: p?.address?.state,
    pincode: p?.address?.pincode,
    workingRadiusKm: p?.serviceRadiusKm,
    emergencyContacts: p?.emergencyContact?.name
      ? [{
          id: "primary",
          name: p.emergencyContact.name,
          phone: p.emergencyContact.phone ?? "",
          relation: p.emergencyContact.relation ?? "",
          initials: String(p.emergencyContact.name).split(" ").map((s: string) => s[0]).join("").slice(0, 2).toUpperCase(),
        }]
      : [],
  };
};

// Booking plus detail-only fields (kept out of the shared Booking type).
export interface BookingDetail extends Booking {
  bookingNumber?: string;
  notes?: string | null;
  paymentStatus?: string;
  paymentMethod?: string;
  scheduledStart?: string; // ISO
  startedAt?: string; // ISO — set when start OTP is verified
  subtotal?: number;
  tax?: number;
  payable?: number;
  /** Customer tapped "I'M READY" (room/workspace prepared). */
  customerReady?: boolean;
  /** Extra services added mid-visit, newest last. */
  addOnRequests?: AddOnRequest[];
  /** Unpaid add-on amount; End OTP is refused while this is > 0. */
  addOnAmountDue?: number;
}

export interface AddOnRequest {
  id: string;
  items: {serviceId: string; serviceName: string; unitPrice: number}[];
  amount: number;
  proposedBy: "CUSTOMER" | "BEAUTICIAN";
  status: "PROPOSED" | "APPROVED" | "DECLINED";
}

export const toBooking = (b: any): BookingDetail => {
  const addr = b?.addressSnapshot ?? {};
  const participant = b?.participants?.[0];
  const items = (b?.items ?? []).map((i: any) => ({
    serviceId: idOf(i) || i.serviceId,
    serviceTitle: i.serviceName,
    duration: i.durationMinutes ?? 30,
    price: i.totalPrice ?? i.unitPrice ?? 0,
    completed: i.status === "COMPLETED",
  }));
  return {
    id: idOf(b),
    customerId: b?.userId ?? "",
    customerName: addr.recipientName ?? participant?.name ?? "Client",
    customerPhone: addr.phoneNumber ?? participant?.mobileNumber ?? "",
    address: {fullAddress: addressText(addr), ...coordsOf(addr)},
    scheduledAt: b?.scheduledStartTime ? `${fmtDate(b.scheduledStartTime)}, ${fmtTime(b.scheduledStartTime)}` : b?.scheduledDate ?? "",
    status: STATUS_MAP[b?.status] ?? "assigned",
    items,
    totalAmount: items.reduce((s: number, i: {price: number}) => s + i.price, 0) || b?.pricing?.payableAmount || 0,
    bookingNumber: b?.bookingNumber,
    notes: b?.specialInstructions ?? null,
    paymentStatus: b?.paymentStatus,
    paymentMethod: b?.paymentMethod,
    scheduledStart: b?.scheduledStartTime ?? undefined,
    startedAt: b?.startedAt ?? b?.items?.find((i: any) => i.startedAt)?.startedAt ?? undefined,
    subtotal: b?.pricing?.subtotal,
    tax: b?.pricing?.tax,
    payable: b?.pricing?.payableAmount,
    customerReady: Boolean(b?.customerReadyAt),
    addOnRequests: (b?.addOnRequests ?? []).map((r: any) => ({
      id: idOf(r),
      items: r.items ?? [],
      amount: r.amount ?? 0,
      proposedBy: r.proposedBy,
      status: r.status,
    })),
    addOnAmountDue: b?.additionalPayment?.status === "PENDING" ? b.additionalPayment.amount ?? 0 : 0,
  };
};

export const toBookingCard = (b: any): BookingCardData => {
  const bk = toBooking(b);
  const s = bk.status;
  return {
    id: bk.id,
    bookingNumber: b?.bookingNumber,
    customerName: bk.customerName,
    date: fmtDate(b?.scheduledStartTime ?? b?.scheduledDate),
    time: fmtTime(b?.scheduledStartTime),
    price: bk.totalAmount,
    status: s === "completed" ? "completed" : s === "cancelled" ? "cancelled" : s === "assigned" ? "assigned" : "upcoming",
    serviceTitle: bk.items.map(i => i.serviceTitle).join(", "),
  };
};

export const toUpcoming = (b: any): UpcomingBookingItem => ({
  id: idOf(b) || b?.bookingId,
  clientName: b?.customer?.name ?? b?.customerName ?? "Client",
  membershipTag: b?.customer?.membershipTag ?? b?.membershipTag ?? "",
  clientAvatar: b?.customer?.avatar,
  dateTime: [b?.scheduledDate, b?.timeSlot].filter(Boolean).join(", "),
  serviceName: b?.serviceName ?? b?.services?.map((s: any) => s.name ?? s).join(", ") ?? "",
  price: b?.amount ?? b?.price ?? b?.payableAmount ?? 0,
});

const monthYear = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString("en-IN", {month: "short", year: "numeric"}) : "";

export const toWorkHistory = (w: any): WorkHistoryItem => ({
  id: idOf(w),
  salonName: w?.companyName ?? w?.salonName ?? "",
  role: w?.role ?? "",
  startDate: w?.startDate,
  endDate: w?.endDate ?? undefined,
  years: `${monthYear(w?.startDate)} – ${w?.isCurrent || !w?.endDate ? "Present" : monthYear(w.endDate)}`,
});

export const toCertification = (c: any): CertificationItem => ({
  id: idOf(c),
  title: c?.title ?? "",
  issuer: c?.issuingOrganization ?? c?.issuer ?? "",
  issueDate: c?.issueDate ? `Issue : ${fmtDate(c.issueDate)}` : undefined,
  imageUri: c?.file?.url ?? c?.certificateImage?.url ?? undefined,
});

// Catalog review state: PENDING_APPROVAL/REJECTED mean the item is not live yet.
const CATALOG_STATUS_MAP: Record<string, CatalogStatus> = {
  APPROVED: "approved", PENDING_APPROVAL: "pending", PENDING: "pending",
  UNDER_REVIEW: "pending", REJECTED: "rejected",
};

const catalogStatus = (s: any): CatalogStatus =>
  CATALOG_STATUS_MAP[String(s?.status ?? "").toUpperCase()] ?? "approved";

// A rating is only meaningful once someone has actually rated; 0 reviews → 0, never a seeded average.
const ratedAvg = (item: any): number =>
  Number(item?.ratingCount ?? 0) > 0 ? Number(item?.rating ?? item?.ratingAvg ?? 0) : 0;

// /beautician/home/services → {id, title, price, originalPrice, rating, thumbnail, categoryName, duration}
export const toServiceCard = (s: any): ServiceCardItem => ({
  id: idOf(s),
  title: s?.title ?? s?.name ?? "",
  category: s?.categoryName ?? "",
  rating: ratedAvg(s),
  reviewsCount: s?.ratingCount ?? 0,
  description: s?.duration ?? s?.shortDescription ?? "",
  discountPrice: s?.price ?? s?.discountedPrice ?? 0,
  originalPrice: s?.originalPrice ?? s?.price ?? 0,
  thumbnailUrl: (typeof s?.thumbnail === "string" ? s.thumbnail : s?.thumbnail?.url) ?? undefined,
  status: catalogStatus(s),
});

const durationText = (s: any) =>
  s?.duration ?? (s?.durationMinMinutes ? `${s.durationMinMinutes}-${s.durationMaxMinutes ?? s.durationMinMinutes} mins` : "");

// Accepts both /beautician/home/services (pre-shaped) and raw catalog /services/:id payloads.
export const toDetailedService = (s: any): DetailedServiceItem => ({
  id: idOf(s),
  title: s?.title ?? s?.name ?? "",
  category: s?.categoryName ?? s?.category?.name ?? "",
  tag: s?.categoryName ?? s?.category?.name ?? "",
  duration: durationText(s),
  discountPrice: s?.discountedPrice ?? s?.price ?? 0,
  originalPrice: s?.originalPrice ?? s?.price ?? 0,
  isEnabled: s?.isActive ?? true,
  isPopular: s?.isPopular ?? false,
  rating: ratedAvg(s),
  reviewsCount: s?.ratingCount ?? 0,
  description: s?.description ?? s?.shortDescription ?? "",
  thumbnailUrl: (typeof s?.thumbnail === "string" ? s.thumbnail : s?.thumbnail?.url) ?? s?.images?.[0]?.url ?? undefined,
  whatsIncluded: s?.inclusions ?? s?.highlights ?? [],
  reviews: [],
  status: catalogStatus(s),
  rejectionReason: s?.rejectionReason ?? undefined,
});

export const toPackageItem = (p: any): PackageItem => {
  const names: string[] = (p?.items ?? []).map((i: any) => i?.name ?? i?.serviceName).filter(Boolean);
  const itemMins = (p?.items ?? []).reduce(
    (s: number, i: any) => s + (i?.durationMinutes ?? i?.durationMinMinutes ?? 0), 0,
  );
  return {
    id: idOf(p),
    title: p?.name ?? p?.title ?? "",
    servicesCount: names.length,
    servicesIncluded: names,
    duration: itemMins ? `${itemMins} mins` : durationText(p),
    discountPrice: p?.discountedPrice ?? p?.price ?? 0,
    originalPrice: p?.originalPrice ?? p?.price ?? 0,
    isEnabled: p?.isActive ?? true,
    isPopular: p?.isPopular ?? false,
    tag: p?.categoryName ?? "Package",
    rating: ratedAvg({...p, rating: p?.ratingAvg}),
    reviewsCount: p?.ratingCount ?? 0,
    description: p?.description ?? "",
    inclusionsList: names,
    thumbnailUrl: (typeof p?.thumbnail === "string" ? p.thumbnail : p?.thumbnail?.url) ?? p?.images?.[0]?.url ?? undefined,
    reviews: [],
    status: catalogStatus(p),
    rejectionReason: p?.rejectionReason ?? undefined,
  };
};

const NOTIF_TYPES: AppNotification["type"][] = ["booking", "salary", "target", "cancellation", "admin", "review"];

export const toNotification = (n: any): AppNotification => {
  const created = n?.createdAt ? new Date(n.createdAt) : new Date();
  const isToday = created.toDateString() === new Date().toDateString();
  const t = String(n?.type ?? n?.category ?? "admin").toLowerCase();
  return {
    id: idOf(n),
    title: n?.title ?? "",
    message: n?.message ?? n?.body ?? "",
    time: isToday ? fmtTime(created) : fmtDate(created),
    isUnread: !(n?.isRead ?? n?.read ?? false),
    category: isToday ? "today" : "earlier",
    type: (NOTIF_TYPES.find(k => t.includes(k)) ?? "admin") as AppNotification["type"],
  };
};

export const toTransaction = (t: any): TransactionItem => {
  const isCredit = String(t?.type ?? t?.direction ?? "").toUpperCase().includes("CREDIT");
  const status = String(t?.status ?? "COMPLETED").toLowerCase();
  return {
    id: idOf(t),
    title: t?.title ?? t?.description ?? (isCredit ? "Service earning" : "Withdrawal"),
    dateTime: t?.dateTime ?? `${fmtDate(t?.createdAt)} • ${fmtTime(t?.createdAt)}`,
    referenceId: t?.referenceId ?? t?.transactionId ?? idOf(t),
    amount: Math.abs(Number(t?.amount ?? 0)),
    type: isCredit ? "credit" : "debit",
    category: t?.category === "withdrawal" || !isCredit ? "withdrawal" : "service",
    status: status.includes("fail") ? "failed" : status.includes("pend") || status.includes("process") ? "processing" : "completed",
    customerName: t?.customerName ?? t?.metadata?.customerName,
    bankName: t?.bankName ?? undefined,
    accountNumber: t?.accountNumber ?? undefined,
    upiId: t?.upiId ?? undefined,
  };
};
