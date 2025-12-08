import { Module } from '@nestjs/common';
import { BannedUsersController } from './banned-users.controller';
import { PrismaModule } from '../../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BannedUsersController],
})
export class BannedUsersModule {}

