/**
 * Mock authentication layer.
 *
 * Known credentials:
 *   Admin:  phone "9999000001" / password "Admin@1234"  (role: admin)
 *   Super:  phone "9999000002" / password "Staff@1234"  (role: super_admin)
 *   User:   phone "9876543210" / password "User@1234"   (role: customer)
 */

import { getAll, query, create, update, getById } from "./db";

// ── Types ───────────────────────────────────────────────────────────────────

interface MockUser {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  password: string;
  role: string;
  avatarUrl: string | null;
  isGuest: boolean;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  referralCode: string | null;
  orgId: string;
  createdAt: string;
}

function toProfile(u: MockUser) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    avatarUrl: u.avatarUrl,
    isGuest: u.isGuest,
    isPhoneVerified: u.isPhoneVerified,
    isEmailVerified: u.isEmailVerified,
    referralCode: u.referralCode,
    role: u.role,
    createdAt: u.createdAt,
  };
}

function toAuthUser(u: MockUser) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    orgId: u.orgId,
    isGuest: u.isGuest,
    role: u.role,
  };
}

function fakeTokens(userId: string) {
  return {
    accessToken: `mock-access-${userId}-${Date.now()}`,
    refreshToken: `mock-refresh-${userId}-${Date.now()}`,
  };
}

// ── Auth handlers ───────────────────────────────────────────────────────────

export async function mockLogin(phone: string, password: string) {
  const users = await query<MockUser>("users", "by_phone", phone);
  const user = users[0];
  if (!user || user.password !== password) {
    const err = new Error("Invalid phone number or password") as Error & { status: number };
    err.status = 401;
    throw err;
  }
  const tokens = fakeTokens(user.id);
  return { ...tokens, user: toAuthUser(user) };
}

export async function mockRegister(data: {
  name: string;
  phone: string;
  password: string;
  email?: string;
}) {
  // Check if phone already exists
  const existing = await query<MockUser>("users", "by_phone", data.phone);
  if (existing.length > 0) {
    const err = new Error("Phone number already registered") as Error & { status: number };
    err.status = 409;
    throw err;
  }
  const user = await create<MockUser>("users", {
    id: crypto.randomUUID(),
    name: data.name,
    phone: data.phone,
    password: data.password,
    email: data.email ?? null,
    role: "customer",
    avatarUrl: null,
    isGuest: false,
    isPhoneVerified: false,
    isEmailVerified: false,
    referralCode: null,
    orgId: "org-vicity",
    createdAt: new Date().toISOString(),
  });
  const tokens = fakeTokens(user.id);
  return { ...tokens, user: toAuthUser(user) };
}

export async function mockSendOtp(_data: { identifier: string; type: string }) {
  console.info("[MOCK OTP]", { to: _data.identifier, type: _data.type, otp: "1234" });
  return { message: "OTP sent successfully" };
}

export async function mockVerifyOtp(data: { identifier: string; type: string; otp: string }) {
  // Accept any OTP in mock mode
  if (data.otp.length < 4) {
    const err = new Error("Invalid OTP") as Error & { status: number };
    err.status = 400;
    throw err;
  }
  const users = await query<MockUser>("users", "by_phone", data.identifier);
  let user = users[0];
  if (!user) {
    // If verifying an email, search by email
    const allUsers = await getAll<MockUser>("users");
    user = allUsers.find((u) => u.email === data.identifier) as MockUser;
  }
  if (!user) {
    const err = new Error("User not found") as Error & { status: number };
    err.status = 404;
    throw err;
  }
  // Mark as verified
  await update("users", user.id, { isPhoneVerified: true });
  user.isPhoneVerified = true;
  const tokens = fakeTokens(user.id);
  return { ...tokens, user: toAuthUser(user) };
}

export async function mockGetProfile(userId: string) {
  const user = await getById<MockUser>("users", userId);
  if (!user) {
    const err = new Error("Unauthorized") as Error & { status: number };
    err.status = 401;
    throw err;
  }
  return toProfile(user);
}

export async function mockUpdateProfile(userId: string, data: Partial<{ name: string; email: string }>) {
  const updated = await update<MockUser>("users", userId, data);
  return toProfile(updated);
}

export async function mockChangePassword(userId: string, data: { currentPassword: string; newPassword: string }) {
  const user = await getById<MockUser>("users", userId);
  if (!user || user.password !== data.currentPassword) {
    const err = new Error("Current password is incorrect") as Error & { status: number };
    err.status = 400;
    throw err;
  }
  await update("users", userId, { password: data.newPassword });
  return { message: "Password changed successfully" };
}

export async function mockForgotPassword(data: { identifier: string }) {
  console.info("[MOCK EMAIL] Password reset OTP sent to", data.identifier);
  return { message: "If an account exists with this identifier, a reset code has been sent." };
}

export async function mockResetPassword(data: { token: string; newPassword: string }) {
  // In mock, the "token" is the user's phone number
  void data.token;
  void data.newPassword;
  return { message: "Password has been reset successfully" };
}

export async function mockLogout() {
  return undefined;
}

export async function mockCreateGuestToken() {
  const guestId = `guest-${Date.now()}`;
  await create("users", {
    id: guestId,
    name: "Guest",
    phone: "",
    email: null,
    password: "",
    role: "customer",
    avatarUrl: null,
    isGuest: true,
    isPhoneVerified: false,
    isEmailVerified: false,
    referralCode: null,
    orgId: "org-vicity",
    createdAt: new Date().toISOString(),
  });
  const tokens = fakeTokens(guestId);
  return { ...tokens, user: { id: guestId, name: "Guest", email: null, phone: "", orgId: "org-vicity", isGuest: true, role: "customer" }, guestId };
}

export async function mockRefreshToken(userId: string) {
  const user = await getById<MockUser>("users", userId);
  if (!user) return null;
  return fakeTokens(user.id);
}

/**
 * Extract userId from a mock token like "mock-access-<userId>-<ts>"
 */
export function extractUserIdFromToken(token: string): string | null {
  if (!token.startsWith("mock-access-")) return null;
  const parts = token.split("-");
  // Token format: mock-access-<userId segments>-<timestamp>
  // userId can contain dashes (e.g. "usr-001" or UUIDs), so we need all parts between "access-" and the last segment (timestamp)
  if (parts.length < 4) return null;
  // Remove "mock", "access", and the last part (timestamp)
  return parts.slice(2, -1).join("-");
}
