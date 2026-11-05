import React, {createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode} from "react";
import {PartnerProfile} from "../types";
import {authService} from "../services/authService";
import {kycService} from "../services/kycService";
import {ApiError, restoreTokens, setSessionExpiredHandler} from "../services/apiClient";
import {queryClient} from "../services/queryClient";
import {toPartner} from "../services/mappers";

interface AuthContextType {
  isAuthenticated: boolean;
  isRestoring: boolean;
  partner: PartnerProfile | null;
  phoneNumber: string;
  setPhoneNumber: (phone: string) => void;
  loginWithPhone: (phone: string) => Promise<boolean>;
  resendOtp: (phoneOverride?: string) => Promise<void>;
  verifyOtp: (otp: string, phoneOverride?: string) => Promise<boolean>;
  logout: () => void;
  updatePartner: (updated: Partial<PartnerProfile>) => void;
  reloadPartner: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false, isRestoring: true, partner: null, phoneNumber: "",
  setPhoneNumber: () => {}, loginWithPhone: async () => false, resendOtp: async () => {},
  verifyOtp: async () => false, logout: () => {}, updatePartner: () => {}, reloadPartner: async () => {},
});

// A missing beautician profile (404) is valid before onboarding — treat as KYC pending.
const loadProfile = async () => {
  const [user, profile] = await Promise.all([
    authService.me(),
    kycService.getProfile().catch(e => {
      if (e instanceof ApiError && e.status === 404) return null;
      throw e;
    }),
  ]);
  queryClient.setQueryData(["profile"], profile);
  return toPartner(profile, user);
};

export const AuthProvider: React.FC<{children: ReactNode}> = ({children}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isRestoring, setIsRestoring] = useState(true);
  const [partner, setPartner] = useState<PartnerProfile | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");

  const clearSession = useCallback(() => {
    setIsAuthenticated(false);
    setPartner(null);
    queryClient.clear();
  }, []);

  // Restore session from keychain on cold start.
  useEffect(() => {
    setSessionExpiredHandler(clearSession);
    (async () => {
      try {
        if (await restoreTokens()) {
          setPartner(await loadProfile());
          setIsAuthenticated(true);
        }
      } catch {
        clearSession();
      } finally {
        setIsRestoring(false);
      }
    })();
  }, [clearSession]);

  const loginWithPhone = useCallback(async (phone: string) => {
    setPhoneNumber(phone);
    await authService.sendOtp(phone);
    return true;
  }, []);

  const resendOtp = useCallback(async (phoneOverride?: string) => {
    const phone = (phoneOverride || phoneNumber || "").trim();
    await authService.resendOtp(phone);
  }, [phoneNumber]);

  const verifyOtp = useCallback(async (otp: string, phoneOverride?: string) => {
    const phone = (phoneOverride || phoneNumber || "").trim();
    await authService.verifyOtp(phone, otp);
    setPartner(await loadProfile());
    setIsAuthenticated(true);
    return true;
  }, [phoneNumber]);

  const logout = useCallback(() => {
    authService.logout().finally(clearSession);
  }, [clearSession]);

  const updatePartner = useCallback((updated: Partial<PartnerProfile>) => {
    setPartner(prev => (prev ? {...prev, ...updated} : prev));
  }, []);

  const reloadPartner = useCallback(async () => { setPartner(await loadProfile()); }, []);

  const value = useMemo(
    () => ({isAuthenticated, isRestoring, partner, phoneNumber, setPhoneNumber, loginWithPhone, resendOtp, verifyOtp, logout, updatePartner, reloadPartner}),
    [isAuthenticated, isRestoring, partner, phoneNumber, loginWithPhone, resendOtp, verifyOtp, logout, updatePartner, reloadPartner],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
