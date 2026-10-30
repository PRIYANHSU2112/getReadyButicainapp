import {useQuery} from "@tanstack/react-query";

// RBI format: 4 letters (bank) + "0" + 6 alphanumerics (branch). e.g. SBIN0001234
export const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;
export const IFSC_PLACEHOLDER = "Eg. SBIN0001234";

// Uppercase, drop spaces/symbols, cap at 11 chars — use in onChangeText.
export const normalizeIfsc = (v: string) => v.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 11);

export const isValidIfsc = (v: string) => IFSC_REGEX.test(v);

// Returns an error message, or "" when valid.
export const ifscError = (v: string): string => {
  if (!v) return "IFSC code is required";
  if (v.length < 11) return "IFSC code must be 11 characters";
  if (!/^[A-Z]{4}/.test(v)) return "First 4 characters must be letters (bank code)";
  if (v[4] !== "0") return "5th character must be 0 (zero)";
  if (!isValidIfsc(v)) return "Last 6 characters must be letters or digits";
  return "";
};

export interface IfscInfo {
  BANK: string;
  BRANCH: string;
  CITY?: string;
  STATE?: string;
}

// Public Razorpay IFSC directory (no key). Only fires for well-formed codes; cached for a day.
export const useIfscLookup = (ifsc: string) =>
  useQuery({
    queryKey: ["ifsc", ifsc],
    enabled: isValidIfsc(ifsc),
    staleTime: 24 * 60 * 60_000,
    retry: false,
    queryFn: async (): Promise<IfscInfo | null> => {
      const res = await fetch(`https://ifsc.razorpay.com/${ifsc}`);
      if (res.status === 404) return null; // well-formed but unknown branch
      if (!res.ok) throw new Error("IFSC lookup unavailable");
      return res.json();
    },
  });
