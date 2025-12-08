import { Module } from '@nestjs/common';
import { RepeatPurchasersController } from './repeat-purchasers.controller';
import { RepeatPurchaseService } from '../../../common/lib/repeat-purchase/repeat-purchase.service';
import { PrismaModule } from '../../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RepeatPurchasersController],
  providers: [RepeatPurchaseService],
  exports: [RepeatPurchaseService],
})
export class RepeatPurchasersModule {}

