import { IsNotEmpty } from "class-validator";

export class CheckEmailDTO {
  @IsNotEmpty()
  email: string;
}
