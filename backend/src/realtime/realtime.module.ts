import { Module } from "@nestjs/common";

import { NewsGateway } from "./news.gateway";
import { RealtimeService } from "./realtime.service";
import { UsersModule } from "../users/users.module";

@Module({
  imports: [UsersModule],
  providers: [NewsGateway, RealtimeService],
  exports: [RealtimeService],
})
export class RealtimeModule {}
