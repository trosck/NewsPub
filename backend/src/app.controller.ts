import { Controller, Get, Res } from "@nestjs/common";
import { Public } from "./common/decorators/public.decorator";
import type { Response } from "express";

@Controller()
export class AppController {
  @Public()
  @Get()
  root(): { message: string; docs: string } {
    return { message: "API is running", docs: "/api/health" };
  }

  @Public()
  @Get("health")
  health(@Res() res: Response) {
    return res.type("text/plain").send("ok");
  }
}
