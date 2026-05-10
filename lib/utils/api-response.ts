import { NextResponse } from "next/server";

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
  meta?: PaginationMeta;
}

interface ApiErrorResponse {
  success: false;
  message: string;
  error: {
    code: string;
    details?: unknown;
  };
}

type ApiResponseType<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Cache-Control options for API responses.
 * On Vercel, `s-maxage` controls the edge CDN cache duration.
 * `stale-while-revalidate` serves stale content while refreshing in background.
 */
export interface CacheOptions {
  /** Browser cache duration (seconds). Default: 0. */
  maxAge?: number;
  /** CDN / Vercel edge cache duration (seconds). */
  sMaxAge?: number;
  /** Serve stale while revalidating (seconds). */
  staleWhileRevalidate?: number;
  /** Private (no CDN cache — for authenticated responses). */
  isPrivate?: boolean;
}

function buildCacheHeader(opts?: CacheOptions): string | undefined {
  if (!opts) return undefined;
  const parts: string[] = [];
  parts.push(opts.isPrivate ? "private" : "public");
  parts.push(`max-age=${opts.maxAge ?? 0}`);
  if (opts.sMaxAge != null) parts.push(`s-maxage=${opts.sMaxAge}`);
  if (opts.staleWhileRevalidate != null) parts.push(`stale-while-revalidate=${opts.staleWhileRevalidate}`);
  return parts.join(", ");
}

export function successResponse<T>(
  data: T,
  message = "Success",
  status = 200,
  meta?: PaginationMeta,
  cache?: CacheOptions
): NextResponse<ApiSuccessResponse<T>> {
  const body: ApiSuccessResponse<T> = {
    success: true,
    message,
    data,
    ...(meta && { meta }),
  };
  const headers: HeadersInit = {};
  const cc = buildCacheHeader(cache);
  if (cc) headers["Cache-Control"] = cc;
  return NextResponse.json(body, { status, headers });
}

export function errorResponse(
  message: string,
  code: string,
  status = 400,
  details?: unknown
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      message,
      error: { code, ...(details !== undefined && { details }) },
    },
    { status }
  );
}

export function paginationMeta(
  page: number,
  limit: number,
  total: number
): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

export type { ApiResponseType, ApiSuccessResponse, ApiErrorResponse, PaginationMeta };
