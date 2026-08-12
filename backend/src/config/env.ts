import "dotenv/config";

function requireEnv(name: string, defaultValue?: string): string {
  const value = process.env[name] as string;

  if (!value && !defaultValue) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  if (!value && defaultValue) {
    return defaultValue;
  }

  return value;
}

export const NODE_ENV = requireEnv("NODE_ENV", "production");
export const PORT = requireEnv("PORT", "5000");

export const MONGODB_URI = requireEnv("MONGODB_URI");

export const JWT_SECRET = requireEnv("JWT_SECRET");
export const JWT_EXPIRES_IN = requireEnv("JWT_EXPIRES_IN", "7d");

export const BCRYPT_SALT_ROUNDS = requireEnv("BCRYPT_SALT_ROUNDS", "10");

export const NEWS_PUBLISH_INTERVAL_MS = Number(
  requireEnv("NEWS_PUBLISH_INTERVAL_MS", "60000"),
);

export const CLIENT_URL = requireEnv("CLIENT_URL");

export const S3_ACCESS_KEY_ID = requireEnv("S3_ACCESS_KEY_ID");
export const S3_SECRET_ACCESS_KEY = requireEnv("S3_SECRET_ACCESS_KEY");
export const S3_ENDPOINT = requireEnv("S3_ENDPOINT");
export const S3_IAM_ENDPOINT = requireEnv("S3_IAM_ENDPOINT");
export const S3_BUCKET = requireEnv("S3_BUCKET");
export const S3_UPLOAD_LIMIT_MB = Number(
  requireEnv("S3_UPLOAD_LIMIT_MB", "10"),
);

export const IS_PROD = NODE_ENV === "production";
