import {apiClient, setTokens} from "./apiClient";

const ROLE = "beautician";

export interface AuthUser {
  id?: string;
  _id?: string;
  name?: string;
  phone: string;
  role: string;
}

interface VerifyOtpResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export const authService = {
  sendOtp: (phone: string) => apiClient.post("/auth/mobile/send-otp", {phone, role: ROLE}),
  resendOtp: (phone: string) => apiClient.post("/auth/mobile/resend-otp", {phone, role: ROLE}),
  verifyOtp: async (phone: string, otp: string) => {
    const res = await apiClient.post<VerifyOtpResponse>("/auth/mobile/verify-otp", {phone, otp, role: ROLE});
    await setTokens({accessToken: res.accessToken, refreshToken: res.refreshToken});
    return res.user;
  },
  me: () => apiClient.get<AuthUser>("/auth/me"),
  logout: async () => {
    await apiClient.post("/auth/logout").catch(() => undefined);
    await setTokens(null);
  },
};
