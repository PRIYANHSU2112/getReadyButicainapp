import {apiClient} from "./apiClient";

export interface Slot {
  _id: string;
  date: string; // YYYY-MM-DD
  startAt: string;
  endAt: string;
  status: "ACTIVE" | "BLOCKED" | "CANCELLED" | "COMPLETED";
  bookedCount: number;
  maxBookings: number;
}

export const slotService = {
  list: (beauticianId: string, date: string) =>
    apiClient.paginated<Slot>("/slots", {beauticianId, date, limit: 100}),
  // Generates hourly slots for a working day.
  openDay: (beauticianId: string, date: string, startHour = 9, endHour = 19, slotDurationMinutes = 60) =>
    apiClient.post<any>("/slots/bulk", {beauticianId, date, startHour, endHour, slotDurationMinutes}),
  setStatus: (id: string, status: "ACTIVE" | "BLOCKED") => apiClient.patch<any>(`/slots/${id}`, {status}),
  remove: (id: string) => apiClient.delete<any>(`/slots/${id}`),
};

export const bookingService = {
  getMyAssignments: (page = 1, limit = 10) =>
    apiClient.paginated<any>("/bookings/beautician/my-assignments", {page, limit}),
  getUpcoming: (limit = 2) => apiClient.get<any[]>("/beautician/home/upcoming-bookings", {limit}),
  getBookingDetails: (bookingId: string) => apiClient.get<any>(`/bookings/${bookingId}`),
  verifyStartOtp: (bookingId: string, otp: string) =>
    apiClient.post<any>(`/bookings/${bookingId}/start-otp/verify`, {otp}),
  verifyEndOtp: (bookingId: string, otp: string) =>
    apiClient.post<any>(`/bookings/${bookingId}/end-otp/verify`, {otp}),
  completeItem: (bookingId: string, itemId: string, notes?: string) =>
    apiClient.post<any>(`/bookings/${bookingId}/items/${itemId}/complete`, {notes}),
  complete: (bookingId: string) => apiClient.post<any>(`/bookings/${bookingId}/complete`),
  // Mid-visit extras: the customer approves in their app; prices come from the catalog on the server.
  proposeAddOns: (bookingId: string, serviceIds: string[]) =>
    apiClient.post<any>(`/bookings/${bookingId}/add-ons`, {serviceIds}),
  // Customer paid the add-on amount in cash; unlocks the End OTP.
  addOnCashCollected: (bookingId: string) => apiClient.post<any>(`/bookings/${bookingId}/add-ons/cash-collected`),
  cancel: (bookingId: string, reason: string) => apiClient.post<any>(`/bookings/${bookingId}/cancel`, {reason}),
};
