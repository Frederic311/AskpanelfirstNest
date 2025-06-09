import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { MailService } from '../mail/mail.service';
import { User } from '../users/entities/user.entity';
import { ConfirmEmailDto } from './dto/confirm-email.dto';
import { Role } from '../../core/enums/role.enum';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { TokensDto } from './dto/tokens.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}
  async login(loginData: LoginDto): Promise<TokensDto> {
    let user = null;
    if (loginData.username.includes('@')) {
      user = await this.usersService.findOneByEmail(loginData.username);
    }
    if (!user) {
      throw new UnauthorizedException();
    }

    const isMatch = await bcrypt.compare(loginData.password, user?.password);
    if (!isMatch) {
      throw new UnauthorizedException();
    }
    if (!user!.isActive) {
      throw new UnauthorizedException("Account isn't active");
    }

    return this.generateTokens({
      userId: user.id,
      email: user.email,
      roles: user.roles ?? [],
      firstname: user.firstname,
      lastname: user.lastname,
    });
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<TokensDto> {
    const { refreshToken } = refreshTokenDto;
    try {
      const payload = await this.validateRefreshToken(refreshToken);

      return this.generateTokens({
        userId: payload.sub,
        email: payload.email,
        roles: payload.roles,
        firstname: payload.firstname,
      lastname: payload.lastname,
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  // async register(registerData: RegisterDto): Promise<{ data: string }> {
  //   const existingUserByEmail = await this.usersService.findOneByEmail(
  //     registerData.email,
  //   );

  //   if (existingUserByEmail) {
  //     throw new ConflictException('Email is already in use');
  //   }

  //   const hashedPassword = await bcrypt.hash(registerData.password, 10);

  //   const newUser = await this.usersService.persist({
  //     ...registerData,
  //     password: hashedPassword,
  //     roles: [],
  //     token: Math.floor(1000 + Math.random() * 9000).toString(),
  //     tokenExpires: new Date(Date.now() + 15 * 60000), // expire in 15 min
  //     isActive: false,
  //   } as User);

  //   await this.mailService.sendUserEmailConfirmationCode(newUser);

  //   return {
  //     data: 'Your account is created, please check your email to verify',
  //   };
  // }

async register(registerData: RegisterDto): Promise<{ data: string }> {
  const existingUserByEmail = await this.usersService.findOneByEmail(
    registerData.email,
  );

  if (existingUserByEmail) {
    throw new ConflictException('Email is already in use');
  }

  const hashedPassword = await bcrypt.hash(registerData.password, 10);

  const newUser = await this.usersService.persist({
    ...registerData,
    password: hashedPassword,
    roles: [Role.User], // Assign default role
    token: '-1',        // No confirmation token needed
    tokenExpires: new Date(),
    isActive: true,     // Activate account immediately
  } as User);

  // Optionally, send a welcome email instead of confirmation code
  await this.mailService.sendWelcome(newUser);

  return {
    data: 'Your account is created and active. You can now log in.',
  };
}

  async confirmEmail(data: ConfirmEmailDto) {
    const user = await this.usersService.findOneByEmail(data.email);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.token !== data.token) {
      throw new BadRequestException('Invalid token');
    }

    if (user.tokenExpires < new Date(Date.now())) {
      throw new HttpException(
        { message: 'Token expired. Ask for a new one' },
        HttpStatus.NOT_ACCEPTABLE,
      );
    }

    user.token = '-1';
    user.isActive = true;
    user.roles = [Role.User];
    await this.usersService.persist(user);
    await this.mailService.sendWelcome(user);
    return {
      data: 'Your account is active now',
    };
  }

  async requestEmailVerificationCode(data: { email: string }) {
    let user = await this.usersService.findOneByEmail(data.email);
    user.token = Math.floor(1000 + Math.random() * 9000).toString();
    user.tokenExpires = new Date(Date.now() + 15 * 60000);
    user = await this.usersService.persist(user);
    await this.mailService.sendUserEmailConfirmationCode(user);

    return {
      data: 'Your account verification code has been resent, please check your email to verify',
    };
  }

  private async generateTokens(data: {
    userId: number;
    email: string;
    roles: Role[];
    firstname: string;
    lastname: string;
  }) {
    const payload = {
      sub: data.userId,
      email: data.email,
      roles: data.roles ?? [],
      firstname: data.firstname,
      lastname: data.lastname,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: '1h',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    });

    return {
      accessToken,
      refreshToken,
    } as TokensDto;
  }

  async validateAccessToken(token: string) {
    try {
      return this.jwtService.verify(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      });
    } catch {
      throw new UnauthorizedException('Invalid access token');
    }
  }

  async validateRefreshToken(token: string) {
    try {
      return this.jwtService.verify(token, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.usersService.findOneByEmail(
      forgotPasswordDto.email,
    );
    if (!user) {
      throw new BadRequestException('User not found');
    }

    user.token = Math.floor(1000 + Math.random() * 9000).toString();
    user.tokenExpires = new Date(Date.now() + 15 * 60000); // expire in 15 min
    await this.usersService.persist(user);

    await this.mailService.sendPasswordReset(user);

    return {
      data: 'Password reset token has been sent to your email',
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const user = await this.usersService.findOneByResetToken(
      resetPasswordDto.token,
    );
    if (!user || user.tokenExpires < new Date(Date.now())) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    user.password = await bcrypt.hash(resetPasswordDto.newPassword, 10);
    user.token = '-1';
    user.tokenExpires = new Date();
    await this.usersService.persist(user);

    return {
      data: 'Your password has been reset successfully',
    };
  }
}
