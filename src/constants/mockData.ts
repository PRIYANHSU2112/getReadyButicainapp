import {
  AppNotification,
  UpcomingBookingItem,
  DetailedServiceReview,
  DetailedServiceItem,
  PackageItem,
  ServiceCardItem,
  IncomingBookingData,
  CancellationReasonOption,
} from "../types";

export type {
  AppNotification,
  UpcomingBookingItem,
  DetailedServiceReview,
  DetailedServiceItem,
  PackageItem,
  ServiceCardItem,
  IncomingBookingData,
  CancellationReasonOption,
};

export const CANCELLATION_REASONS: CancellationReasonOption[] = [
  {
    id: "emergency",
    label: "Emergency / Unavoidable circumstance",
  },
  {
    id: "customer_late",
    label: "Customer running late / Unresponsive",
  },
  {
    id: "health",
    label: "Health issues / Unwell",
  },
  {
    id: "other",
    label: "Other",
  },
];

export const MOCK_NOTIFICATIONS: AppNotification[] = [];
export const MOCK_INCOMING_BOOKING: IncomingBookingData | undefined = undefined;
export const MOCK_UPCOMING_BOOKINGS: UpcomingBookingItem[] = [];
export const MOCK_SERVICES: ServiceCardItem[] = [];
export const MOCK_DETAILED_SERVICES: DetailedServiceItem[] = [];
export const MOCK_PACKAGES: PackageItem[] = [];
