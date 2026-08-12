import type { UserDocument } from "../models/User.js";

declare module "express-serve-static-core" {
  interface Request {
    user?: UserDocument;
  }
}

export {};
