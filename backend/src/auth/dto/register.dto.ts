import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class RegisterDto {
  @IsString({ message: "name, email and password are required" })
  @IsNotEmpty({ message: "name, email and password are required" })
  name: string;

  @IsEmail({}, { message: "name, email and password are required" })
  email: string;

  @IsString({ message: "name, email and password are required" })
  @MinLength(8, { message: "name, email and password are required" })
  password: string;
}
