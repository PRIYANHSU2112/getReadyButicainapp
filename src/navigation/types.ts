import {NavigatorScreenParams} from "@react-navigation/native";

export type RootStackParamList = {
  // Auth Flow
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  OTPVerification: {phoneNumber: string};
  // KYC Flow
  KycStack: NavigatorScreenParams<KycStackParamList>;
  KycPending: undefined;
  // Main App
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  // Booking Flow
  IncomingJob: {bookingId: string};
  JobDetail: {bookingId: string};
  EnRoute: {bookingId: string};
  StartOtp: {bookingId: string};
  ServiceCheckIn: {bookingId: string; extraItems?: any[]};
  ServiceChecklist: {bookingId: string};
  AddExtraService: {bookingId: string};
  AwaitingApproval: {bookingId: string; requestedItems: any[]};
  ServiceAddedSuccess: {bookingId: string; addedItems: any[]};
  ServiceCheckOut: {bookingId: string};
  EndOtp: {bookingId: string};
  ItemsDetails: {bookingId: string};
  JobCompleted: {bookingId: string; earnings: number};
  // Services
  MyServices: {category?: string; initialTab?: "individual" | "package"} | undefined;
  ManageService: {serviceId?: string; serviceTitle?: string} | undefined;
  AddService: undefined;
  PackageDetails: {packageId?: string; packageTitle?: string} | undefined;
  EditPackage: {packageId?: string; packageTitle?: string} | undefined;
  // Calendar
  SlotManager: {date?: string} | undefined;
  LeaveRequest: undefined;
  // Wallet
  PayoutRequest: undefined;
  TransactionsHistory: undefined;
  EarningsHistory: {initialTab?: "all" | "service" | "withdrawal"} | undefined;
  TransactionDetails: {transactionId?: string; transaction?: any} | undefined;
  WithdrawalSuccess: {amount?: number; bankName?: string; accountEnding?: string; transactionId?: string} | undefined;
  // Profile
  EditProfile: undefined;
  PrimaryAddress: undefined;
  MyPerformance: {initialTab?: "today" | "week" | "month"} | undefined;
  Attendance: undefined;
  SalaryBreakdown: {month?: string} | undefined;
  MyLeaves: {initialTab?: "pending" | "approved" | "rejected"} | undefined;
  SubmitLeave: undefined;
  DocumentsCertificates: undefined;
  AddCertificate: undefined;
  AddWorkExperience: undefined;
  BankDetails: undefined;
  EditBankDetails: undefined;
  EmergencyContacts: undefined;
  AddEmergencyContact: {contactId?: string} | undefined;
  Faq: undefined;
  HelpSupport: undefined;
  PrivacyPolicy: undefined;
  VerificationCenter: undefined;
  RatingsReviews: undefined;
  // Notifications & Cancellations
  Notifications: undefined;
  CompletedBookingDetail: {bookingId?: string} | undefined;
  PreviousBookings: {clientName?: string; bookingId?: string} | undefined;
  CancelBooking: {bookingId?: string; serviceTitle?: string; clientName?: string} | undefined;
  BookingReceipt: {bookingId?: string; clientName?: string} | undefined;
  CancellationDetails: {
    bookingId?: string;
    serviceTitle?: string;
    clientName?: string;
    cancelledBy?: "customer" | "beautician";
    reason?: string;
    statement?: string;
  } | undefined;
};

export type KycStackParamList = {
  PersonalInfo: undefined;
  PrimaryAddress: undefined;
  IdUpload: undefined;
  Experience: undefined;
  AddWorkExperience: undefined;
  AddCertificate: undefined;
  BankDetails: undefined;
  Selfie: undefined;
  KycReview: undefined;
};

export type MainTabParamList = {
  DashboardTab: undefined;
  BookingsTab: undefined;
  CalendarTab: undefined;
  WalletTab: undefined;
  ProfileTab: undefined;
};
