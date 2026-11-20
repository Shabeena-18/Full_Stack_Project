import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Load data from the API when a component mounts (or `deps` change).
 *
 *   const { data, loading, error, reload } = useApi(() => ordersApi.list(), []);
 *
 * Pass { interval: 10000 } to quietly re-fetch every 10s (used for live
 * order-status updates) without flashing the loading spinner.
 */
export function useApi(fetcher, deps = [], { interval } = {}) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const latestRequest = useRef(0);

  const load = useCallback(async ({ silent = false } = {}) => {
    const requestId = ++latestRequest.current;
    if (!silent) setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await fetcherRef.current();
      if (requestId === latestRequest.current) setState({ data, loading: false, error: null });
    } catch (error) {
      if (requestId !== latestRequest.current) return; // a newer request superseded this one
      // keep showing old data if a background refresh fails
      setState((s) => (silent ? s : { data: null, loading: false, error }));
    }
  }, []);

  useEffect(() => {
    load();
    if (!interval) return undefined;
    const timer = setInterval(() => load({ silent: true }), interval);
    return () => {
      clearInterval(timer);
      latestRequest.current += 1; // ignore responses that arrive after unmount
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load, interval, ...deps]);

  return { ...state, reload: load };
}
