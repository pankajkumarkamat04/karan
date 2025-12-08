import { Controller, Get, UseGuards, Req, HttpException, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PurchaseLimitService } from '../../common/lib/purchase-limit/purchase-limit.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

@ApiTags('purchase-limit')
@Controller('purchase-limit')
export class PurchaseLimitController {
  constructor(private readonly purchaseLimitService: PurchaseLimitService) {}

  @Get('weekly-status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get weekly purchase status for authenticated user' })
  async getWeeklyStatus(
    @Req() req: Request & { user: { sub?: string; userId?: string } },
  ) {
    try {
      const userId = req.user?.sub || req.user?.userId;

      if (!userId) {
        throw new HttpException('User ID not found', HttpStatus.UNAUTHORIZED);
      }

      const status = await this.purchaseLimitService.getWeeklyPurchaseStatus(userId);

      return {
        success: true,
        data: status,
        message: 'Weekly purchase status retrieved successfully',
      };
    } catch (error) {
      throw new HttpException(
        error?.message || 'Failed to get weekly purchase status',
        error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

