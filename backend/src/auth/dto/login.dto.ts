import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class LoginDto {
  @IsEmail({}, { message: "Email and password required" })
  email: string;

  @IsString({ message: "Email and password required" })
  @IsNotEmpty({ message: "Email and password required" })
  password: string;
}
