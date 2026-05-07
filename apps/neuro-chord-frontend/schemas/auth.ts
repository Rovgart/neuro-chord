import z from 'zod';

export const loginSchema = z.object({
  email: z.email({ error: 'Please enter a valid email' }),
  password: z.string().nonempty({ error: 'Please enter a password' }),
});
export const registerSchema = z
  .object({
    email: z.string().min(1, { message: 'Email is required.' }).email({ message: 'Invalid email format.' }),

    password: z
      .string()
      .min(1, { message: 'Password is required.' })
      .min(8, { message: 'Password must be at least 8 characters long.' })
      .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter.' })
      .regex(/[0-9]/, { message: 'Password must contain at least one digit.' }),

    confirmPassword: z.string().min(1, { message: 'Please confirm your password' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
export const forgotPasswordSchema = z.object({
  email: z.email({ error: 'Please enter valid e-mail' }).nonempty({ error: 'Please enter e-mail' }),
});
export const verifyPinSchema = z.object({
  pin: z.string().length(6, 'PIN must be exactly 6 digits'),
});
export const resetPasswordSchema = z
  .object({
    newPassword: z.string().nonempty({ error: 'New password is too short' }),
    confirmNewPassword: z.string().nonempty({ error: 'New password is too short' }),
  })
  .refine((data) => data.confirmNewPassword === data.newPassword);
export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
export type VerifyPinSchema = z.infer<typeof verifyPinSchema>;
export type LoginSchema = z.infer<typeof loginSchema>;
export type RegisterSchema = z.infer<typeof registerSchema>;
export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;
