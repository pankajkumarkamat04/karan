import { Module } from '@nestjs/common';
import { UpiPaymentService } from './upi-payment.service';
import { UpiPaymentController } from './upi-payment.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { PurchaseLimitService } from '../../common/lib/purchase-limit/purchase-limit.service';
import { OtpService } from '../../common/lib/otp/otp.service';

@Module({
  imports: [PrismaModule],
  controllers: [UpiPaymentController],
  providers: [UpiPaymentService, PurchaseLimitService, OtpService],
  exports: [UpiPaymentService],
})
export class UpiPaymentModule {}
