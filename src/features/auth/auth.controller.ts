import { Body, Controller, HttpCode, HttpStatus, Post, Query, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from '../../core/decorators/public.decorator';
import { ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ConfirmEmailDto } from './dto/confirm-email.dto';
import { RequestEmailVerificationCodeDto } from './dto/request-email-verification.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Public()
@ApiTags('authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('register')
  register(@Body() registrationDto: RegisterDto) {
    return this.authService.register(registrationDto);
  }

  @Post('refresh')
  async refresh(@Body() refreshToken: RefreshTokenDto) {
    return this.authService.refreshToken(refreshToken);
  }

  @Post('confirm-email')
  confirmEmail(@Body() data: ConfirmEmailDto) {
    return this.authService.confirmEmail(data);
  }

  @Post('request-email-verification-code')
  requestEmailVerificationCode(@Body() data: RequestEmailVerificationCodeDto) {
    return this.authService.requestEmailVerificationCode(data);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Get('validate')
  async validateToken(@Query('token') token: string) {
    await this.authService.validateAccessToken(token);
    return { message: 'Token is valid' };
  }
}
