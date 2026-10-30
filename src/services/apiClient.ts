import { AuthTokens, tokenStorage } from "./tokenStorage";

export const BASE_URL = "https://api.ready.deepent.in/api/v1";
const TIMEOUT_MS = 20000;

export class ApiError extends Error {
  constructor(message: string, public status: number, public code?: string) {
    super(message);
    this.name = "ApiError";
  }
}

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  items: T[];
  meta: PageMeta;
}

let tokens: AuthTokens | null = null;
let onSessionExpired: (() => void) | null = null;
let refreshInFlight: Promise<boolean> | null = null;

export const setTokens = async (next: AuthTokens | null) => {
  tokens = next;
  if (next) await tokenStorage.save(next);
  else await tokenStorage.clear();
};
export const restoreTokens = async () => {
  tokens = await tokenStorage.load();
  return tokens;
};
export const setSessionExpiredHandler = (fn: () => void) => { onSessionExpired = fn; };

// Single shared refresh so parallel 401s don't trigger multiple refresh calls.
const refreshTokens = (): Promise<boolean> => {
  if (!tokens?.refreshToken) return Promise.resolve(false);
  refreshInFlight ??= fetch(`${BASE_URL}/auth/refresh-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: tokens.refreshToken }),
  })
    .then(async res => {
      if (!res.ok) return false;
      const json = await res.json();
      const data = json?.data ?? json;
      await setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken ?? tokens!.refreshToken });
      return true;
    })
    .catch(() => false)
    .finally(() => { refreshInFlight = null; });
  return refreshInFlight;
};

type Query = Record<string, string | number | boolean | undefined | null>;

const buildUrl = (endpoint: string, query?: Query) => {
  const qs = query
    ? Object.entries(query)
      .filter(([, v]) => v !== undefined && v !== null && v !== "")
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
      .join("&")
    : "";
  return `${BASE_URL}${endpoint}${qs ? `?${qs}` : ""}`;
};

async function rawRequest(method: string, endpoint: string, body?: unknown, query?: Query, retried = false): Promise<any> {
  const isForm = typeof FormData !== "undefined" && body instanceof FormData;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(buildUrl(endpoint, query), {
      method,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        ...(isForm ? {} : { "Content-Type": "application/json" }),
        ...(tokens?.accessToken ? { Authorization: `Bearer ${tokens.accessToken}` } : {}),
      },
      ...(body !== undefined ? { body: isForm ? (body as FormData) : JSON.stringify(body) } : {}),
    });
  } catch (e: any) {
    throw new ApiError(e?.name === "AbortError" ? "Request timed out. Please try again." : "No internet connection.", 0, "NETWORK");
  } finally {
    clearTimeout(timer);
  }

  if (res.status === 401 && !retried && !endpoint.startsWith("/auth/")) {
    if (await refreshTokens()) return rawRequest(method, endpoint, body, query, true);
    await setTokens(null);
    onSessionExpired?.();
    throw new ApiError("Session expired. Please log in again.", 401, "SESSION_EXPIRED");
  }

  const text = await res.text();
  let json: any = null;
  try { json = text ? JSON.parse(text) : null; } catch { /* non-JSON body */ }

  if (!res.ok || json?.success === false) {
    // Backend shape: { success:false, error:{ code, message, details:[{field,message}] } }
    const err = json?.error ?? json;
    const detail = Array.isArray(err?.details) && err.details[0]?.message;
    const message =
      res.status === 429
        ? err?.message ?? "Too many requests. Please wait a moment and try again."
        : detail || err?.message || `Request failed (${res.status})`;
    throw new ApiError(message, res.status, err?.code ?? json?.errorCode);
  }
  return json;
}

const unwrap = <T>(json: any): T => (json?.data ?? json) as T;

export const apiClient = {
  get: <T>(endpoint: string, query?: Query) => rawRequest("GET", endpoint, undefined, query).then(unwrap<T>),
  post: <T>(endpoint: string, body: unknown = {}) => rawRequest("POST", endpoint, body).then(unwrap<T>),
  patch: <T>(endpoint: string, body: unknown = {}) => rawRequest("PATCH", endpoint, body).then(unwrap<T>),
  put: <T>(endpoint: string, body: unknown = {}) => rawRequest("PUT", endpoint, body).then(unwrap<T>),
  delete: <T>(endpoint: string) => rawRequest("DELETE", endpoint).then(unwrap<T>),
  upload: <T>(endpoint: string, form: FormData) => rawRequest("POST", endpoint, form).then(unwrap<T>),
  putForm: <T>(endpoint: string, form: FormData) => rawRequest("PUT", endpoint, form).then(unwrap<T>),
  // Normalizes the backend's list shapes:
  //   ApiResponse.paginated → { data: [], meta }
  //   service-built pages   → { data: { items | transactions | notifications: [], page, totalPages, total } }
  paginated: async <T>(endpoint: string, query?: Query): Promise<Paginated<T>> => {
    const json = await rawRequest("GET", endpoint, undefined, query);
    const d = json?.data;
    const items: T[] = Array.isArray(d) ? d : d?.items ?? d?.transactions ?? d?.notifications ?? [];
    const meta: PageMeta = json?.meta ?? d?.meta ?? {
      page: Number(d?.page ?? query?.page ?? 1),
      limit: Number(d?.limit ?? items.length),
      total: Number(d?.total ?? items.length),
      totalPages: Number(d?.totalPages ?? 1),
    };
    return { items, meta };
  },
};
