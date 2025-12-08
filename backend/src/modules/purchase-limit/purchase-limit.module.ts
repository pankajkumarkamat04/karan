import { Module } from '@nestjs/common';
import { PurchaseLimitController } from './purchase-limit.controller';
import { PurchaseLimitService } from '../../common/lib/purchase-limit/purchase-limit.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PurchaseLimitController],
  providers: [PurchaseLimitService],
  exports: [PurchaseLimitService],
})
export class PurchaseLimitModule {}

