import {
  Controller,
  Get,
  Delete,
  Param,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guard/role/roles.guard';
import { Roles } from '../../../common/guard/role/roles.decorator';
import { Role } from '../../../common/guard/role/role.enum';
import { PrismaService } from '../../../prisma/prisma.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('admin-banned-users')
@Controller('admin/banned-users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth()
export class BannedUsersController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Get all banned users' })
  async getAllBannedUsers() {
    try {
      const bannedUsers = await this.prisma.bannedUser.findMany({
        orderBy: {
          createdAt: 'desc',
        },
      });

      // Group by type for better organization
      const grouped = {
        EMAIL: bannedUsers.filter((b) => b.type === 'EMAIL'),
        PHONE: bannedUsers.filter((b) => b.type === 'PHONE'),
        USERNAME: bannedUsers.filter((b) => b.type === 'USERNAME'),
      };

      return {
        success: true,
        data: {
          all: bannedUsers,
          grouped,
          total: bannedUsers.length,
        },
        message: 'Banned users retrieved successfully',
      };
    } catch (error) {
      throw new HttpException(
        error?.message || 'Failed to get banned users',
        error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Unban a user by removing from banned list' })
  async unbanUser(@Param('id') id: string) {
    try {
      const bannedUser = await this.prisma.bannedUser.findUnique({
        where: { id },
      });

      if (!bannedUser) {
        throw new HttpException('Banned user record not found', HttpStatus.NOT_FOUND);
      }

      await this.prisma.bannedUser.delete({
        where: { id },
      });

      return {
        success: true,
        data: {
          id: bannedUser.id,
          type: bannedUser.type,
          value: bannedUser.value,
        },
        message: `${bannedUser.type} (${bannedUser.value}) has been unbanned successfully`,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error?.message || 'Failed to unban user',
        error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('by-value/:type/:value')
  @ApiOperation({ summary: 'Unban a user by type and value' })
  async unbanByValue(
    @Param('type') type: string,
    @Param('value') value: string,
  ) {
    try {
      const bannedUser = await this.prisma.bannedUser.findFirst({
        where: {
          type: type.toUpperCase(),
          value: value,
        },
      });

      if (!bannedUser) {
        throw new HttpException(
          `No banned record found for ${type}: ${value}`,
          HttpStatus.NOT_FOUND,
        );
      }

      await this.prisma.bannedUser.delete({
        where: { id: bannedUser.id },
      });

      return {
        success: true,
        data: {
          id: bannedUser.id,
          type: bannedUser.type,
          value: bannedUser.value,
        },
        message: `${bannedUser.type} (${bannedUser.value}) has been unbanned successfully`,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error?.message || 'Failed to unban user',
        error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

