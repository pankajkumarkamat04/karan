import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class PurchaseLimitService {
  private readonly WEEKLY_LIMIT = 2000; // 2000 Rs per week
  private readonly HIGH_VALUE_THRESHOLD = 2000; // Products above 2000 Rs

  constructor(private prisma: PrismaService) { }

  /**
   * Get the start of the current week (Monday)
   */
  private getWeekStart(): Date {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    const weekStart = new Date(now.setDate(diff));
    weekStart.setHours(0, 0, 0, 0);
    return weekStart;
  }

  /**
   * Get the end of the current week (Sunday)
   */
  private getWeekEnd(): Date {
    const weekStart = this.getWeekStart();
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    return weekEnd;
  }

  /**
   * Get the start date for analysis (Last Week + Current Week)
   * Returns the Monday of the previous week.
   */
  private getAnalysisStartDate(): Date {
    const weekStart = this.getWeekStart();
    const analysisStart = new Date(weekStart);
    analysisStart.setDate(analysisStart.getDate() - 7); // Go back 7 days
    return analysisStart;
  }

  /**
   * Calculate total weekly purchases for a user
   */
  async getWeeklyPurchaseTotal(userId: string): Promise<number> {
    if (!userId) {
      return 0;
    }

    const analysisStart = this.getAnalysisStartDate();
    const weekEnd = this.getWeekEnd();

    const payments = await this.prisma.payment.findMany({
      where: {
        user_id: userId,
        status: {
          in: ['SUCCESS', 'COMPLETED', 'PAID', 'success', 'completed', 'paid'], // Only count successful payments
        },
        created_at: {
          gte: analysisStart,
          lte: weekEnd,
        },
        deleted_at: null,
      },
      select: {
        amount: true,
      },
    });

    const total = payments.reduce((sum, payment) => {
      return sum + Number(payment.amount);
    }, 0);

    return total;
  }

  /**
   * Check if user has purchased a high-value product (>2000) this week
   */
  async hasHighValueProductThisWeek(userId: string): Promise<boolean> {
    if (!userId) {
      return false;
    }

    const analysisStart = this.getAnalysisStartDate();
    const weekEnd = this.getWeekEnd();

    const highValuePayments = await this.prisma.payment.findMany({
      where: {
        user_id: userId,
        status: {
          in: ['SUCCESS', 'COMPLETED', 'PAID', 'success', 'completed', 'paid'],
        },
        amount: {
          gt: this.HIGH_VALUE_THRESHOLD,
        },
        created_at: {
          gte: analysisStart,
          lte: weekEnd,
        },
        deleted_at: null,
      },
      take: 1,
    });

    return highValuePayments.length > 0;
  }

  /**
   * Calculate total weekly purchases for a customer by phone number
   */
  async getWeeklyPurchaseTotalByPhone(phone: string): Promise<number> {
    if (!phone) {
      return 0;
    }

    const analysisStart = this.getAnalysisStartDate();
    const weekEnd = this.getWeekEnd();

    const payments = await this.prisma.payment.findMany({
      where: {
        customer_phone: phone,
        status: {
          in: ['SUCCESS', 'COMPLETED', 'PAID', 'success', 'completed', 'paid'],
        },
        created_at: {
          gte: analysisStart,
          lte: weekEnd,
        },
        deleted_at: null,
      },
      select: {
        amount: true,
      },
    });

    const total = payments.reduce((sum, payment) => {
      return sum + Number(payment.amount);
    }, 0);

    return total;
  }

  /**
   * Calculate total weekly purchases for a customer by name (Game User Name)
   */
  async getWeeklyPurchaseTotalByName(name: string): Promise<number> {
    if (!name) {
      return 0;
    }

    const analysisStart = this.getAnalysisStartDate();
    const weekEnd = this.getWeekEnd();

    const payments = await this.prisma.payment.findMany({
      where: {
        customer_name: name,
        status: {
          in: ['SUCCESS', 'COMPLETED', 'PAID', 'success', 'completed', 'paid'],
        },
        created_at: {
          gte: analysisStart,
          lte: weekEnd,
        },
        deleted_at: null,
      },
      select: {
        amount: true,
      },
    });

    const total = payments.reduce((sum, payment) => {
      return sum + Number(payment.amount);
    }, 0);

    return total;
  }

  /**
   * Validate if a purchase can be made
   * @param userId - User ID
   * @param purchaseAmount - Amount of the new purchase
   * @param productPrice - Price of the product being purchased
   * @param customerPhone - Customer Phone Number
   * @param customerName - Customer Name (Game User Name)
   * @returns Object with canPurchase flag and reason
   */
  async validatePurchase(
    userId: string,
    purchaseAmount: number,
    productPrice: number,
    customerPhone?: string,
    customerName?: string,
  ): Promise<{
    canPurchase: boolean;
    reason?: string;
    weeklyTotal: number;
    remainingLimit: number;
  }> {
    const isHighValueProduct = productPrice > this.HIGH_VALUE_THRESHOLD;
    let weeklyTotal = 0;
    let hasHighValue = false;

    // Check by User ID if provided
    if (userId) {
      weeklyTotal = await this.getWeeklyPurchaseTotal(userId);
      hasHighValue = await this.hasHighValueProductThisWeek(userId);
    }

    // Check by Phone Number if provided
    if (customerPhone) {
      const phoneTotal = await this.getWeeklyPurchaseTotalByPhone(customerPhone);
      // Use the higher total to be safe (or separate checks? logic implies "capped by phone")
      // If phone total is higher, it means this phone has been used more potentially by other logged-in users or guests
      if (phoneTotal > weeklyTotal) {
        weeklyTotal = phoneTotal;
      }
    }

    // Check by Customer Name (Game User Name) if provided
    if (customerName) {
      const nameTotal = await this.getWeeklyPurchaseTotalByName(customerName);
      if (nameTotal > weeklyTotal) {
        weeklyTotal = nameTotal;
      }
    }

    const remainingLimit = Math.max(0, this.WEEKLY_LIMIT - weeklyTotal);

    // Rule 1: If user (or phone/name) already purchased a high-value product this week, block new purchases
    // Note: high-value check is currently only robust for logged-in users (userId). 
    // Implementing it for phone/name would require `hasHighValueProductThisWeekByPhone` etc. which is better but keeping it simple for now or strictly following "Cap" which refers to Limit.
    // The instruction "Cap" usually refers to the Limit Amount.
    // However, if we want to be strict, we should check high value for phone/name too.
    // For now, let's enforce the AMOUNT limit strictly across all identifiers.

    // Check Limit Rule
    if (weeklyTotal + purchaseAmount > this.WEEKLY_LIMIT) {
      return {
        canPurchase: false,
        reason: `Weekly purchase limit of ₹${this.WEEKLY_LIMIT} exceeded for this user/device. Remaining limit: ₹${remainingLimit.toFixed(2)}`,
        weeklyTotal,
        remainingLimit,
      };
    }

    // Existing High Value Rules (only applicable if we found a high value purchase for the user)
    // We could extend this to phone/name queries if needed, but 'weeklyTotal' covers the monetary cap.
    // The previous implementation had specific rules for High Value items preventing *any* other purchase?
    // "You can only purchase one product above ₹2000 per week"

    if (userId && hasHighValue && isHighValueProduct) {
      return {
        canPurchase: false,
        reason: 'You can only purchase one product above ₹2000 per week. You have already made a high-value purchase this week.',
        weeklyTotal,
        remainingLimit,
      };
    }

    if (userId && isHighValueProduct && weeklyTotal > 0) {
      return {
        canPurchase: false,
        reason: 'You can only purchase one high-value product (>₹2000) per week. You have already made purchases this week.',
        weeklyTotal,
        remainingLimit,
      };
    }

    if (userId && hasHighValue) {
      return {
        canPurchase: false,
        reason: 'You can only purchase one product above ₹2000 per week. You have already made a high-value purchase this week.',
        weeklyTotal,
        remainingLimit,
      };
    }

    return {
      canPurchase: true,
      weeklyTotal,
      remainingLimit: remainingLimit - purchaseAmount,
    };
  }

  /**
   * Get weekly purchase status for a user
   */
  async getWeeklyPurchaseStatus(userId: string): Promise<{
    weeklyTotal: number;
    weeklyLimit: number;
    remainingLimit: number;
    hasHighValueProduct: boolean;
    weekStart: Date;
    weekEnd: Date;
  }> {
    const weeklyTotal = await this.getWeeklyPurchaseTotal(userId);
    const hasHighValue = await this.hasHighValueProductThisWeek(userId);
    const weekStart = this.getWeekStart();
    const weekEnd = this.getWeekEnd();

    return {
      weeklyTotal,
      weeklyLimit: this.WEEKLY_LIMIT,
      remainingLimit: Math.max(0, this.WEEKLY_LIMIT - weeklyTotal),
      hasHighValueProduct: hasHighValue,
      weekStart,
      weekEnd,
    };
  }
}

