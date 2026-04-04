import { MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PinoLogger } from "nestjs-pino";
@Injectable()
export class MailerCustomService {
  constructor(
    private mailer: MailerService,
    private logger: PinoLogger,
    private configService: ConfigService,
  ) {}
  async sendWelcomeEmail(user: any) {
    try {
      console.log("Sending welcome email to", user.email);
      await this.mailer.sendMail({
        to: user.email,
        subject: "Welcome to Neuro-chord",
        template: "welcome", // name of the template file
        context: {
          name: user.email.split("@")[0],
        },
      });
      console.log("Welcome email sent to", user.email);
    } catch (error) {
      this.logger.error("Failed to send welcome email", error);
    }
  }
  async sendVerificationEmail(user: any, token: string) {
    const baseUrl = this.configService.get("FRONTEND_URL");
    const verificationUrl = `${baseUrl}auth/verify-email?token=${token}`;
    try {
      await this.mailer.sendMail({
        to: user.email,
        subject: "Verify your email",
        template: "verify-email",
        context: {
          url: verificationUrl,
          token: verificationUrl,
        },
      });
    } catch (error) {
      this.logger.error("Failed to send verification email", error);
    }
  }
}
