import { Module } from '@nestjs/common';
import { MobalegendsPaymentController } from './mobalegends-payment.controller';
import { MobalegendsPaymentService } from './mobalegends-payment.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { PurchaseLimitService } from '../../common/lib/purchase-limit/purchase-limit.service';
import { OtpService } from '../../common/lib/otp/otp.service';

@Module({
  imports: [PrismaModule],
  controllers: [MobalegendsPaymentController],
  providers: [MobalegendsPaymentService, PurchaseLimitService, OtpService],
  exports: [MobalegendsPaymentService],
})
export class MobalegendsPaymentModule {} 