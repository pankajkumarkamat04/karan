import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateUpiPaymentDto, PaymentStatus } from './dto/create-upi-payment.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { PurchaseLimitService } from '../../common/lib/purchase-limit/purchase-limit.service';
import axios from 'axios';
import * as qs from 'querystring';

interface GetAllPaymentsParams {
  page: number;
  limit: number;
  status?: string;
  startDate?: string;
  endDate?: string;
}


@Injectable()
export class UpiPaymentService {
  private readonly ezUpiApiKey: string;
  private readonly ezUpiApiUrl: string;
  private readonly callbackUrl: string;
  private readonly successRedirectUrl: string;
  private readonly failureRedirectUrl: string;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private purchaseLimitService: PurchaseLimitService,
  ) {
    this.ezUpiApiKey = this.configService.get('EZ_UPI_API_KEY');
    this.ezUpiApiUrl = this.configService.get('EZ_UPI_API_URL') || 'https://ezupi.com/api';
    this.callbackUrl = this.configService.get('CALLBACK_URL');
    this.successRedirectUrl = this.configService.get('SUCCESS_REDIRECT_URL') || 'http://localhost:3000/success';
    this.failureRedirectUrl = this.configService.get('FAILURE_REDIRECT_URL') || 'http://localhost:3000/failure';

    if (!this.ezUpiApiKey) {
      throw new Error('EZ_UPI_API_KEY is not configured');
    }
  }






  // Method to create a one-time payment
  async create(createUpiPaymentDto: any) {
    const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const payload = qs.stringify({
      customerName: createUpiPaymentDto.name,
      customerMobile: createUpiPaymentDto.phone,
      customerEmail: createUpiPaymentDto.email,
      merchantName: createUpiPaymentDto.name,
      apiKey: this.ezUpiApiKey, // Use class property from config
      amount: String(createUpiPaymentDto.amount),
      client_txn_id: transactionId,
      redirectUrl: this.successRedirectUrl,
      // redirect_url2: this.failureRedirectUrl,
      remark1: createUpiPaymentDto.description || 'Payment from form',
      remark2: createUpiPaymentDto.notes || 'UPI Notes',
    });

    const response = await axios.post('https://ezupi.com/api/create-order', payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.data || response.data.status !== true) {
      throw new BadRequestException(response.data?.message || 'EZ-UPI Error');
    }


    const { orderId, payment_url } = response.data.result;


    // Fetch all products for the given productIds
    const productIds = createUpiPaymentDto.items.map(item => item.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } }
    });
    const productMap = new Map(products.map(p => [p.id, p]));

    // Build items with price
    const paymentItemsData = createUpiPaymentDto.items.map(item => {
      const product = productMap.get(item.productId);
      if (!product) throw new BadRequestException('Invalid productId: ' + item.productId);
      return {
        productId: item.productId,
        quantity: item.quantity,
        price: product.discountPrice ?? product.regularPrice, // Use discount if available
      };
    });

    // Check if user is banned
    if (createUpiPaymentDto.userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: createUpiPaymentDto.userId },
        select: { is_banned: true, ban_reason: true },
      });

      if (user?.is_banned) {
        throw new BadRequestException(
          `Your account has been banned. Reason: ${user.ban_reason || 'Violation of terms'}. Please contact support.`,
        );
      }
    }

    // Get the highest product price for validation
    const maxProductPrice = Math.max(
      ...paymentItemsData.map(item => Number(item.price))
    );

    const validation = await this.purchaseLimitService.validatePurchase(
      createUpiPaymentDto.userId,
      Number(createUpiPaymentDto.amount),
      maxProductPrice,
      createUpiPaymentDto.phone,
      createUpiPaymentDto.name,
    );

    if (!validation.canPurchase) {
      throw new BadRequestException(validation.reason);
    }

    // Create payment with items
    const payment = await this.prisma.payment.create({
      data: {
        order_id: orderId || transactionId,
        amount: createUpiPaymentDto.amount,
        currency: 'INR',
        status: 'PENDING',
        customer_name: createUpiPaymentDto.name,
        customer_email: createUpiPaymentDto.email,
        customer_phone: createUpiPaymentDto.phone,
        customer_address: createUpiPaymentDto.address,
        description: createUpiPaymentDto.description,
        notes: createUpiPaymentDto.notes,
        user_id: createUpiPaymentDto.userId || null,
        items: {
          create: paymentItemsData,
        },
      },
      include: {
        items: true,
      },
    });


    return {
      success: true,
      data: response.data.result,
      message: 'UPI payment initiated successfully',
    };
  }

  // Method to verify the payment status
  async verifyPayment(transactionId: string) {
    try {
      const response = await axios.get(
        `${this.ezUpiApiUrl}/check-order-status`,
        {
          params: {
            user_token: this.ezUpiApiKey,
            order_id: transactionId,
          },
          headers: {
            'Authorization': `Bearer ${this.ezUpiApiKey}`,
          }
        }
      );

      const { status } = response.data.result;

      if (status === 'SUCCESS') {
        const payment = await this.prisma.payment.update({
          where: { order_id: transactionId },
          data: { status: PaymentStatus.COMPLETED },
        });

        return {
          success: true,
          data: payment,
          message: 'Payment verified successfully',
        };
      } else {
        throw new BadRequestException('Payment verification failed');
      }
    } catch (error) {
      // console.error('Payment verification error:', error);
      throw new BadRequestException(
        error.response?.data?.message || error.message || 'Failed to verify payment'
      );
    }
  }

  async getPaymentStatus(transactionId: string) {
    try {
      const payment = await this.prisma.payment.findFirst({
        where: { order_id: transactionId },
      });

      // console.log('EZ-UPI Status Response:', payment);
      if (!payment) {
        throw new BadRequestException('Payment not found');
      }

      // Proper form-encoded POST request
      const response = await axios.post(
        'https://ezupi.com/api/check-order-status',
        qs.stringify({
          user_token: this.ezUpiApiKey,
          order_id: transactionId,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      // console.log('EZ-UPI Status Response:', response.data);

      const { status, result, message } = response.data;

      if (!status || !result) {
        throw new BadRequestException('Invalid response from EZ-UPI');
      }

      const txnStatus = result.txnStatus;

      // Update DB only if success
      if (txnStatus === 'SUCCESS' && payment.status !== PaymentStatus.COMPLETED) {
        await this.prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: PaymentStatus.COMPLETED,
            utr: result.utr || undefined, // Optional: Save UTR
          },
        });
      }

      return {
        success: true,
        data: {
          status: txnStatus === 'SUCCESS' ? PaymentStatus.COMPLETED : PaymentStatus.PENDING,
          utr: result.utr || null,
          amount: payment.amount,
          currency: payment.currency,
          created_at: payment.created_at,
        },
        message: txnStatus === 'SUCCESS' ? 'Payment completed' : 'Payment pending',
      };
    } catch (error) {
      // console.error('Check Payment Status Error:', error);
      throw new BadRequestException(
        error?.response?.data?.message ||
        error?.message ||
        'Failed to check payment status'
      );
    }
  }

  async getAllPayments({
    page = 1,
    limit = 10,
    status,
    startDate,
    endDate,
  }: GetAllPaymentsParams) {
    try {
      page = Number(page);
      limit = Number(limit);
      const skip = (page - 1) * limit;

      // Build where clause for filtering
      const where: any = {
        deleted_at: null,
      };

      if (status) {
        where.status = status;
      }

      if (startDate || endDate) {
        where.created_at = {};
        if (startDate) {
          where.created_at.gte = new Date(startDate);
        }
        if (endDate) {
          where.created_at.lte = new Date(endDate);
        }
      }

      // Get total count for pagination
      const total = await this.prisma.payment.count({ where });

      // Get paginated payments
      const data = await this.prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          created_at: 'desc',
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      return {
        data,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new BadRequestException(
        error?.message || 'Failed to fetch payments'
      );
    }
  }

  async updateOrderDelivery(orderId: string) {
    const updated = await this.prisma.payment.update({
      where: { order_id: orderId },
      data: { order_delivery: 'Completed' },
    });
    return updated;
  }
}
