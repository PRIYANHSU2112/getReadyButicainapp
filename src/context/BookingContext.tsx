import React, {createContext, useCallback, useContext, useMemo, useState, ReactNode} from "react";
import {useQueryClient} from "@tanstack/react-query";
import {Booking, BookingStatus} from "../types";
import {qk, useAssignments, useVerifyEndOtp, useVerifyStartOtp} from "../hooks/queries";
import {toBooking} from "../services/mappers";
import {useAuth} from "./AuthContext";

interface BookingContextType {
  bookings: Booking[];
  activeBooking: Booking | null;
  loading: boolean;
  hasMore: boolean;
  loadMore: () => void;
  acceptBooking: (bookingId: string) => Promise<boolean>;
  rejectBooking: (bookingId: string) => Promise<boolean>;
  updateBookingStatus: (bookingId: string, status: BookingStatus) => Promise<void>;
  verifyStartOtp: (bookingId: string, otp: string) => Promise<boolean>;
  verifyEndOtp: (bookingId: string, otp: string) => Promise<boolean>;
  refreshBookings: () => Promise<void>;
}

const BookingContext = createContext<BookingContextType>({
  bookings: [], activeBooking: null, loading: false, hasMore: false, loadMore: () => {},
  acceptBooking: async () => false, rejectBooking: async () => false,
  updateBookingStatus: async () => {}, verifyStartOtp: async () => false,
  verifyEndOtp: async () => false, refreshBookings: async () => {},
});

const ACTIVE_ORDER: BookingStatus[] = ["in_progress", "reached", "en_route", "assigned"];

export const BookingProvider: React.FC<{children: ReactNode}> = ({children}) => {
  const {isAuthenticated} = useAuth();
  const qc = useQueryClient();
  const assignments = useAssignments(isAuthenticated);
  const startOtp = useVerifyStartOtp();
  const endOtp = useVerifyEndOtp();

  // Local-only overrides: backend has no beautician accept/reject or generic status endpoints.
  const [statusOverrides, setStatusOverrides] = useState<Record<string, BookingStatus>>({});
  const [hidden, setHidden] = useState<Set<string>>(() => new Set());
  const [activeId, setActiveId] = useState<string | null>(null);

  const bookings = useMemo(
    () =>
      (assignments.data ?? [])
        .map(toBooking)
        .filter(b => !hidden.has(b.id))
        .map(b => (statusOverrides[b.id] ? {...b, status: statusOverrides[b.id]} : b)),
    [assignments.data, hidden, statusOverrides],
  );

  const activeBooking = useMemo(() => {
    if (activeId) return bookings.find(b => b.id === activeId) ?? null;
    for (const s of ACTIVE_ORDER) {
      const found = bookings.find(b => b.status === s);
      if (found) return found;
    }
    return null;
  }, [activeId, bookings]);

  const acceptBooking = useCallback(async (id: string) => { setActiveId(id); return true; }, []);

  const rejectBooking = useCallback(async (id: string) => {
    setHidden(prev => new Set(prev).add(id));
    setActiveId(prev => (prev === id ? null : prev));
    return true;
  }, []);

  const updateBookingStatus = useCallback(async (id: string, status: BookingStatus) => {
    setStatusOverrides(prev => ({...prev, [id]: status}));
  }, []);

  const verifyStartOtp = useCallback(async (id: string, otp: string) => {
    try {
      await startOtp.mutateAsync({id, otp});
      setStatusOverrides(prev => ({...prev, [id]: "in_progress"}));
      return true;
    } catch { return false; }
  }, [startOtp]);

  const verifyEndOtp = useCallback(async (id: string, otp: string) => {
    try {
      await endOtp.mutateAsync({id, otp});
      setStatusOverrides(prev => ({...prev, [id]: "completed"}));
      return true;
    } catch { return false; }
  }, [endOtp]);

  const refreshBookings = useCallback(async () => {
    setStatusOverrides({});
    await qc.invalidateQueries({queryKey: qk.assignments});
  }, [qc]);

  const {fetchNextPage, hasNextPage, isFetchingNextPage} = assignments;
  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const value = useMemo(
    () => ({
      bookings, activeBooking,
      loading: assignments.isLoading || startOtp.isPending || endOtp.isPending,
      hasMore: !!hasNextPage, loadMore,
      acceptBooking, rejectBooking, updateBookingStatus, verifyStartOtp, verifyEndOtp, refreshBookings,
    }),
    [bookings, activeBooking, assignments.isLoading, startOtp.isPending, endOtp.isPending, hasNextPage, loadMore,
      acceptBooking, rejectBooking, updateBookingStatus, verifyStartOtp, verifyEndOtp, refreshBookings],
  );
  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
};

export const useBooking = () => {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used within BookingProvider");
  return ctx;
};
