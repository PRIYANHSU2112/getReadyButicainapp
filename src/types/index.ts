// --- Partner / Beautician Types -----------------------------------------------

export type DutyStatus = "online" | "offline";
export type KycStatus = "pending" | "submitted" | "approved" | "rejected";
export type BookingStatus = "assigned" | "en_route" | "reached" | "in_progress" | "completed" | "cancelled";

export interface WorkHistoryItem {
  id: string;
  salonName: string;
  role: string;
  startDate?: string;
  endDate?: string;
  years?: string;
}

export interface CertificationItem {
  id: string;
  title: string;
  issuer: string;
  issueDate?: string;
  imageUri?: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relation: string;
  initials?: string;
  autoShareLocation?: boolean;
}

export interface PartnerProfile {
  id: string;
  userId?: string; // auth user id — used by booking/slot APIs
  bio?: string;
  fullName: string;
  phoneNumber: string;
  email?: string;
  avatar?: string;
  dutyStatus: DutyStatus;
  kycStatus: KycStatus;
  rating: number;
  totalBookings: number;
  experienceYears: number;
  walletBalance: number;
  todayEarnings: number;
  skills: string[];
  gender?: string;
  dob?: string;
  languages?: string[];
  addressLine1?: string;
  city?: string;
  state?: string;
  pincode?: string;
  workingRadiusKm?: number;
  preferredHours?: {start: string; end: string};
  workHistory?: WorkHistoryItem[];
  certifications?: CertificationItem[];
  bankDetails?: BankDetails;
  emergencyContacts?: EmergencyContact[];
}

export interface KycDocument {
  id: string;
  type: "aadhaar_front" | "aadhaar_back" | "pan" | "selfie_with_id" | "certificate" | "bank_passbook";
  uri: string;
  uploadedAt: string;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
}

export interface BankDetails {
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  upiId?: string;
}

export interface BookingItem {
  serviceId: string;
  serviceTitle: string;
  duration: number;
  price: number;
  completed: boolean;
}

export interface Booking {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  address: {
    fullAddress: string;
    latitude: number;
    longitude: number;
  };
  scheduledAt: string;
  status: BookingStatus;
  items: BookingItem[];
  totalAmount: number;
  startOtp?: string;
  endOtp?: string;
  tipAmount?: number;
}

export interface EarningTransaction {
  id: string;
  type: "booking" | "bonus" | "payout" | "deduction";
  amount: number;
  description: string;
  date: string;
  bookingId?: string;
}

export interface AvailabilitySlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  isUnread: boolean;
  category: "today" | "earlier";
  type: "booking" | "salary" | "target" | "cancellation" | "admin" | "review";
}

export interface UpcomingBookingItem {
  id: string;
  clientName: string;
  membershipTag: string;
  clientAvatar?: string;
  dateTime: string;
  serviceName: string;
  price: number;
}

export interface DetailedServiceReview {
  id: string;
  author: string;
  location: string;
  date?: string;
  rating: number;
  comment: string;
  avatarLetter: string;
}

// Admin review state of a partner-created service/package.
export type CatalogStatus = "approved" | "pending" | "rejected";

export interface DetailedServiceItem {
  id: string;
  title: string;
  category: "Facial" | "Hair coloring" | "Makeup" | "Waxing" | "Nails" | "Massage" | string;
  tag: string;
  duration: string;
  discountPrice: number;
  originalPrice: number;
  isEnabled: boolean;
  isPopular?: boolean;
  rating: number;
  reviewsCount: number;
  description: string;
  imageKey?: string;
  thumbnailUrl?: string;
  whatsIncluded: string[];
  reviews?: DetailedServiceReview[];
  status: CatalogStatus;
  rejectionReason?: string;
}

export interface PackageItem {
  id: string;
  title: string;
  servicesCount: number;
  servicesIncluded: string[];
  duration: string;
  discountPrice: number;
  originalPrice: number;
  fixedPrice?: number;
  isEnabled: boolean;
  isPopular?: boolean;
  tag: string;
  rating?: number;
  reviewsCount?: number;
  description?: string;
  inclusionsList?: string[];
  imageKey?: string;
  thumbnailUrl?: string;
  reviews?: DetailedServiceReview[];
  status: CatalogStatus;
  rejectionReason?: string;
}

export interface ServiceCardItem {
  id: string;
  title: string;
  category: string;
  rating: number;
  reviewsCount: number;
  description: string;
  discountPrice: number;
  originalPrice: number;
  imageKey?: string;
  thumbnailUrl?: string;
  status: CatalogStatus;
}

export interface IncomingBookingData {
  id: string;
  serviceId: string;
  clientName: string;
  membershipTag: string;
  clientAvatar?: string;
  serviceName: string;
  dateTime: string;
  address: string;
  distanceKm: string;
  payoutAmount: number;
  initialCountdown: number;
}

export interface CancellationReasonOption {
  id: string;
  label: string;
}

