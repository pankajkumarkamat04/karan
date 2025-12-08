import { Controller, Post, Body, Get, Param, HttpException, HttpStatus, Patch, UseGuards, UseInterceptors, BadRequestException, Req } from '@nestjs/common';
import { MobalegendsPaymentService } from './mobalegends-payment.service';
import { CreateMobalegendsPaymentDto } from './dto/create-mobalegends-payment.dto';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guard/role/roles.guard';
import { Roles } from 'src/common/guard/role/roles.decorator';
import { Role } from 'src/common/guard/role/role.enum';
import { Request } from 'express';
import { OtpService } from 'src/common/lib/otp/otp.service';

@Controller('mobalegends-payment')
export class MobalegendsPaymentController {
  constructor(
    private readonly mobalegendsPaymentService: MobalegendsPaymentService,
    private readonly otpService: OtpService,
  ) { }

  // Endpoint to send OTP before order creation
  @Post('send-otp')
  @UseInterceptors(AnyFilesInterceptor())
  async sendOtp(@Body() body: any) {
    try {
      if (!body.phone || typeof body.phone !== 'string') {
        throw new BadRequestException('phone is required and must be a string');
      }

      // Store order data temporarily with OTP
      const orderData = {
        amount: body.amount,
        merchantName: body.merchantName,
        upiId: body.upiId,
        client_txn_id: body.client_txn_id,
        customerName: body.customerName || body.name,
        customerEmail: body.customerEmail || body.email,
        customerMobile: body.customerMobile || body.phone,
        redirectUrl: body.redirectUrl,
        pInfo: body.pInfo,
        udf1: body.udf1 || body.notes || body.description,
        udf2: body.udf2,
        udf3: body.udf3,
        items: body.items,
        address: body.address || 'N/A',
        userId: body.userId || null,
      };

      const result = await this.otpService.sendOTP(body.phone || body.customerMobile, orderData);
      return {
        success: true,
        data: {
          otpToken: result.otpToken,
          expiresIn: result.expiresIn,
        },
        message: 'OTP sent successfully',
      };
    } catch (error) {
      throw new HttpException(
        error?.message || 'Failed to send OTP',
        error?.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Endpoint to resend OTP using existing token
  @Post('resend-otp')
  @UseInterceptors(AnyFilesInterceptor())
  async resendOtp(@Body() body: any) {
    try {
      if (!body.otpToken || typeof body.otpToken !== 'string') {
        throw new BadRequestException('otpToken is required');
      }

      const result = await this.otpService.resendOTP(body.otpToken);

      return {
        success: true,
        data: {
          otpToken: result.otpToken,
          expiresIn: result.expiresIn,
        },
        message: 'OTP resent successfully',
      };
    } catch (error) {
      throw new HttpException(
        error?.message || 'Failed to resend OTP',
        error?.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Endpoint to verify OTP and create order
  @Post('verify-otp-and-create')
  @UseInterceptors(AnyFilesInterceptor())
  async verifyOtpAndCreate(@Body() body: any, @Req() req?: Request & { user?: { sub?: string, userId?: string } }) {
    try {
      if (!body.otpToken || typeof body.otpToken !== 'string') {
        throw new BadRequestException('otpToken is required');
      }

      if (!body.otp || typeof body.otp !== 'string') {
        throw new BadRequestException('otp is required');
      }

      // Verify OTP and get order data
      const verification = this.otpService.verifyOTP(body.otpToken, body.otp);

      if (!verification.isValid || !verification.orderData) {
        throw new BadRequestException('Invalid OTP or order data');
      }

      // Get user_id from JWT if available (optional authentication)
      const userId = req?.user?.sub || req?.user?.userId || verification.orderData.userId || null;

      // Create the payment data object
      const paymentData = {
        ...verification.orderData,
        userId: userId,
      };

      return await this.mobalegendsPaymentService.create(paymentData);
    } catch (error) {
      throw new HttpException(
        error?.message || 'Failed to verify OTP and create payment',
        error?.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post()
  @UseInterceptors(AnyFilesInterceptor())
  async create(@Body() body: CreateMobalegendsPaymentDto & { userId?: string }, @Req() req?: Request & { user?: { sub?: string, userId?: string } }) {
    throw new BadRequestException('OTP verification is required. Please use /send-otp and /verify-otp-and-create endpoints.');
  }

  @Get('status/:transactionId')
  async getPaymentStatus(@Param('transactionId') transactionId: string) {
    try {
      // console.log("transactionId",transactionId)
      return await this.mobalegendsPaymentService.getPaymentStatus(transactionId);
    } catch (error) {
      throw new HttpException(
        error?.message || 'Failed to get payment status',
        error?.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getAllPayments() {
    try {
      const payments = await this.mobalegendsPaymentService.getAllPayments();
      return {
        success: true,
        data: payments,
        message: 'Payments fetched successfully',
      };
    } catch (error) {
      throw new HttpException(
        error?.message || 'Failed to fetch payments',
        error?.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Patch('order-delivery/:orderId')
  async updateOrderDelivery(@Param('orderId') orderId: string) {
    try {
      const updated = await this.mobalegendsPaymentService.updateOrderDelivery(orderId);
      return {
        success: true,
        data: updated,
        message: 'Order delivery status updated to Completed',
      };
    } catch (error) {
      throw new HttpException(
        error?.message || 'Failed to update order delivery',
        error?.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('webhook')
  async handleWebhook(@Body() body: any) {
    // verify signature if they supply one
    await this.mobalegendsPaymentService.processWebhook(body);
    return { received: true };
  }
} 