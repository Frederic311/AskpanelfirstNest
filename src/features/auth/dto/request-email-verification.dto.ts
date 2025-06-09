import { IsEmail } from 'class-validator';

export class RequestEmailVerificationCodeDto {
  @IsEmail()
  email: string;
}
