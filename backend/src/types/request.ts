import { Request } from "express";

import type { UserDocument } from "../models/User.js";

export interface AuthenticatedRequest extends Request {
  user?: UserDocument;
}
