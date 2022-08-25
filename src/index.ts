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

  res.status(200).json(combined);
}