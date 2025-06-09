import { Injectable } from '@nestjs/common';
import { User } from '../users/entities/user.entity';
import { MailerService } from '@nestjs-modules/mailer';
import * as process from 'process';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendUserEmailConfirmationCode(user: User) {
    const url = `${process.env.API_URL}/auth/confirm-email?token=${user.token}`;

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Welcome! Confirm your email',
      template: 'email-confirmation', // `.hbs` extension is appended automatically
      context: {
        name: user.fullName,
        token: user.token,
        url,
      },
    });
  }

  async sendWelcome(user: User) {
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Welcome to our app!',
      template: 'welcome',
      context: {
        name: user.fullName,
      },
    });
  }

  async sendPasswordReset(user: User) {
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'We want to reset your password be ready!',
      template: 'password-reset',
      context: {
        name: user.fullName,
        token: user.token,
      },
    });
  }

  async sendExcelProcessSuccess(to: string) {
    await this.mailerService.sendMail({
      to,
      subject: 'Excel Processing Success',
      template: 'excel-success',
      context: {},
    });
  }

  async sendExcelProcessFailure(to: string, error: string, pdfBuffer?: Buffer) {
    await this.mailerService.sendMail({
      to,
      subject: 'Excel Processing Failure',
      template: 'excel-failure',
      context: {
        error,
      },
      attachments: pdfBuffer
        ? [
            {
              filename: 'excel-errors.pdf',
              content: pdfBuffer,
              contentType: 'application/pdf',
            },
          ]
        : [],
    });
  }
}
