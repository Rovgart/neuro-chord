import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength } from "class-validator";

export class ResetPasswordDto {
  @ApiProperty()
  @IsString()
  @MinLength(8, { message: "Hasło musi mieć co najmniej 8 znaków" })
  newPassword: string;
}
