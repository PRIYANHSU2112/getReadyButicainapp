import {useEffect, useRef} from "react";
import {AppState, AppStateStatus} from "react-native";
import {focusManager, useQueryClient} from "@tanstack/react-query";
import {useAuth} from "../../context/AuthContext";
import {usePartner} from "../../context/PartnerContext";
import {qk} from "../../hooks/queries";
import {toast} from "./Toast";

const BOOKINGS_MS = 20_000;
const NOTIFICATIONS_MS = 30_000;

// Wire React Query's focus refetch to RN AppState (refresh when app returns to foreground).
focusManager.setEventListener(handleFocus => {
  const sub = AppState.addEventListener("change", (s: AppStateStatus) => handleFocus(s === "active"));
  return () => sub.remove();
});

const idsOf = (data: any): string[] =>
  (data?.pages ?? []).flatMap((p: any) => p.items ?? []).map((x: any) => String(x?._id ?? x?.id));

/**
 * Near-real-time sync. Backend has no websocket/push yet, so this polls only while the
 * app is in the foreground (and bookings only while on duty), and alerts on new items.
 */
export const LiveSync = () => {
  const {isAuthenticated} = useAuth();
  const {dutyStatus} = usePartner();
  const qc = useQueryClient();
  const seenBookings = useRef<Set<string> | null>(null);
  const seenNotifs = useRef<Set<string> | null>(null);
  const appActive = useRef(AppState.currentState === "active");

  useEffect(() => {
    const sub = AppState.addEventListener("change", s => { appActive.current = s === "active"; });
    return () => sub.remove();
  }, []);

  // Alert on newly arrived bookings / notifications (first load only seeds the baseline).
  useEffect(() => {
    if (!isAuthenticated) {
      seenBookings.current = null;
      seenNotifs.current = null;
      return;
    }
    return qc.getQueryCache().subscribe(evt => {
      if (evt.type !== "updated" || evt.action.type !== "success") return;
      const key = evt.query.queryKey;
      const isBookings = key[0] === qk.assignments[0] && key[1] === qk.assignments[1];
      const isNotifs = key[0] === qk.notifications[0];
      if (!isBookings && !isNotifs) return;

      const ids = idsOf(evt.query.state.data);
      const ref = isBookings ? seenBookings : seenNotifs;
      if (ref.current) {
        const fresh = ids.filter(id => !ref.current!.has(id)).length;
        if (fresh > 0) {
          if (isBookings) toast.info(fresh === 1 ? "New booking assigned to you" : `${fresh} new bookings assigned`);
          else toast.info(fresh === 1 ? "You have a new notification" : `${fresh} new notifications`);
          if (isBookings) qc.invalidateQueries({queryKey: qk.upcoming});
        }
      }
      ref.current = new Set([...(ref.current ?? []), ...ids]);
    });
  }, [isAuthenticated, qc]);

  // Poll while foregrounded. Bookings only when on duty to save battery/data.
  useEffect(() => {
    if (!isAuthenticated) return;
    const tick = (keys: readonly unknown[][]) => () => {
      if (appActive.current) keys.forEach(k => qc.invalidateQueries({queryKey: k}));
    };
    const timers = [setInterval(tick([[...qk.notifications]]), NOTIFICATIONS_MS)];
    if (dutyStatus === "online") {
      timers.push(setInterval(tick([[...qk.assignments], [...qk.summary]]), BOOKINGS_MS));
    }
    return () => timers.forEach(clearInterval);
  }, [isAuthenticated, dutyStatus, qc]);

  return null;
};
