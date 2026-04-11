export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  isVerified: boolean;
  onboardingComplete: boolean;
  sid: string;
  iat?: number;
  exp?: number;
}
