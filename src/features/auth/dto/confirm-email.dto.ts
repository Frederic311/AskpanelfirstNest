import { IsEmail } from 'class-validator';

export class ConfirmEmailDto {
  @IsEmail()
  readonly email: string;

  readonly token: string;
}
