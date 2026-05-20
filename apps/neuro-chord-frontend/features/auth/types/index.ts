export interface UserDto {
  id: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
  profileId: string;
}

export interface AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: UserDto;
}
export enum UserRole {
  Teacher = 'Teacher',
  Student = 'Student',
  TeacherPending = 'TeacherPending',
}
export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  imgUrl?: string;
  role: UserRole;
  createdAt: string;
}
