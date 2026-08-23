process.env.NODE_ENV = "test";
process.env.PORT = "0";
process.env.JWT_SECRET = "test-jwt-secret";
process.env.JWT_EXPIRES_IN = "1h";
process.env.BCRYPT_SALT_ROUNDS = "4";
process.env.CLIENT_URL = "http://localhost:5173";
process.env.S3_ACCESS_KEY_ID = "test";
process.env.S3_SECRET_ACCESS_KEY = "test";
process.env.S3_ENDPOINT = "http://localhost:9000";
process.env.S3_IAM_ENDPOINT = "http://localhost:9000";
process.env.S3_BUCKET = "test-bucket";
process.env.S3_UPLOAD_LIMIT_MB = "10";
process.env.NEWS_PUBLISH_INTERVAL_MS = "60000";
process.env.LOG_LEVEL = "fatal";

import { MongoMemoryServer } from "mongodb-memory-server";

let mongod: MongoMemoryServer | null = null;

export async function setupMemoryDb(): Promise<void> {
  mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongod.getUri("test");
}

export async function teardownMemoryDb(): Promise<void> {
  if (mongod) {
    await mongod.stop();
    mongod = null;
  }
}
