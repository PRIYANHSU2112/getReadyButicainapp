import {useMemo} from "react";
import {useInfiniteQuery, useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {Paginated} from "../services/apiClient";
import {bookingService, slotService} from "../services/bookingService";
import {kycService} from "../services/kycService";
import {
  homeService, hrmService, LeaveStatusApi, notificationService, PayoutRequest, userService, walletService,
} from "../services/partnerService";
import {
  toBooking, toBookingCard, toCertification, toDetailedService, toNotification, toPackageItem, toServiceCard,
  toTransaction, toUpcoming, toWorkHistory,
} from "../services/mappers";
import {catalogService} from "../services/catalogService";
import {contentService, PolicyType} from "../services/contentService";
import {DutyStatus} from "../types";

export const qk = {
  profile: ["profile"] as const,
  summary: ["home", "summary"] as const,
  homeServices: ["home", "services"] as const,
  upcoming: ["bookings", "upcoming"] as const,
  assignments: ["bookings", "assignments"] as const,
  booking: (id: string) => ["bookings", "detail", id] as const,
  wallet: ["wallet", "dashboard"] as const,
  transactions: ["wallet", "transactions"] as const,
  notifications: ["notifications"] as const,
  attendance: ["hrm", "attendance"] as const,
  leaves: ["hrm", "leaves"] as const,
  payslips: ["hrm", "payslips"] as const,
  workHistory: ["profile", "work-history"] as const,
  certificates: ["profile", "certificates"] as const,
  bank: ["profile", "bank"] as const,
};

const nextPage = <T,>(last: Paginated<T>) =>
  last.meta.page < last.meta.totalPages ? last.meta.page + 1 : undefined;

// --- Profile / Home ---------------------------------------------------------
export const useProfile = (enabled = true) =>
  useQuery({queryKey: qk.profile, queryFn: kycService.getProfile, enabled, staleTime: 5 * 60_000});

export const useHomeSummary = () =>
  useQuery({queryKey: qk.summary, queryFn: homeService.getSummary, staleTime: 30_000});

export const useHomeServices = () =>
  useQuery({
    queryKey: qk.homeServices,
    queryFn: () => homeService.getServices(4),
    select: data => (Array.isArray(data) ? data : []).map(toServiceCard),
    staleTime: 5 * 60_000,
  });

export const useUpcomingBookings = () =>
  useQuery({
    queryKey: qk.upcoming,
    queryFn: () => bookingService.getUpcoming(2),
    select: data => (Array.isArray(data) ? data : []).map(toUpcoming),
    staleTime: 30_000,
  });

export const useSetDuty = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (status: DutyStatus) => homeService.setDuty(status),
    onSuccess: () => qc.invalidateQueries({queryKey: qk.summary}),
  });
};

// --- User (personal info / address) -----------------------------------------
export const useUpdateMe = () => useMutation({mutationFn: userService.updateMe});
export const useSaveAddress = () => useMutation({mutationFn: userService.saveHomeAddress});

// --- Content (policies / FAQ / support) -------------------------------------
const CONTENT_STALE = 60 * 60_000;

export const usePolicy = (type: PolicyType) =>
  useQuery({
    queryKey: ["content", "policy", type],
    queryFn: () => contentService.getPolicy(type),
    select: d => d?.policy ?? "",
    staleTime: CONTENT_STALE,
  });

export const useCompany = () =>
  useQuery({queryKey: ["content", "company"], queryFn: contentService.getCompany, staleTime: CONTENT_STALE});

export const useFaqs = () =>
  useQuery({queryKey: ["content", "faqs"], queryFn: contentService.getFaqs, staleTime: CONTENT_STALE});

export const useCreateTicket = () => useMutation({mutationFn: contentService.createTicket});

// --- Slots ------------------------------------------------------------------
export const useSlots = (beauticianId?: string, date?: string) =>
  useQuery({
    queryKey: ["slots", beauticianId, date],
    queryFn: () => slotService.list(beauticianId!, date!),
    enabled: !!beauticianId && !!date,
    select: d => [...d.items].sort((a, b) => Date.parse(a.startAt) - Date.parse(b.startAt)),
    staleTime: 30_000,
  });

export const useSlotMutation = <V,>(fn: (v: V) => Promise<unknown>) => {
  const qc = useQueryClient();
  return useMutation({mutationFn: fn, onSuccess: () => qc.invalidateQueries({queryKey: ["slots"]})});
};

// --- Catalog: my services / packages ----------------------------------------
const CATALOG_STALE = 10 * 60_000;

export const useMyServices = () =>
  useQuery({
    queryKey: ["catalog", "my-services"],
    queryFn: () => catalogService.getMyServices(50),
    select: d => asList(d).map(toDetailedService),
    staleTime: CATALOG_STALE,
  });

// Only approved services may be sold — used where a service is attached to a booking.
export const useBookableServices = () => {
  const q = useMyServices();
  return {...q, bookable: useMemo(() => (q.data ?? []).filter(s => s.status === "approved"), [q.data])};
};

export const usePackages = () =>
  useQuery({
    queryKey: ["catalog", "my-packages"],
    queryFn: () => catalogService.getMyPackages(50),
    select: d => asList(d).map(toPackageItem),
    staleTime: CATALOG_STALE,
  });

export const useServiceDetail = (id?: string) =>
  useQuery({
    queryKey: ["catalog", "service", id],
    queryFn: () => catalogService.getServiceDetails(id!),
    enabled: !!id,
    select: toDetailedService,
    staleTime: CATALOG_STALE,
  });

export const usePackageDetail = (id?: string) =>
  useQuery({
    queryKey: ["catalog", "package", id],
    queryFn: () => catalogService.getPackageDetails(id!),
    enabled: !!id,
    select: toPackageItem,
    staleTime: CATALOG_STALE,
  });

// Cached list first (instant), detail request only on a cache miss.
export const usePackage = (id?: string) => {
  const listed = usePackages().data?.find(p => p.id === id);
  const detail = usePackageDetail(listed ? undefined : id);
  return {pkg: listed ?? detail.data, isLoading: !listed && detail.isLoading};
};

// --- KYC: work history / certificates / bank --------------------------------
const asList = (d: unknown): any[] => (Array.isArray(d) ? d : (d as any)?.items ?? []);

export const useWorkHistory = () =>
  useQuery({queryKey: qk.workHistory, queryFn: kycService.getWorkHistory, select: d => asList(d).map(toWorkHistory)});

export const useCertificates = () =>
  useQuery({queryKey: qk.certificates, queryFn: kycService.getCertificates, select: d => asList(d).map(toCertification)});

export const useBankDetails = () =>
  useQuery({queryKey: qk.bank, queryFn: () => kycService.getBankDetails().catch(() => null), staleTime: 5 * 60_000});

const useProfileMutation = <V,>(fn: (v: V) => Promise<unknown>, key: readonly unknown[]) => {
  const qc = useQueryClient();
  return useMutation({mutationFn: fn, onSuccess: () => qc.invalidateQueries({queryKey: key})});
};

export const useAddWorkHistory = () => useProfileMutation(kycService.addWorkHistory, qk.workHistory);
export const useDeleteWorkHistory = () => useProfileMutation(kycService.deleteWorkHistory, qk.workHistory);
export const useAddCertificate = () => useProfileMutation(kycService.addCertificate, qk.certificates);
export const useDeleteCertificate = () => useProfileMutation(kycService.deleteCertificate, qk.certificates);
export const useSaveBankDetails = () => useProfileMutation(kycService.saveBankDetails, qk.bank);

// --- Bookings ---------------------------------------------------------------
export const useAssignments = (enabled = true) =>
  useInfiniteQuery({
    queryKey: qk.assignments,
    enabled,
    queryFn: ({pageParam}) => bookingService.getMyAssignments(pageParam, 10),
    initialPageParam: 1,
    getNextPageParam: nextPage,
    select: data => data.pages.flatMap(p => p.items),
    staleTime: 30_000,
  });

export const useAssignmentCards = () => {
  const q = useAssignments();
  return {...q, cards: q.data?.map(toBookingCard) ?? []};
};

// `pollMs` keeps a screen live while it waits on the customer (approval, payment).
export const useBookingDetail = (id?: string, pollMs?: number) =>
  useQuery({
    queryKey: qk.booking(id ?? ""),
    queryFn: () => bookingService.getBookingDetails(id!),
    enabled: !!id,
    select: toBooking,
    refetchInterval: pollMs ?? false,
  });

const useBookingMutation = <V,>(fn: (v: V) => Promise<unknown>) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      qc.invalidateQueries({queryKey: ["bookings"]});
      qc.invalidateQueries({queryKey: qk.summary});
    },
  });
};

export const useVerifyStartOtp = () =>
  useBookingMutation(({id, otp}: {id: string; otp: string}) => bookingService.verifyStartOtp(id, otp));
export const useVerifyEndOtp = () =>
  useBookingMutation(({id, otp}: {id: string; otp: string}) => bookingService.verifyEndOtp(id, otp));
export const useCompleteItem = () =>
  useBookingMutation(({id, itemId}: {id: string; itemId: string}) => bookingService.completeItem(id, itemId));
export const useProposeAddOns = () =>
  useBookingMutation(({id, serviceIds}: {id: string; serviceIds: string[]}) =>
    bookingService.proposeAddOns(id, serviceIds));
export const useAddOnCashCollected = () =>
  useBookingMutation((id: string) => bookingService.addOnCashCollected(id));
export const useCancelBooking = () =>
  useBookingMutation(({id, reason}: {id: string; reason: string}) => bookingService.cancel(id, reason));

// --- Wallet -----------------------------------------------------------------
export const useWalletDashboard = () =>
  useQuery({queryKey: qk.wallet, queryFn: walletService.getDashboard, staleTime: 30_000});

export const useTransactions = (type: "all" | "credit" | "debit" = "all") =>
  useInfiniteQuery({
    queryKey: [...qk.transactions, type],
    queryFn: ({pageParam}) => walletService.getTransactions(pageParam, 15, type),
    initialPageParam: 1,
    getNextPageParam: nextPage,
    select: data => data.pages.flatMap(p => p.items).map(toTransaction),
  });

export const useTransaction = (id?: string, enabled = true) =>
  useQuery({
    queryKey: ["wallet", "transaction", id],
    queryFn: () => walletService.getTransaction(id!),
    enabled: !!id && enabled,
    select: toTransaction,
  });

export const usePayoutConfig = () =>
  useQuery({queryKey: ["wallet", "payout-config"], queryFn: walletService.getPayoutConfig, staleTime: 30 * 60_000});

export const useRequestPayout = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: PayoutRequest) => walletService.requestPayout(payload),
    onSuccess: () => {
      qc.invalidateQueries({queryKey: ["wallet"]});
      qc.invalidateQueries({queryKey: qk.summary});
    },
  });
};

// --- Notifications ----------------------------------------------------------
export const useNotifications = () =>
  useInfiniteQuery({
    queryKey: qk.notifications,
    queryFn: ({pageParam}) => notificationService.list(pageParam, 20),
    initialPageParam: 1,
    getNextPageParam: nextPage,
    select: data => data.pages.flatMap(p => p.items).map(toNotification),
  });

export const useMarkNotificationRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: notificationService.markRead,
    onSuccess: () => qc.invalidateQueries({queryKey: qk.notifications}),
  });
};

// --- HRM --------------------------------------------------------------------
export const useAttendance = (month: number, year: number) =>
  useQuery({queryKey: [...qk.attendance, year, month], queryFn: () => hrmService.getAttendance(month, year)});

export const useLeaves = (status?: LeaveStatusApi) =>
  useQuery({queryKey: [...qk.leaves, status ?? "all"], queryFn: () => hrmService.getLeaves(status)});

export const usePayslips = () => useQuery({queryKey: qk.payslips, queryFn: hrmService.getPayslips, staleTime: 10 * 60_000});

export const useApplyLeave = () => {
  const qc = useQueryClient();
  return useMutation({
    // HRM requires the beautician profile to exist before it accepts a leave request.
    mutationFn: async (v: Parameters<typeof hrmService.applyLeave>[0]) => {
      await kycService.ensureProfile();
      return hrmService.applyLeave(v);
    },
    onSuccess: () => qc.invalidateQueries({queryKey: qk.leaves}),
  });
};

export const useCancelLeave = () => {
  const qc = useQueryClient();
  return useMutation({mutationFn: hrmService.cancelLeave, onSuccess: () => qc.invalidateQueries({queryKey: qk.leaves})});
};

export const usePunch = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (kind: "in" | "out") => {
      await kycService.ensureProfile();
      return kind === "in" ? hrmService.punchIn() : hrmService.punchOut();
    },
    onSuccess: () => {
      qc.invalidateQueries({queryKey: qk.attendance});
      qc.invalidateQueries({queryKey: qk.summary});
    },
  });
};
