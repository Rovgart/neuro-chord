import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';
@Injectable()
export class MailerCustomService {
  private readonly baseUrl: string;
  constructor(
    private mailer: MailerService,
    private logger: PinoLogger,
    private configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get('FRONTEND_URL') ?? '';
  }
  async sendWelcomeEmail(user: any) {
    try {
      await this.mailer.sendMail({
        to: user.email,
        subject: 'Welcome to Neuro-chord',
        template: 'welcome', // name of the template file
        context: {
          name: user.email.split('@')[0],
        },
      });
    } catch (error) {
      this.logger.error('Failed to send welcome email', error);
    }
  }
  async sendVerificationEmail(user: any, token: string) {
    const verificationUrl = `${this.baseUrl}/verify-email?token=${token}`;
    try {
      await this.mailer.sendMail({
        to: user.email,
        subject: 'Verify your email',
        template: 'verify-email',
        context: {
          url: verificationUrl,
          token: verificationUrl,
        },
      });
    } catch (error) {
      this.logger.error('Failed to send verification email', error);
    }
  }
  async sendPasswordResetEmail(user: any, pin: string) {
    await this.mailer.sendMail({
      to: user.email,
      subject: 'Reset your password',
      template: 'password-reset',
      context: {
        pin,
      },
    });
  }
}
