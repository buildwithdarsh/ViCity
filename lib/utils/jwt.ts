import { SignJWT, jwtVerify } from "jose";

interface TokenPayload {
  userId: string;
  role: string;
  type: "access" | "refresh";
}

function getSecret(type: "access" | "refresh"): Uint8Array {
  const secret =
    type === "access"
      ? process.env['JWT_SECRET']
      : process.env['REFRESH_TOKEN_SECRET'];

  if (!secret) {
    throw new Error(`${type === "access" ? "JWT_SECRET" : "REFRESH_TOKEN_SECRET"} is not set`);
  }

  return new TextEncoder().encode(secret);
}

function getExpiry(type: "access" | "refresh"): string {
  return type === "access"
    ? process.env['JWT_EXPIRES_IN'] || "15m"
    : process.env['REFRESH_TOKEN_EXPIRES_IN'] || "7d";
}

export async function signToken(
  payload: Omit<TokenPayload, "type">,
  type: "access" | "refresh"
): Promise<string> {
  const secret = getSecret(type);
  const expiry = getExpiry(type);

  return new SignJWT({ ...payload, type })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiry)
    .sign(secret);
}

export async function verifyToken(
  token: string,
  type: "access" | "refresh"
): Promise<TokenPayload> {
  const secret = getSecret(type);

  const { payload } = await jwtVerify(token, secret);

  if (payload['type'] !== type) {
    throw new Error("Invalid token type");
  }

  return payload as unknown as TokenPayload;
}
