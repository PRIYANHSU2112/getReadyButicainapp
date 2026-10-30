import {apiClient, ApiError} from "./apiClient";

const imagePart = (uri: string, name: string) => ({uri, type: "image/jpeg", name} as any);
const filePart = (uri: string, name = "document.jpg") => {
  const ext = uri.split(".").pop()?.toLowerCase() ?? "jpg";
  return {uri, type: ext === "pdf" ? "application/pdf" : `image/${ext === "png" ? "png" : "jpeg"}`, name} as any;
};

export type KycFileField = "idCardFront" | "idCardBack" | "selfieWithId" | "profilePhoto";

export interface WorkHistoryPayload {
  companyName: string;
  role: string;
  startDate: string; // ISO
  endDate?: string | null;
  isCurrent?: boolean;
  description?: string;
}

export interface CertificatePayload {
  title: string;
  issuingOrganization: string;
  issueDate: string; // ISO
  fileUri?: string;
}

export interface BankPayload {
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName?: string;
  upiId?: string;
  passbookUri?: string;
}

const toForm = (fields: Record<string, string | undefined | null>, file?: {key: string; uri?: string}) => {
  const form = new FormData();
  Object.entries(fields).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== "") form.append(k, v); });
  if (file?.uri) form.append(file.key, filePart(file.uri));
  return form;
};

export const kycService = {
  getProfile: () => apiClient.get<any>("/beautician/me"),
  createProfile: (data: unknown = {}) => apiClient.post<any>("/beautician", data),
  // Backend only persists bio / experienceYears / skills on self-update.
  updateProfile: (data: {bio?: string; experienceYears?: number; skills?: string[]}) =>
    apiClient.patch<any>("/beautician/me", data),
  // Creates the beautician profile on first KYC step if it doesn't exist yet.
  ensureProfile: async () => {
    try {
      return await apiClient.get<any>("/beautician/me");
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) return apiClient.post<any>("/beautician", {});
      throw e;
    }
  },
  submitForReview: () => apiClient.post<any>("/beautician/me/submit"),

  // Multipart upload of any KYC images in one request.
  uploadKycFiles: (files: Partial<Record<KycFileField, string>>) => {
    const form = new FormData();
    (Object.keys(files) as KycFileField[]).forEach(k => {
      const uri = files[k];
      if (uri) form.append(k, imagePart(uri, `${k}.jpg`));
    });
    return apiClient.upload<any>("/beautician/me/selfie", form);
  },
  uploadSelfie: (uri: string) => kycService.uploadKycFiles({selfieWithId: uri}),

  getWorkHistory: () => apiClient.get<any[]>("/beautician/me/work-history"),
  addWorkHistory: (data: WorkHistoryPayload) => apiClient.post<any>("/beautician/me/work-history", data),
  updateWorkHistory: (id: string, data: Partial<WorkHistoryPayload>) => apiClient.patch<any>(`/beautician/me/work-history/${id}`, data),
  deleteWorkHistory: (id: string) => apiClient.delete<any>(`/beautician/me/work-history/${id}`),

  getCertificates: () => apiClient.get<any[]>("/beautician/me/certificates"),
  addCertificate: ({fileUri, ...fields}: CertificatePayload) =>
    apiClient.upload<any>("/beautician/me/certificates", toForm({...fields}, {key: "file", uri: fileUri})),
  deleteCertificate: (id: string) => apiClient.delete<any>(`/beautician/me/certificates/${id}`),

  getBankDetails: () => apiClient.get<any>("/bank-details/me"),
  saveBankDetails: ({passbookUri, ...fields}: BankPayload) =>
    apiClient.putForm<any>("/bank-details/me", toForm({...fields}, {key: "file", uri: passbookUri})),
};
