import {MutationCache, QueryCache, QueryClient} from "@tanstack/react-query";
import {ApiError} from "./apiClient";
import {toast} from "../components/common/Toast";

const shouldRetry = (count: number, err: unknown) =>
  count < 1 && !(err instanceof ApiError && err.status >= 400 && err.status < 500);

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    // Only surface background errors when there is no cached data to fall back on.
    onError: (err, query) => {
      if (query.state.data === undefined && (err as ApiError).code !== "SESSION_EXPIRED") toast.error((err as Error).message);
    },
  }),
  mutationCache: new MutationCache({
    onError: err => { if ((err as ApiError).code !== "SESSION_EXPIRED") toast.error((err as Error).message); },
  }),
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 10 * 60_000,
      retry: shouldRetry,
      refetchOnWindowFocus: false,
    },
    mutations: {retry: false},
  },
});
