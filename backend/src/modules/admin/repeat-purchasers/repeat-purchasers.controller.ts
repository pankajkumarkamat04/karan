import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Body,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guard/role/roles.guard';
import { Roles } from '../../../common/guard/role/roles.decorator';
import { Role } from '../../../common/guard/role/role.enum';
import { RepeatPurchaseService } from '../../../common/lib/repeat-purchase/repeat-purchase.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('admin-repeat-purchasers')
@Controller('admin/repeat-purchasers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth()
export class RepeatPurchasersController {
  constructor(
    private readonly repeatPurchaseService: RepeatPurchaseService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all users with repeat purchase patterns' })
  async getRepeatPurchasers() {
    try {
      const repeatPurchasers = await this.repeatPurchaseService.getRepeatPurchasers();

      return {
        success: true,
        data: repeatPurchasers,
        message: 'Repeat purchasers retrieved successfully',
      };
    } catch (error) {
      throw new HttpException(
        error?.message || 'Failed to get repeat purchasers',
        error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':userId/check')
  @ApiOperation({ summary: 'Check if a specific user is a repeat purchaser' })
  async checkUser(@Param('userId') userId: string) {
    try {
      const result = await this.repeatPurchaseService.checkRepeatPurchase(userId);

      return {
        success: true,
        data: result,
        message: 'User check completed successfully',
      };
    } catch (error) {
      throw new HttpException(
        error?.message || 'Failed to check user',
        error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':userId/ban')
  @ApiOperation({ summary: 'Ban a user' })
  async banUser(
    @Param('userId') userId: string,
    @Body() body: { reason?: string },
  ) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: {
          is_banned: true,
          banned_at: new Date(),
          ban_reason: body.reason || 'Repeated purchase pattern detected',
        },
      });

      return {
        success: true,
        data: {
          id: updatedUser.id,
          email: updatedUser.email,
          is_banned: updatedUser.is_banned,
          banned_at: updatedUser.banned_at,
          ban_reason: updatedUser.ban_reason,
        },
        message: 'User banned successfully',
      };
    } catch (error) {
      throw new HttpException(
        error?.message || 'Failed to ban user',
        error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('ban-customer')
  @ApiOperation({ summary: 'Ban a customer by email, phone, and game username from repeat purchasers' })
  async banCustomer(
    @Body() body: { 
      customer_email: string; 
      customer_phone: string; 
      customer_name?: string;
      reason?: string;
      userId?: string;
    },
  ) {
    try {
      const banReason = body.reason || 'Repeated purchase pattern detected';
      const results = [];

      // 1. Ban Phone
      if (body.customer_phone) {
        try {
          const existing = await this.prisma.bannedUser.findFirst({
            where: {
              type: 'PHONE',
              value: body.customer_phone,
            },
          });

          if (!existing) {
            await this.prisma.bannedUser.create({
              data: {
                type: 'PHONE',
                value: body.customer_phone,
                reason: banReason,
              },
            });
            results.push({ type: 'PHONE', value: body.customer_phone, status: 'Banned' });
          } else {
            results.push({ type: 'PHONE', value: body.customer_phone, status: 'Already Banned' });
          }
        } catch (err) {
          console.error('Failed to ban phone:', err);
          results.push({ type: 'PHONE', value: body.customer_phone, status: 'Failed', error: err.message });
        }
      }

      // 2. Ban Email
      if (body.customer_email) {
        try {
          const existing = await this.prisma.bannedUser.findFirst({
            where: {
              type: 'EMAIL',
              value: body.customer_email,
            },
          });

          if (!existing) {
            await this.prisma.bannedUser.create({
              data: {
                type: 'EMAIL',
                value: body.customer_email,
                reason: banReason,
              },
            });
            results.push({ type: 'EMAIL', value: body.customer_email, status: 'Banned' });
          } else {
            results.push({ type: 'EMAIL', value: body.customer_email, status: 'Already Banned' });
          }
        } catch (err) {
          console.error('Failed to ban email:', err);
          results.push({ type: 'EMAIL', value: body.customer_email, status: 'Failed', error: err.message });
        }
      }

      // 3. Ban Game Username (customer_name)
      if (body.customer_name) {
        try {
          const existing = await this.prisma.bannedUser.findFirst({
            where: {
              type: 'USERNAME',
              value: body.customer_name,
            },
          });

          if (!existing) {
            await this.prisma.bannedUser.create({
              data: {
                type: 'USERNAME',
                value: body.customer_name,
                reason: banReason,
              },
            });
            results.push({ type: 'USERNAME', value: body.customer_name, status: 'Banned' });
          } else {
            results.push({ type: 'USERNAME', value: body.customer_name, status: 'Already Banned' });
          }
        } catch (err) {
          console.error('Failed to ban username:', err);
          results.push({ type: 'USERNAME', value: body.customer_name, status: 'Failed', error: err.message });
        }
      }

      // 4. Also ban user account if userId is provided
      if (body.userId) {
        try {
          const user = await this.prisma.user.findUnique({
            where: { id: body.userId },
          });

          if (user) {
            await this.prisma.user.update({
              where: { id: body.userId },
              data: {
                is_banned: true,
                banned_at: new Date(),
                ban_reason: banReason,
              },
            });
            results.push({ type: 'USER_ACCOUNT', value: body.userId, status: 'Banned' });
          }
        } catch (err) {
          console.error('Failed to ban user account:', err);
          results.push({ type: 'USER_ACCOUNT', value: body.userId, status: 'Failed', error: err.message });
        }
      }

      return {
        success: true,
        message: 'Customer banned successfully',
        data: {
          results,
        },
      };
    } catch (error) {
      throw new HttpException(
        error?.message || 'Failed to ban customer',
        error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':userId/unban')
  @ApiOperation({ summary: 'Unban a user' })
  async unbanUser(@Param('userId') userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: {
          is_banned: false,
          banned_at: null,
          ban_reason: null,
        },
      });

      return {
        success: true,
        data: {
          id: updatedUser.id,
          email: updatedUser.email,
          is_banned: updatedUser.is_banned,
        },
        message: 'User unbanned successfully',
      };
    } catch (error) {
      throw new HttpException(
        error?.message || 'Failed to unban user',
        error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

