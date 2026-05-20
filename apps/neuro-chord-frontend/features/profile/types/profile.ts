export interface StudentProfileDto {
  username: string;
  experienceLevel: string;
}

export interface TeacherProfileDto {
  specialization: string;
  education: string;
  createdAt: string;
}

export interface ProfileResponseDto {
  userId: string;
  displayName: string;
  description: string | null;
  imgUrl: string | null;
  role: string;
  studentProfile: StudentProfileDto | null;
  teacherProfile: TeacherProfileDto | null;
  createdAt: string;
}
