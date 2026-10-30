import {apiClient} from "./apiClient";

export type PolicyType = "privacy" | "terms" | "refund" | "cancellation";

export interface CompanyInfo {
  legalName?: string;
  brandName?: string;
  supportEmail?: string;
  supportPhone?: string;
  whatsappNumber?: string;
  workingHours?: string;
  cin?: string;
  gstin?: string;
  registeredAddress?: {street?: string; city?: string; state?: string; postalCode?: string; country?: string};
}

export interface Faq {
  _id: string;
  question: string;
  answer: string;
  category?: string;
}

export interface TicketPayload {
  subject: string;
  description: string;
  category?: string;
  userName?: string;
  userPhone?: string;
  userId?: string;
}

const list = <T,>(r: any): T[] => (Array.isArray(r) ? r : r?.items ?? []);

export const contentService = {
  getPolicy: (type: PolicyType) =>
    apiClient.get<{type: string; policy: string}>(`/company/policies/${type}`),
  getCompany: () => apiClient.get<CompanyInfo>("/company"),
  getFaqs: () => apiClient.get<any>("/faq").then(list<Faq>),
  // NOTE: no list helper — GET /support returns every user's tickets (no userId
  // filter server-side), so the app must not read it. See backend TODO.
  createTicket: (data: TicketPayload) => apiClient.post<any>("/support", {category: "General", ...data}),
};
