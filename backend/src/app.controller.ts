import { Controller, Get } from "@nestjs/common";

@Controller()
export class AppController {
  @Get()
  root(): { message: string; docs: string } {
    return { message: "API is running", docs: "/api/health" };
  }

  @Get("api/health")
  health(): { status: string; timestamp: string } {
    return { status: "ok", timestamp: new Date().toISOString() };
  }
}
