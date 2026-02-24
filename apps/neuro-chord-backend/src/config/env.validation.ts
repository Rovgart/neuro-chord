/** biome-ignore-all lint/style/useNamingConvention: <explanation> */
import z from 'zod';

// env.validation.ts
export const envSchema = z.object({
  POSTGRES_DB_URL: z.string().min(1),
  MONGODB_URL: z.string().min(1),
  MONGODB_USER: z.string().min(1),
  MONGODB_PASSWORD: z.string().min(1),
  JWT_SECRET: z.string().min(1),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  PORT: z.preprocess((val) => Number(val), z.number().default(3000)),

  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
});
export type Env = z.infer<typeof envSchema>;

export const validateEnv = (config: Record<string, unknown>): Env => {
  const result = envSchema.safeParse(config);
  if (!result.success) {
    throw new Error(
      `Invalid environment variables: ${JSON.stringify(result.error.issues)}`,
    );
  }
  return result.data;
};
