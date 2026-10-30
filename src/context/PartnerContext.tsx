import React, {createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, ReactNode} from "react";
import {DutyStatus, Booking} from "../types";
import {useAuth} from "./AuthContext";
import {useSetDuty} from "../hooks/queries";
import {toast} from "../components/common/Toast";

interface PartnerContextType {
  dutyStatus: DutyStatus;
  dutyUpdating: boolean;
  setDutyStatus: (status: DutyStatus) => void;
  toggleDuty: () => void;
  activeBooking: Booking | null;
  setActiveBooking: (booking: Booking | null) => void;
  incomingJob: Booking | null;
  setIncomingJob: (booking: Booking | null) => void;
}

const PartnerContext = createContext<PartnerContextType>({
  dutyStatus: "offline", dutyUpdating: false, setDutyStatus: () => {}, toggleDuty: () => {},
  activeBooking: null, setActiveBooking: () => {},
  incomingJob: null, setIncomingJob: () => {},
});

export const PartnerProvider: React.FC<{children: ReactNode}> = ({children}) => {
  const {partner} = useAuth();
  const [dutyStatus, setLocalDuty] = useState<DutyStatus>(partner?.dutyStatus ?? "offline");
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [incomingJob, setIncomingJob] = useState<Booking | null>(null);
  const setDuty = useSetDuty();

  useEffect(() => { if (partner) setLocalDuty(partner.dutyStatus); }, [partner]);

  const dutyRef = useRef(dutyStatus);
  dutyRef.current = dutyStatus;
  const {mutate, isPending} = setDuty;

  // Optimistic update; revert if the server rejects it.
  const setDutyStatus = useCallback((next: DutyStatus) => {
    const prev = dutyRef.current;
    if (prev === next) return;
    setLocalDuty(next);
    mutate(next, {
      onSuccess: () => toast.success(next === "online" ? "You are now on duty" : "You are now off duty"),
      onError: () => setLocalDuty(prev),
    });
  }, [mutate]);

  const toggleDuty = useCallback(
    () => setDutyStatus(dutyRef.current === "online" ? "offline" : "online"),
    [setDutyStatus],
  );

  const value = useMemo(
    () => ({dutyStatus, dutyUpdating: isPending, setDutyStatus, toggleDuty, activeBooking, setActiveBooking, incomingJob, setIncomingJob}),
    [dutyStatus, isPending, setDutyStatus, toggleDuty, activeBooking, incomingJob],
  );
  return <PartnerContext.Provider value={value}>{children}</PartnerContext.Provider>;
};

export const usePartner = () => {
  const ctx = useContext(PartnerContext);
  if (!ctx) throw new Error("usePartner must be used within PartnerProvider");
  return ctx;
};
