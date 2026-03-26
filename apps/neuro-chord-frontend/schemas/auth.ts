import z from "zod";

export const loginSchema = z.object({
    email: z.email({ error: "Please enter a valid email" }),
    password:z.string().nonempty({ error: "Please enter a password" })
})
export const registerSchema = z.object({
    email: z.email({ error: "Please enter a valid email" }),
    password: z.string().nonempty({ error: "Please enter a password" }),
    confirmPassword: z.string().nonempty({ error: "Please confirm your password" }),
}).refine((check) => check.password === check.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
})
export const forgotPasswordSchema=z.object({
    email:z.email({error:"Please enter valid e-mail"}).nonempty({error:"Please enter e-mail"})
})
export type LoginSchema = z.infer<typeof loginSchema>;
export type RegisterSchema = z.infer<typeof registerSchema>;
export type ForgotPasswordSchema=z.infer<typeof forgotPasswordSchema>
