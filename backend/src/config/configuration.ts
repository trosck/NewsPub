export interface AppConfig {
  nodeEnv: string;
  isProd: boolean;
  port: number;
  mongodbUri: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  bcryptSaltRounds: number;
  newsPublishIntervalMs: number;
  clientUrl: string;
  s3: {
    accessKeyId: string;
    secretAccessKey: string;
    endpoint: string;
    iamEndpoint: string;
    bucket: string;
    uploadLimitMb: number;
  };
}

function requireEnv(name: string, defaultValue?: string): string {
  const value = process.env[name];

  if (!value && !defaultValue) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  if (!value && defaultValue) {
    return defaultValue;
  }

  return value as string;
}

export default (): AppConfig => {
  const nodeEnv = requireEnv("NODE_ENV", "production");
  const isProd = nodeEnv === "production";

  return {
    nodeEnv,
    isProd,
    port: Number(requireEnv("PORT", "5000")),
    mongodbUri: requireEnv("MONGODB_URI"),
    jwtSecret: requireEnv("JWT_SECRET"),
    jwtExpiresIn: requireEnv("JWT_EXPIRES_IN"),
    bcryptSaltRounds: Number(requireEnv("BCRYPT_SALT_ROUNDS")),
    newsPublishIntervalMs: Number(
      requireEnv("NEWS_PUBLISH_INTERVAL_MS", "60000"),
    ),
    clientUrl: requireEnv("CLIENT_URL"),
    s3: {
      accessKeyId: requireEnv("S3_ACCESS_KEY_ID"),
      secretAccessKey: requireEnv("S3_SECRET_ACCESS_KEY"),
      endpoint: requireEnv("S3_ENDPOINT"),
      iamEndpoint: requireEnv("S3_IAM_ENDPOINT"),
      bucket: requireEnv("S3_BUCKET"),
      uploadLimitMb: Number(requireEnv("S3_UPLOAD_LIMIT_MB")),
    },
  };
};
