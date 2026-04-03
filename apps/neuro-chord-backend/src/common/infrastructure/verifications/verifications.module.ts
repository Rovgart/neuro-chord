import { Module } from '@nestjs/common';
import { SecurityModule } from '@security/security.module';
import { VerificationService } from './verifications.service';

@Module({
  imports: [SecurityModule],
  providers: [VerificationService],
  exports: [VerificationService],
})
export class VerificationsModule {}
