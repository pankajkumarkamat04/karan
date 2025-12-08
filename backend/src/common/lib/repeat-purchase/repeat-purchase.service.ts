import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class RepeatPurchaseService {
  private readonly DAILY_LIMIT = 2; // 2 or more orders with same game/phone/email in a day
  private readonly WEEKLY_LIMIT = 5; // 5 or more orders with same game/phone/email in a week

  constructor(private prisma: PrismaService) {}

  /**
   * Get the start of the current day
   */
  private getDayStart(): Date {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  }

  /**
   * Get the end of the current day
   */
  private getDayEnd(): Date {
    const now = new Date();
    now.setHours(23, 59, 59, 999);
    return now;
  }

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
   * Count orders for a user in a specific date range
   */
  private async countOrders(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const count = await this.prisma.payment.count({
      where: {
        user_id: userId,
        created_at: {
          gte: startDate,
          lte: endDate,
        },
        deleted_at: null,
      },
    });

    return count;
  }

  /**
   * Find repeat purchases by email, phone, and game/product
   * Returns orders with same email/phone/game combinations
   */
  private async findRepeatPurchasesByPattern(
    startDate: Date,
    endDate: Date,
    minCount: number,
  ): Promise<Array<{
    customer_email: string;
    customer_phone: string;
    productId: string;
    productName: string;
    gameName: string;
    count: number;
    orders: any[];
  }>> {
    // Get all payments in the date range with their items
    const payments = await this.prisma.payment.findMany({
      where: {
        created_at: {
          gte: startDate,
          lte: endDate,
        },
        deleted_at: null,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    // Group by email + phone + product combination
    const purchaseMap = new Map<string, {
      customer_email: string;
      customer_phone: string;
      productId: string;
      productName: string;
      gameName: string;
      orders: any[];
    }>();

    for (const payment of payments) {
      for (const item of payment.items) {
        const key = `${payment.customer_email.toLowerCase()}_${payment.customer_phone}_${item.productId}`;
        
        if (!purchaseMap.has(key)) {
          purchaseMap.set(key, {
            customer_email: payment.customer_email,
            customer_phone: payment.customer_phone,
            productId: item.productId,
            productName: item.product.name,
            gameName: item.product.games_name,
            orders: [],
          });
        }

        purchaseMap.get(key).orders.push({
          payment_id: payment.id,
          order_id: payment.order_id,
          amount: payment.amount,
          created_at: payment.created_at,
          customer_name: payment.customer_name,
        });
      }
    }

    // Filter by minimum count
    const repeatPurchases = [];
    for (const [key, data] of purchaseMap.entries()) {
      if (data.orders.length >= minCount) {
        repeatPurchases.push({
          ...data,
          count: data.orders.length,
        });
      }
    }

    return repeatPurchases.sort((a, b) => b.count - a.count);
  }

  /**
   * Check if user has repeat purchase pattern
   */
  async checkRepeatPurchase(userId: string): Promise<{
    isRepeatPurchaser: boolean;
    dailyCount: number;
    weeklyCount: number;
    exceedsDailyLimit: boolean;
    exceedsWeeklyLimit: boolean;
    reason?: string;
    dailyPatterns?: any[];
    weeklyPatterns?: any[];
  }> {
    const dayStart = this.getDayStart();
    const dayEnd = this.getDayEnd();
    const weekStart = this.getWeekStart();
    const weekEnd = this.getWeekEnd();

    // Get user's email and phone from payments
    const userPayments = await this.prisma.payment.findFirst({
      where: {
        user_id: userId,
        deleted_at: null,
      },
    });

    if (!userPayments) {
      return {
        isRepeatPurchaser: false,
        dailyCount: 0,
        weeklyCount: 0,
        exceedsDailyLimit: false,
        exceedsWeeklyLimit: false,
      };
    }

    // Find repeat purchase patterns
    const dailyPatterns = await this.findRepeatPurchasesByPattern(
      dayStart,
      dayEnd,
      this.DAILY_LIMIT,
    );

    const weeklyPatterns = await this.findRepeatPurchasesByPattern(
      weekStart,
      weekEnd,
      this.WEEKLY_LIMIT,
    );

    // Filter patterns for this specific user (by email/phone)
    const userDailyPatterns = dailyPatterns.filter(
      (p) =>
        p.customer_email.toLowerCase() === userPayments.customer_email.toLowerCase() ||
        p.customer_phone === userPayments.customer_phone,
    );

    const userWeeklyPatterns = weeklyPatterns.filter(
      (p) =>
        p.customer_email.toLowerCase() === userPayments.customer_email.toLowerCase() ||
        p.customer_phone === userPayments.customer_phone,
    );

    const dailyCount = userDailyPatterns.reduce((sum, p) => sum + p.count, 0);
    const weeklyCount = userWeeklyPatterns.reduce((sum, p) => sum + p.count, 0);

    const exceedsDailyLimit = userDailyPatterns.length > 0;
    const exceedsWeeklyLimit = userWeeklyPatterns.length > 0;

    const isRepeatPurchaser = exceedsDailyLimit || exceedsWeeklyLimit;

    let reason = '';
    if (exceedsDailyLimit && exceedsWeeklyLimit) {
      reason = `User has ${userDailyPatterns.length} repeat purchase pattern(s) today (${dailyCount} orders) and ${userWeeklyPatterns.length} pattern(s) this week (${weeklyCount} orders)`;
    } else if (exceedsDailyLimit) {
      reason = `User has ${userDailyPatterns.length} repeat purchase pattern(s) today (${dailyCount} orders with same game/email/phone)`;
    } else if (exceedsWeeklyLimit) {
      reason = `User has ${userWeeklyPatterns.length} repeat purchase pattern(s) this week (${weeklyCount} orders with same game/email/phone)`;
    }

    return {
      isRepeatPurchaser,
      dailyCount,
      weeklyCount,
      exceedsDailyLimit,
      exceedsWeeklyLimit,
      reason: isRepeatPurchaser ? reason : undefined,
      dailyPatterns: userDailyPatterns,
      weeklyPatterns: userWeeklyPatterns,
    };
  }

  /**
   * Get date range for last N days
   */
  private getLastNDaysRange(days: number): { start: Date; end: Date } {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const start = new Date();
    start.setDate(start.getDate() - days);
    start.setHours(0, 0, 0, 0);
    return { start, end };
  }

  /**
   * Get all users with repeat purchase patterns
   * Shows orders with same game/product + email/phone combinations
   * Checks last 14 days for patterns
   */
  async getRepeatPurchasers(): Promise<
    Array<{
      customer_email: string;
      customer_phone: string;
      customer_name: string;
      productId: string;
      productName: string;
      gameName: string;
      dailyCount: number;
      weeklyCount: number;
      exceedsDailyLimit: boolean;
      exceedsWeeklyLimit: boolean;
      totalOrders: number;
      lastOrderDate: Date | null;
      orders: any[];
      user?: any;
    }>
  > {
    // Check last 14 days instead of just current day/week
    const { start: last14DaysStart, end: last14DaysEnd } = this.getLastNDaysRange(14);

    // Get all payments from last 14 days
    const allPayments = await this.prisma.payment.findMany({
      where: {
        created_at: {
          gte: last14DaysStart,
          lte: last14DaysEnd,
        },
        deleted_at: null,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    // Group by email + phone + product
    const purchaseMap = new Map<string, {
      customer_email: string;
      customer_phone: string;
      productId: string;
      productName: string;
      gameName: string;
      orders: any[];
      dailyCounts: Map<string, number>; // Map of date string to count
      weeklyCounts: Map<string, number>; // Map of week string to count
    }>();

    for (const payment of allPayments) {
      const paymentDate = new Date(payment.created_at);
      const dateKey = paymentDate.toISOString().split('T')[0]; // YYYY-MM-DD
      
      // Get week start date (Monday)
      const weekStart = new Date(paymentDate);
      const day = weekStart.getDay();
      const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1);
      weekStart.setDate(diff);
      weekStart.setHours(0, 0, 0, 0);
      const weekKey = weekStart.toISOString().split('T')[0];

      for (const item of payment.items) {
        const key = `${payment.customer_email.toLowerCase()}_${payment.customer_phone}_${item.productId}`;
        
        if (!purchaseMap.has(key)) {
          purchaseMap.set(key, {
            customer_email: payment.customer_email,
            customer_phone: payment.customer_phone,
            productId: item.productId,
            productName: item.product.name,
            gameName: item.product.games_name,
            orders: [],
            dailyCounts: new Map(),
            weeklyCounts: new Map(),
          });
        }

        const pattern = purchaseMap.get(key);
        pattern.orders.push({
          payment_id: payment.id,
          order_id: payment.order_id,
          amount: payment.amount,
          created_at: payment.created_at,
          customer_name: payment.customer_name,
        });

        // Count per day
        const dailyCount = pattern.dailyCounts.get(dateKey) || 0;
        pattern.dailyCounts.set(dateKey, dailyCount + 1);

        // Count per week
        const weeklyCount = pattern.weeklyCounts.get(weekKey) || 0;
        pattern.weeklyCounts.set(weekKey, weeklyCount + 1);
      }
    }

    // Filter patterns that exceed limits
    const repeatPurchasers = [];
    
    for (const [key, pattern] of purchaseMap.entries()) {
      // Check if any day has 2+ orders
      let maxDailyCount = 0;
      for (const count of pattern.dailyCounts.values()) {
        if (count > maxDailyCount) {
          maxDailyCount = count;
        }
      }

      // Check if any week has 5+ orders
      let maxWeeklyCount = 0;
      for (const count of pattern.weeklyCounts.values()) {
        if (count > maxWeeklyCount) {
          maxWeeklyCount = count;
        }
      }

      const exceedsDailyLimit = maxDailyCount >= this.DAILY_LIMIT;
      const exceedsWeeklyLimit = maxWeeklyCount >= this.WEEKLY_LIMIT;

      // Only include if it exceeds one of the limits
      if (exceedsDailyLimit || exceedsWeeklyLimit) {
        const firstOrder = pattern.orders[0];

        // Try to find user by email
        let user = null;
        if (pattern.customer_email) {
          user = await this.prisma.user.findFirst({
            where: {
              email: pattern.customer_email,
              deleted_at: null,
            },
          });
        }

        repeatPurchasers.push({
          customer_email: pattern.customer_email,
          customer_phone: pattern.customer_phone,
          customer_name: firstOrder?.customer_name || '',
          productId: pattern.productId,
          productName: pattern.productName,
          gameName: pattern.gameName,
          dailyCount: maxDailyCount,
          weeklyCount: maxWeeklyCount,
          exceedsDailyLimit,
          exceedsWeeklyLimit,
          totalOrders: pattern.orders.length,
          lastOrderDate: pattern.orders[0]?.created_at || null,
          orders: pattern.orders,
          user: user ? {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            is_banned: user.is_banned,
            banned_at: user.banned_at,
            ban_reason: user.ban_reason,
            created_at: user.created_at,
          } : null,
        });
      }
    }

    // Sort by total orders descending
    return repeatPurchasers.sort((a, b) => b.totalOrders - a.totalOrders);
  }
}

