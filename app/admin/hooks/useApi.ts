"use client";

import { useCallback, useEffect, useState } from "react";
import { get } from "@/lib/admin/api";

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T>(url: string | null) {
  const [state, setState] = useState<ApiState<T>>({ data: null, loading: !!url, error: null });

  const refetch = useCallback(() => {
    if (!url) return;
    setState((s) => ({ ...s, loading: true, error: null }));
    get<{ data: T }>(url)
      .then((res) => setState({ data: res.data, loading: false, error: null }))
      .catch((err: Error) => {
        if (err.name === 'AbortError') return;
        setState({ data: null, loading: false, error: err.message });
      });
  }, [url]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { ...state, refetch };
}

export function useApiList<T>(baseUrl: string, params?: Record<string, string>) {
  const qs = params ? "?" + new URLSearchParams(params).toString() : "";
  const [state, setState] = useState<{
    data: T[];
    loading: boolean;
    error: string | null;
    meta: { page: number; limit: number; total: number; totalPages: number } | null;
  }>({ data: [], loading: true, error: null, meta: null });

  const refetch = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: null }));
    get<{ data: T[]; meta?: { page: number; limit: number; total: number; totalPages: number } }>(`${baseUrl}${qs}`)
      .then((res) => setState({ data: res.data, loading: false, error: null, meta: res.meta ?? null }))
      .catch((err: Error) => {
        if (err.name === 'AbortError') return;
        setState({ data: [], loading: false, error: err.message, meta: null });
      });
  }, [baseUrl, qs]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { ...state, refetch };
}
