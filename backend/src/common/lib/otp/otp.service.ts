import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as https from 'https';
import { PrismaService } from '../../../prisma/prisma.service';

interface OTPData {
  otp: string;
  phone: string;
  expiresAt: number;
  orderData?: any; // Store order data temporarily
}

@Injectable()
export class OtpService {
  private otpStore: Map<string, OTPData> = new Map();
  private readonly otpExpiryMinutes = 5; // OTP expires in 5 minutes
  private readonly oneApiKey: string;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.oneApiKey = this.configService.get<string>('ONEAPI_API_KEY') || process.env.ONEAPI_API_KEY || '';

    if (!this.oneApiKey) {
      console.warn('⚠️  ONEAPI_API_KEY is not configured. OTP sending will fail.');
    }

    // Clean up expired OTPs every minute
    setInterval(() => {
      this.cleanupExpiredOtps();
    }, 60000);
  }

  /**
   * Generate a random 6-digit OTP
   */
  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Check if user (phone or username) is banned
   */
  async checkBannedUser(phone: string, username?: string): Promise<void> {

    const checks = [];

    // Check Phone
    if (phone) {
      checks.push({ type: 'PHONE', value: phone });
    }

    // Check Username
    if (username) {
      checks.push({ type: 'USERNAME', value: username });
    }

    if (checks.length > 0) {
      const banned = await this.prisma.bannedUser.findFirst({
        where: {
          OR: checks
        }
      });

      if (banned) {
        throw new BadRequestException(
          `You are banned from making purchases. Reason: ${banned.reason || 'Violation of terms'}.`
        );
      }
    }
  }

  /**
   * Send OTP to phone number using OneAPI
   */
  async sendOTP(phone: string, orderData?: any): Promise<{ otpToken: string; expiresIn: number }> {
    try {
      // 1. Check if user is banned before sending OTP
      const cleanPhone = phone.replace(/\D/g, '');
      // Use customer_name as the in-game username identifier for banning
      const gameUserName =
        orderData?.customer_name ||
        orderData?.name ||
        orderData?.customerName ||
        orderData?.username;

      await this.checkBannedUser(cleanPhone, gameUserName);

      const otp = this.generateOTP();
      const otpToken = `otp_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      const expiresAt = Date.now() + this.otpExpiryMinutes * 60 * 1000;

      const requestBody = {
        apiKey: this.oneApiKey,
        brandName: "Blox Fruit",
        customerName: "User",
        number: parseInt(cleanPhone), // Remove non-digits and convert to number
        otp: parseInt(otp),
      };

      console.log(`🔄 Sending OTP to ${phone} via OneAPI...`);

      // Create an HTTPS agent that ignores SSL errors and allows legacy ciphers
      const httpsAgent = new https.Agent({
        rejectUnauthorized: false,
        ciphers: 'DEFAULT@SECLEVEL=1', // Allow legacy ciphers
      });

      const response = await axios.post("https://backend.oneapi.in/sms/sendotp", requestBody, {
        headers: {
          "Content-Type": "application/json",
        },
        httpsAgent: httpsAgent,
        timeout: 10000, // 10 second timeout
      });

      const result = response.data;
      console.log(`📱 OneAPI Response for ${phone}:`, {
        status: response.status,
        statusText: response.statusText,
        result: result,
      });

      // Check for successful response
      if (response.status === 200) {
        console.log(`✅ OTP ${otp} sent successfully to ${phone}`);

        // Store OTP data
        this.otpStore.set(otpToken, {
          otp,
          phone: cleanPhone, // Store normalized phone
          expiresAt,
          orderData,
        });

        return {
          otpToken,
          expiresIn: this.otpExpiryMinutes * 60, // Return expiry in seconds
        };
      } else {
        console.error(`❌ OneAPI error for ${phone}:`, result);
        throw new BadRequestException('Failed to send OTP. Please try again.');
      }
    } catch (error) {
      console.error(`❌ Error sending OTP via OneAPI to ${phone}:`, error.message);

      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          console.log(`⏰ OneAPI timeout for ${phone}`);
        }
        console.error('Axios error details:', error.response?.data || error.code);
      }

      throw new BadRequestException(
        error instanceof BadRequestException ? error.message : 'Failed to send OTP. Please try again later.'
      );
    }
  }

  /**
   * Verify OTP
   */
  verifyOTP(otpToken: string, otp: string): { isValid: boolean; orderData?: any } {
    const otpData = this.otpStore.get(otpToken);

    if (!otpData) {
      throw new BadRequestException('Invalid or expired OTP token');
    }

    if (Date.now() > otpData.expiresAt) {
      this.otpStore.delete(otpToken);
      throw new BadRequestException('OTP has expired. Please request a new one.');
    }

    if (otpData.otp !== otp) {
      throw new BadRequestException('Invalid OTP. Please try again.');
    }

    // OTP is valid, remove it from store (one-time use)
    const orderData = otpData.orderData;
    this.otpStore.delete(otpToken);

    return {
      isValid: true,
      orderData,
    };
  }

  /**
   * Resend OTP to the same phone number associated with the token
   */
  async resendOTP(otpToken: string): Promise<{ otpToken: string; expiresIn: number }> {
    const existingData = this.otpStore.get(otpToken);

    if (!existingData) {
      throw new BadRequestException('Invalid or expired OTP token. Please restart the process.');
    }

    // Invalidate the old token to prevent confusion/reuse during the resend process
    // But we need the data, so we kept it in existingData variable.
    this.otpStore.delete(otpToken);

    // Reuse the sendOTP logic but with the existing phone and order data
    // We already have the normalized phone number, so we can use it directly
    return this.sendOTP(existingData.phone, existingData.orderData);
  }

  /**
   * Clean up expired OTPs
   */
  private cleanupExpiredOtps(): void {
    const now = Date.now();
    for (const [token, data] of this.otpStore.entries()) {
      if (now > data.expiresAt) {
        this.otpStore.delete(token);
      }
    }
  }

  /**
   * Get OTP data (for debugging - remove in production)
   */
  getOtpData(otpToken: string): OTPData | undefined {
    return this.otpStore.get(otpToken);
  }
}
