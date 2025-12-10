import { Injectable, BadRequestException } from '@nestjs/common';
import axios from 'axios';
import * as https from 'https';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { PurchaseLimitService } from '../../common/lib/purchase-limit/purchase-limit.service';
import { CreateMobalegendsPaymentDto, PaymentStatus } from './dto/create-mobalegends-payment.dto';
// no querystring needed for JSON payload

@Injectable()
export class MobalegendsPaymentService {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly defaultRedirectUrl: string;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private purchaseLimitService: PurchaseLimitService,
  ) {
    this.apiKey = this.configService.get<string>('MOBILEGENDS_API_KEY') || process.env.MOBILEGENDS_API_KEY;
    this.baseUrl =
      this.configService.get<string>('MOBILEGENDS_API_URL')      // if set in .env
      || 'https://gateway.mobalegends.in/api';                   // default
    this.defaultRedirectUrl = this.configService.get<string>('SUCCESS_REDIRECT_URL') || 'http://localhost:3000/payment/success';

    if (!this.apiKey) {
      throw new Error('MOBILEGENDS_API_KEY is not configured');
    }
  }

  async create(dto) {
    const transactionId =
      dto.client_txn_id ||
      `TXN_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    // console.log("apiKey",this.apiKey)

    // Ensure amount is numeric for gateway & DB
    const rawAmount = dto.amount;
    const numericAmount =
      typeof rawAmount === 'string' ? parseFloat(rawAmount) : rawAmount;
    if (Number.isNaN(numericAmount)) {
      throw new BadRequestException('amount must be a valid number');
    }

    // Normalize customer identity fields regardless of key casing
    const customerName = dto.customerName || dto.name || 'Unknown';
    const customerEmail = dto.customerEmail || dto.email || 'unknown@example.com';
    const customerMobile = dto.customerMobile || dto.phone || '0000000000';
    const customerAddress = dto.address || dto.customer_address || 'N/A';

    const payload = {
      apiKey: this.apiKey,
      amount: numericAmount,
      merchantName: dto.merchantName || 'Khemchand Kishinchand Chandani',
      upiId: dto.upiId || 'paytmqr6ie5mh@ptys',
      client_txn_id: transactionId,
      customerName,
      customerEmail,
      customerMobile,
      redirectUrl: process.env.SUCCESS_REDIRECT_URL || 'http://localhost:3000/payment/success',  // Direct env usage
      pInfo: dto.pInfo || 'Order Payment',
      udf1: dto.udf1,
      udf2: dto.udf2,
      udf3: dto.udf3,
    };
    // console.log("payload",payload)
    // Create an HTTPS agent that ignores SSL errors and allows legacy ciphers
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false, // Bypass SSL certificate verification
      ciphers: 'DEFAULT@SECLEVEL=1', // Allow legacy ciphers
    });

    try {
      const response = await axios.post(
        `${this.baseUrl}/payments/create`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          httpsAgent: httpsAgent,
        },
      );
      // console.log("response",response)
      if (!response.data || response.data.success !== true) {
        throw new BadRequestException(
          response.data?.message || 'Mobalegends Error',
        );
      }

      const { transactionId: orderId } = response.data.data;

      // Build payment items if provided
      let paymentItemsData = [];
      if (dto.items?.length) {
        const productIds = dto.items.map((item) => item.productId);
        const products = await this.prisma.product.findMany({
          where: { id: { in: productIds } },
        });
        const productMap = new Map(products.map((p) => [p.id, p]));

        paymentItemsData = dto.items.map((item) => {
          const product = productMap.get(item.productId);
          if (!product) {
            throw new BadRequestException('Invalid productId: ' + item.productId);
          }
          return {
            productId: item.productId,
            quantity: item.quantity,
            price: product.discountPrice ?? product.regularPrice,
          };
        });
      }

      // Comprehensive Ban Check
      await this.checkIfUserIsBanned(dto.userId, customerEmail, customerMobile);

      // Get the highest product price for validation
      const maxProductPrice = paymentItemsData.length > 0
        ? Math.max(...paymentItemsData.map(item => Number(item.price)))
        : numericAmount;

      const validation = await this.purchaseLimitService.validatePurchase(
        dto.userId,
        numericAmount,
        maxProductPrice,
        customerMobile,
        customerName,
      );

      if (!validation.canPurchase) {
        throw new BadRequestException(validation.reason);
      }

      // console.log(paymentItemsData);
      await this.prisma.payment.create({
        data: {
          order_id: orderId,
          amount: numericAmount,
          currency: 'INR',
          status: PaymentStatus.PENDING,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerMobile,
          customer_address: customerAddress,
          description: dto.notes || 'N/A',
          notes: dto.udf1 || 'N/A',
          user_id: dto.userId || null,
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
        data: response.data.data,
        message: 'Mobalegends payment initiated successfully',
      };
    } catch (err) {
      // Temporary debug logging to inspect gateway responses
      // eslint-disable-next-line no-console
      console.error('Mobalegends create payment error', {
        status: err?.response?.status,
        data: err?.response?.data,
        message: err?.message,
        url: `${this.baseUrl}/payments/create`,
      });
      throw new BadRequestException(
        err?.response?.data?.message || err?.message || 'Mobalegends error',
      );
    }
  }

  async getPaymentStatus(transactionId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { order_id: transactionId },
    });

    if (!payment) {
      throw new BadRequestException('Payment not found');
    }

    // Create an HTTPS agent that ignores SSL errors and allows legacy ciphers
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false,
      ciphers: 'DEFAULT@SECLEVEL=1',
    });

    const response = await axios.get(
      `https://gateway.mobalegends.in/api/payments/status/${transactionId}`,
      { httpsAgent: httpsAgent }
    );

    if (!response.data) {
      throw new BadRequestException('Invalid response from Mobalegends');
    }

    const status =
      response.data.status ||
      response.data.data?.status ||
      response.data?.status;

    let mappedStatus: PaymentStatus = PaymentStatus.PENDING;
    if (status === 'SUCCESS') {
      mappedStatus = PaymentStatus.COMPLETED;
    } else if (status === 'FAILED' || status === 'CANCELLED') {
      mappedStatus = PaymentStatus.FAILED;
    }

    if (
      mappedStatus === PaymentStatus.COMPLETED &&
      payment.status !== PaymentStatus.COMPLETED
    ) {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: mappedStatus },
      });
    }

    return {
      success: true,
      data: {
        status: mappedStatus,
        amount: payment.amount,
        currency: payment.currency,
        created_at: payment.created_at,
        raw_status: status,
      },
      message:
        mappedStatus === PaymentStatus.COMPLETED
          ? 'Payment completed'
          : mappedStatus === PaymentStatus.FAILED
            ? 'Payment failed'
            : 'Payment pending',
    };
  }

  async getAllPayments() {
    return await this.prisma.payment.findMany({
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async updateOrderDelivery(orderId: string) {
    return await this.prisma.payment.update({
      where: { order_id: orderId },
      data: { order_delivery: 'Completed' },
    });
  }

  async processWebhook(payload: any) {
    // Mobalegends is expected to POST something like
    // {
    //   "transactionId": "TXN123456",
    //   "status": "SUCCESS",   // or FAILED / CANCELLED / PENDING / CREATED
    //   "amount": 1000.00,
    //   "utr": "123456789",
    //   ...other fields
    // }
    const { transactionId, status } = payload || {};

    if (!transactionId || !status) {
      // Nothing to do – missing essential data
      return;
    }

    let mappedStatus: PaymentStatus = PaymentStatus.PENDING;
    if (status === 'SUCCESS') mappedStatus = PaymentStatus.COMPLETED;
    else if (status === 'FAILED' || status === 'CANCELLED') mappedStatus = PaymentStatus.FAILED;

    // Update the payment record if it exists and status changed
    await this.prisma.payment.updateMany({
      where: { order_id: transactionId, status: { not: mappedStatus } },
      data: {
        status: mappedStatus,
        utr: payload.utr || undefined,
      },
    });

    return { updated: true };
  }

  /**
   * Check if user is banned by User ID, Email, or Linked Phone
   */
  private async checkIfUserIsBanned(userId?: string, email?: string, phone?: string) {
    // 1. Check by User ID
    if (userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { is_banned: true, ban_reason: true },
      });

      if (user?.is_banned) {
        throw new BadRequestException(
          `Your account has been banned. Reason: ${user.ban_reason || 'Violation of terms'}. Please contact support.`,
        );
      }
    }

    // 2. Check by Email
    if (email) {
      const bannedEmailUser = await this.prisma.user.findFirst({
        where: {
          email: email,
          is_banned: true,
        },
        select: { ban_reason: true },
      });

      if (bannedEmailUser) {
        throw new BadRequestException(
          `Your account (email) has been banned. Reason: ${bannedEmailUser.ban_reason || 'Violation of terms'}. Please contact support.`,
        );
      }
    }

    // 3. Check by Phone (via Payment History Association)
    if (phone) {
      // Find payments made with this phone number that have a user_id
      const linkedPayments = await this.prisma.payment.findMany({
        where: {
          customer_phone: phone,
          user_id: { not: null },
        },
        select: { user_id: true },
        distinct: ['user_id'],
      });

      const linkedUserIds = linkedPayments
        .map((p) => p.user_id)
        .filter((id): id is string => !!id);

      if (linkedUserIds.length > 0) {
        const bannedPhoneUser = await this.prisma.user.findFirst({
          where: {
            id: { in: linkedUserIds },
            is_banned: true,
          },
          select: { ban_reason: true },
        });

        if (bannedPhoneUser) {
          throw new BadRequestException(
            `This phone number is linked to a banned account. Reason: ${bannedPhoneUser.ban_reason || 'Violation of terms'}. Please contact support.`,
          );
        }
      }
    }
  }
} 