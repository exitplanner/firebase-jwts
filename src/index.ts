import fetch from 'cross-fetch';
import type { Request, Response } from 'express';

const FIREBASE_JWKS = [
  'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com',
  'https://identitytoolkit.googleapis.com/v1/sessionCookiePublicKeys'
];

type JwtKeyContainer = {
  keys: Object[]
}

export async function fetchJwts(_: Request, res: Response) {
  const results = await Promise.all(
    FIREBASE_JWKS.map(u => fetch(u).then(p => p.json() as unknown as JwtKeyContainer))
  );
  const combined = results.reduce((prev, cur) => {
    prev.keys = prev.keys.concat(cur.keys);
    return prev;
  });

  // The securetoken endpoint from Google returns a cache-control header that looks something like:
  //   public, max-age=19606, must-revalidate, no-transform
  // While the sessionCookie endpoint has a cache-control of:
  //   no-cache, no-store, max-age=0, must-revalidate
  // Basically: Don't store the public keys at all for session token.
  // The lowest common denominator here would be to use the max-age=0 header,
  // but in practice the keys don't get updated that frequently, so we take a
  // slightly more pragmatic approach and set a cache control of 1 hour.
  res.set('Cache-Control', 'public, max-age=3600, must-revalidate')

  res.status(200).json(combined);
}