import z from 'zod';

// Definicja enuma zgodna z NeuroChordDomain.Enums.Role
export enum UserRole {
  Student = 'Student',
  Teacher = 'Teacher',
}
const ROLES = [UserRole.Student, UserRole.Teacher] as const;
export const OnboardingDto = z.object({
  displayName: z
    .string()
    .min(3, 'Display name must be at least 3 characters long')
    .max(50, 'Display name cannot exceed 50 characters'),

  description: z
    .string()
    .min(10, 'Description must be at least 10 characters long')
    .max(1000, 'Description is too long'),

  imgUrl: z.string().url('Invalid image URL format').optional().or(z.literal('')),

  role: z.enum(ROLES, {
    error: () => ({ message: 'Please select a valid role (Student or Teacher)' }),
  }),

  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .regex(/^[a-zA-Z0-9._]+$/, 'Only letters, numbers, dots and underscores allowed')
    .optional()
    .or(z.literal('')),

  specialization: z.string().max(100, 'Specialization name is too long').optional().or(z.literal('')),
});

export type OnboardingDtoType = z.infer<typeof OnboardingDto>;
