// Pica — HMAC-SHA256 签名 & 常量
// @author Jason

import CryptoJS from 'crypto-js';

export const API_KEY = 'C69BAF41DA5ABD1FFEDC6D2FEA56B';
export const SECRET_KEY = '~d}$Q7$eIni=V)9\\RK/P.RM4;9[7|@/CA}b~OW!3?EV`:<>M7pddUBL5n|0/*Cn';
export const NONCE = '4ce7a7aa759b40f794d189a88b84aba8';

export const DEFAULT_HEADERS: Record<string, string> = {
  accept: 'application/vnd.picacomic.com.v1+json',
  'User-Agent': 'okhttp/3.8.1',
  'Content-Type': 'application/json; charset=UTF-8',
  'api-key': API_KEY,
  'app-build-version': '45',
  'app-platform': 'android',
  'app-uuid': 'defaultUuid',
  'app-version': '2.2.1.3.3.4',
  nonce: NONCE,
  'app-channel': '1',
};

export function nowTs(): string {
  return String(Math.floor(Date.now() / 1000));
}

export function sign(url: string, ts: string, method: string): string {
  const key = (url + ts + NONCE + method + API_KEY).toLowerCase();
  const hmac = CryptoJS.HmacSHA256(key, SECRET_KEY);
  return hmac.toString(CryptoJS.enc.Hex);
}

export function buildHeaders(url: string, method: string, token?: string, quality = 'original'): Record<string, string> {
  const ts = nowTs();
  return {
    ...DEFAULT_HEADERS,
    time: ts,
    signature: sign(url, ts, method),
    authorization: token || '',
    'image-quality': quality,
  };
}
