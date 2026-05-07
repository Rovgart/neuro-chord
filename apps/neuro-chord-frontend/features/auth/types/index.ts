export interface UserDto {
  id: string;
  email: string;
  role: string;
  isVerified: boolean;
  profileId: string;
}

export interface AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: UserDto;
}
