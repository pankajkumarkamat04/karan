import { Controller, Post, Body, Get, Param, Query, HttpException, HttpStatus, BadRequestException, UseGuards, UseInterceptors, Patch, Req } from '@nestjs/common';
import { UpiPaymentService } from './upi-payment.service';
import { CreateUpiPaymentDto } from './dto/create-upi-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guard/role/roles.guard';
import { Role } from 'src/common/guard/role/role.enum';
import { Roles } from 'src/common/guard/role/roles.decorator';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { OtpService } from 'src/common/lib/otp/otp.service';

@Controller('upi-payment')
export class UpiPaymentController {
  constructor(
    private readonly upiPaymentService: UpiPaymentService,
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
        name: body.name,
        email: body.email,
        phone: body.phone,
        address: body.address || 'none',
        amount: body.amount,
        items: body.items,
        userId: body.userId || null,
        description: body.description || 'Payment via form submission',
        notes: body.notes || 'Payment initiated from form endpoint',
      };

      const result = await this.otpService.sendOTP(body.phone, orderData);
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
        message: 'OTP resented successfully',
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

      return await this.upiPaymentService.create(paymentData);
    } catch (error) {
      throw new HttpException(
        error?.message || 'Failed to verify OTP and create payment',
        error?.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Endpoint to create a one-time payment (deprecated - use verify-otp-and-create instead)
  @Post()
  @UseInterceptors(AnyFilesInterceptor())
  async create(@Body() body: any, @Req() req?: Request & { user?: { sub?: string, userId?: string } }) {
    throw new BadRequestException('OTP verification is required. Please use /send-otp and /verify-otp-and-create endpoints.');
  }

  // Endpoint for handling callback after payment (called by the UPI gateway)
  @Get('callback')
  async handleCallback(
    @Query('transaction_id') transactionId: string,
    @Query('status') status: string,
  ) {
    try {
      if (status !== 'success') {
        throw new BadRequestException('Payment failed');
      }
      return await this.upiPaymentService.verifyPayment(transactionId);
    } catch (error) {
      throw new HttpException(
        error?.message || 'Failed to verify payment',
        error?.status || HttpStatus.BAD_REQUEST
      );
    }
  }

  // Endpoint to check the status of a specific payment using transaction ID
  @Get('status/:transactionId')
  async getPaymentStatus(@Param('transactionId') transactionId: string) {
    try {
      return await this.upiPaymentService.getPaymentStatus(transactionId);
    } catch (error) {
      throw new HttpException(
        error?.message || 'Failed to get payment status',
        error?.status || HttpStatus.BAD_REQUEST
      );
    }
  }

  // Endpoint for admin to fetch all payments (restricted to admins)
  @Get('all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getAllPayments(

    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    try {
      const payments = await this.upiPaymentService.getAllPayments({
        page,
        limit,
        status,
        startDate,
        endDate,
      });

      return {
        success: true,
        data: payments,
        message: 'Payments fetched successfully',
      };
    } catch (error) {
      throw new HttpException(
        error?.message || 'Failed to fetch payments',
        error?.status || HttpStatus.BAD_REQUEST
      );
    }
  }

  @Patch('order-delivery/:orderId')
  async updateOrderDelivery(@Param('orderId') orderId: string) {
    try {
      const updated = await this.upiPaymentService.updateOrderDelivery(orderId);
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
}
