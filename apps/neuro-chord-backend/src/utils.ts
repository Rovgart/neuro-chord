import { randomInt } from 'node:crypto';
export const getNow = () => {
  return Math.floor(Date.now() / 1000);
};
export const generateResetPin = () => {
  const pin = randomInt(100000, 1000000);
  return pin.toString();
};
export enum CookieNames {
  REFRESH = 'refresh_token',
  RESET = 'reset_token',
}
export const extractTokenFromCookie = (tokenType: keyof typeof CookieNames, req: any): string | undefined => {
  if (!req?.cookies) {
    return undefined;
  }
  const cookieName = CookieNames[tokenType];
  return req.cookies[cookieName];
};
