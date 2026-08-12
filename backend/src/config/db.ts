import mongoose from "mongoose";

import logger from "../utils/logger.js";
import { MONGODB_URI } from "./env.js";

export async function connectDB(): Promise<typeof mongoose> {
  mongoose.set("strictQuery", true);

  const connection = await mongoose.connect(MONGODB_URI);
  logger.info({ host: connection.connection.host }, "MongoDB connected");

  return connection;
}
