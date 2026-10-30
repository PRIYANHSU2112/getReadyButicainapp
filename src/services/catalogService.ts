import {apiClient, ApiError} from "./apiClient";

// `status=all` asks the partner endpoints for pending/rejected submissions too, so the
// app can show "Under review" instead of hiding a service the partner just created.
// A 404 means the deployed gateway predates these routes — treat it as "nothing yet".
const emptyOn404 = (p: Promise<any>): Promise<any[]> =>
  p
    .then(r => (Array.isArray(r) ? r : r?.items ?? r?.services ?? r?.packages ?? []))
    .catch(e => {
      if (e instanceof ApiError && e.status === 404) return [];
      throw e;
    });

export const catalogService = {
  getServices: (categoryId?: string) =>
    apiClient.get<any[]>(categoryId ? `/services/public/category/${categoryId}` : "/services/public"),
  // Only the services this beautician created or is eligible for, in any review state.
  getMyServices: (limit = 50) =>
    emptyOn404(apiClient.get<any[]>("/beautician/home/services", {limit, status: "all"})),
  getServiceDetails: (id: string) =>
    apiClient.get<any>(`/services/${id}`),
  // The beautician's own packages — not the public catalog.
  getMyPackages: (limit = 50) =>
    emptyOn404(apiClient.get<any[]>("/beautician/home/packages", {limit, status: "all"})),
  // Catalog only exposes an approved-only detail route; pending packages resolve from
  // the cached my-packages list instead (see usePackage).
  getPackageDetails: (id: string) =>
    apiClient.get<any>(`/packages/public/${id}`),
  createService: (data: unknown) =>
    apiClient.post<any>("/services", data),
  getCategories: () =>
    apiClient.get<any>("/categories/public").then(r => (Array.isArray(r) ? r : r?.items ?? [])),
  // Multipart create — partner submissions go to admin review.
  submitService: (fields: Record<string, string | number | undefined>, thumbnailUri?: string, imageUris: string[] = []) => {
    const form = new FormData();
    Object.entries(fields).forEach(([k, v]) => { if (v !== undefined && v !== "") form.append(k, String(v)); });
    const img = (uri: string, name: string) => ({uri, type: "image/jpeg", name} as any);
    if (thumbnailUri) form.append("thumbnail", img(thumbnailUri, "thumbnail.jpg"));
    imageUris.slice(0, 5).forEach((u, i) => form.append("images", img(u, `image-${i}.jpg`)));
    return apiClient.upload<any>("/services", form);
  },
};
