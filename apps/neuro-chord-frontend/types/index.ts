export type User = {
  id: string;
  email: string;
};
export type UserLoginValuesT = {
  username: string;
  password: string;
};
export type LoginResponseT = {
  accessToken: string;
  refreshToken: string;
  user: User;
};
export type UserRegisterValuesT = {
  email: string;
  password: string;
};

export type UserRegisterResponseT = {
  id: string;
  email: string;
  onboardingComplete: false;
};
