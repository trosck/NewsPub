import { createParamDecorator, ExecutionContext } from "@nestjs/common";

import type { AuthenticatedRequest } from "../guards/jwt-auth.guard";
import type { UserDocument } from "../../users/schemas/user.schema";

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): UserDocument | undefined => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    return request.user;
  },
);
