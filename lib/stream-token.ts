import crypto from "crypto";

export function base64UrlEncode(value: string | Buffer) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export function createStreamToken(userId: string, secret: string) {
  const header = { alg: "HS256", typ: "JWT" };
  const issuedAt = Math.floor(Date.now() / 1000) - 60;
  const expirationTime = Math.floor(Date.now() / 1000) + 3600;
  const payload = {
    user_id: userId,
    iat: issuedAt,
    exp: expirationTime,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const signature = base64UrlEncode(
    crypto.createHmac("sha256", secret).update(signingInput).digest(),
  );

  return `${signingInput}.${signature}`;
}
