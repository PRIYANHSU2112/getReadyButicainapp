import {apiClient, ApiError} from "./apiClient";
import {DutyStatus} from "../types";

export interface HomeSummary {
  todayEarnings: number;
  monthlyEarnings: number;
  todayBookingsCount: number;
  completedBookingsToday: number;
  pendingBookingsToday: number;
  rating?: number;
  ratingCount?: number;
  // Lifetime completed jobs and the server-computed 0-100 partner score.
  completedBookingsTotal?: number;
  performanceScore?: number;
  isOnline?: boolean;
  dutyStatus?: DutyStatus;
}

export interface UserUpdate {
  name?: string;
  email?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  dob?: string; // ISO
  languages?: string[];
}

export interface AddressInput {
  addressLine1: string;
  city: string;
  state: string;
  pincode: string;
  location?: {type: "Point"; coordinates: [number, number]}; // [lng, lat]
}

// Personal details + home address live in user-service (beautician profile PATCH strips them).
export const userService = {
  updateMe: (data: UserUpdate) => apiClient.patch<any>("/users/me", data),
  listAddresses: () => apiClient.get<any>("/addresses").then(r => (Array.isArray(r) ? r : r?.items ?? [])),
  // Updates the default address if one exists, otherwise creates it as default.
  saveHomeAddress: async (a: AddressInput) => {
    const list: any[] = await userService.listAddresses();
    const existing = list.find(x => x.isDefault) ?? list[0];
    const id = existing?._id ?? existing?.id;
    return id
      ? apiClient.patch<any>(`/addresses/${id}`, a)
      : apiClient.post<any>("/addresses", {...a, label: "HOME", isDefault: true});
  },
};

export const toApiGender = (g?: string) => {
  const v = (g ?? "").toLowerCase();
  return v.startsWith("f") ? "FEMALE" : v.startsWith("m") ? "MALE" : v ? "OTHER" : undefined;
};

export const homeService = {
  getSummary: () => apiClient.get<HomeSummary>("/beautician/home/summary"),
  getServices: (limit = 4) => apiClient.get<any[]>("/beautician/home/services", {limit}),
  setDuty: (dutyStatus: DutyStatus) =>
    apiClient.patch<any>("/beautician/home/duty", {dutyStatus, isAvailable: dutyStatus === "online"}),
};

export interface PayoutConfig {
  minWithdrawalAmount: number;
  maxWithdrawalAmount: number;
  dailyWithdrawalLimit?: number;
  allowUpiPayout?: boolean;
}

export interface PayoutRequest {
  amount: number;
  payoutType?: "BANK_ACCOUNT" | "UPI";
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  upiId?: string;
  accountHolderName?: string;
}

// The gateway historically shadowed /beautician/wallet with /beautician, so some
// deployments only serve the /wallet/beautician alias. Try both, remember the winner.
const WALLET_BASES = ["/beautician/wallet", "/wallet/beautician"] as const;
let walletBase: string | null = null;

async function walletCall<T>(run: (base: string) => Promise<T>): Promise<T> {
  if (walletBase) return run(walletBase);
  let lastErr: unknown;
  for (const base of WALLET_BASES) {
    try {
      const res = await run(base);
      walletBase = base;
      return res;
    } catch (e) {
      lastErr = e;
      // Only fall through on "route missing"/timeout; real errors must surface.
      const status = e instanceof ApiError ? e.status : -1;
      if (status !== 404 && status !== 0) throw e;
    }
  }
  throw lastErr;
}

export const walletService = {
  getDashboard: () => walletCall(b => apiClient.get<any>(`${b}/dashboard`)),
  getTransactions: (page = 1, limit = 15, type: "all" | "credit" | "debit" = "all") =>
    walletCall(b => apiClient.paginated<any>(`${b}/transactions`, {page, limit, type})),
  getTransaction: (id: string) => walletCall(b => apiClient.get<any>(`${b}/transactions/${id}`)),
  getPayoutConfig: () => walletCall(b => apiClient.get<PayoutConfig>(`${b}/payout-config`)),
  requestPayout: (payload: PayoutRequest) => walletCall(b => apiClient.post<any>(`${b}/payout-request`, payload)),
};

export const notificationService = {
  list: (page = 1, limit = 20) => apiClient.paginated<any>("/notifications", {page, limit}),
  markRead: (id: string) => apiClient.patch<any>(`/notifications/${id}/read`),
  remove: (id: string) => apiClient.delete<any>(`/notifications/${id}`),
};

export type LeaveType = "CL" | "SL" | "PL" | "EMERGENCY";
export type LeaveStatusApi = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export interface LeavePayload {
  leaveType: LeaveType;
  duration: "FULL_DAY" | "HALF_DAY";
  startDate: string; // ISO
  endDate: string; // ISO
  reason: string;
  attachmentUri?: string;
}

type ListResult<T> = {items: T[]; total: number};
const items = <T,>(r: ListResult<T> | T[] | undefined): T[] => (Array.isArray(r) ? r : r?.items ?? []);

// HRM reads 404 with "Beautician profile not found" until onboarding creates the
// profile. For lists that is simply "nothing yet", not an error worth alerting on.
const emptyOn404 = <T,>(p: Promise<T[]>): Promise<T[]> =>
  p.catch(e => {
    if (e instanceof ApiError && e.status === 404) return [];
    throw e;
  });

export const hrmService = {
  punchIn: () => apiClient.post<any>("/hrm/attendance/punch-in"),
  punchOut: () => apiClient.post<any>("/hrm/attendance/punch-out"),
  getAttendance: (month: number, year: number) =>
    emptyOn404(apiClient.get<ListResult<any>>("/hrm/attendance/me", {month, year, limit: 31}).then(items)),
  applyLeave: ({attachmentUri, ...data}: LeavePayload) => {
    if (!attachmentUri) return apiClient.post<any>("/hrm/leaves", data);
    const form = new FormData();
    Object.entries(data).forEach(([k, v]) => form.append(k, String(v)));
    form.append("attachment", {uri: attachmentUri, type: "image/jpeg", name: "leave-attachment.jpg"} as any);
    return apiClient.upload<any>("/hrm/leaves", form);
  },
  getLeaves: (status?: LeaveStatusApi) =>
    emptyOn404(apiClient.get<ListResult<any>>("/hrm/leaves/me", {status, limit: 50}).then(items)),
  cancelLeave: (id: string) => apiClient.delete<any>(`/hrm/leaves/${id}`),
  getPayslips: () => emptyOn404(apiClient.get<ListResult<any>>("/hrm/payslips/me", {limit: 12}).then(items)),
};
