// Compatibility shim: delegates to TZ SDK scoped client for admin routes.
import { TZ } from '@/lib/tz';

// Create a scoped client for admin API routes (no path prefix, staff auth scope)
function getClient() {
  return TZ.client.scoped('', 'staff', false);
}

export async function get<T>(path: string): Promise<T> {
  return getClient().get<T>(path);
}

export async function post<T>(path: string, body?: unknown): Promise<T> {
  return getClient().post<T>(path, body);
}

export async function patch<T>(path: string, body?: unknown): Promise<T> {
  return getClient().patch<T>(path, body);
}

export async function del<T>(path: string): Promise<T> {
  return getClient().del<T>(path);
}

export async function uploadFormData<T>(path: string, formData: FormData): Promise<T> {
  return getClient().upload<T>(path, formData);
}
