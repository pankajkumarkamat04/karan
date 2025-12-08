import { Module } from '@nestjs/common';
import { PaymentTransactionModule } from './payment-transaction/payment-transaction.module';
import { UserModule } from './user/user.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { RepeatPurchasersModule } from './repeat-purchasers/repeat-purchasers.module';
import { BannedUsersModule } from './banned-users/banned-users.module';

@Module({
  imports: [
    PaymentTransactionModule,
    UserModule,
    DashboardModule,
    RepeatPurchasersModule,
    BannedUsersModule,
  ],
})
export class AdminModule {}
