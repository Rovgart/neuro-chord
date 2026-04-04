/** biome-ignore-all lint/style/useNamingConvention: <explanation> */
import z from "zod";

export const envSchema = z.object({
  POSTGRES_DB_URL: z.string().nonempty(),
  MONGODB_URL: z.string().nonempty(),
  MONGO_USER: z.string().nonempty(),
  MONGO_PASSWORD: z.string().nonempty(),
  JWT_SECRET: z.string().nonempty(),
  JWT_REFRESH_SECRET: z.string().nonempty(),
  PORT: z.preprocess((val) => Number(val), z.number().default(3000)),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  GOOGLE_CLIENT_ID: z.string().nonempty(),
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
