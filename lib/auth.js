import crypto from 'node:crypto';

function sign(encoded, secret) {
  return crypto.createHmac('sha256', secret).update(encoded).digest('base64url');
}

export function signToken(payload, secret, ttlSeconds = 12 * 60 * 60) {
  const body = { ...payload, exp: Date.now() + ttlSeconds * 1000 };
  const encoded = Buffer.from(JSON.stringify(body)).toString('base64url');
  return encoded + '.' + sign(encoded, secret);
}

export function verifyToken(token, secret) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const [encoded, sig] = token.split('.');
  if (!encoded || !sig) return null;

  const expected = sign(encoded, secret);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  let body;
  try {
    body = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf-8'));
  } catch (e) {
    return null;
  }
  if (!body.exp || Date.now() > body.exp) return null;
  return body;
}
