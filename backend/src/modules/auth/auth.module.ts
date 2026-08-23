import { Global, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";

import { UsersModule } from "../users/users.module";
import { AuthController, MeController } from "./auth.controller";
import { AuthService } from "./auth.service";

@Global()
@Module({
  imports: [
    UsersModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>("jwtSecret"),
        signOptions: {
          expiresIn: config.get<string>("jwtExpiresIn", "7d") as never,
        },
      }),
    }),
  ],
  controllers: [AuthController, MeController],
  providers: [AuthService],
  exports: [JwtModule],
})
export class AuthModule {}
