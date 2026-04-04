import { Global, Module } from "@nestjs/common";
import { MailerCustomService } from "./mailer.service";
@Global()
@Module({
  providers: [MailerCustomService],
  exports: [MailerCustomService],
})
export class MailerModule {}
