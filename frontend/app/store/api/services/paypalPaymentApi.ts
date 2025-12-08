//app/store/api/services/paypalPaymentApi.ts

import { baseApi } from '../baseApi';

export interface PaymentIntentDto {
  name: string;
  email: string;
  phone: string;
  address: string;
  amount: string | number;
  description?: string;
  notes?: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
}

export interface PaypalPaymentDto extends PaymentIntentDto {}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaymentIntentResponse {
  paymentUrl: string;
  transactionId: string;
}

export interface PaypalPaymentResponse {
  approval_url?: string;
  paymentUrl?: string;
  payment_id?: string;
  order_id?: string;
  transactionId?: string;
}

export interface PaymentStatusResponse {
  status: string;
  amount: number;
  currency: string;
  created_at: string;
  raw_status?: string;
}

export interface SendOtpRequest {
  phone: string;
  name?: string;
  email?: string;
  address?: string;
  amount: string | number;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  userId?: string | null;
  description?: string;
  notes?: string;
}

export interface SendOtpResponse {
  success: boolean;
  data: {
    otpToken: string;
    expiresIn: number;
  };
  message: string;
}

export interface VerifyOtpAndCreateRequest {
  otpToken: string;
  otp: string;
}

export const paypalPaymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Send OTP for PayPal payment (uses UPI endpoint)
    sendOtpForPaypalPayment: builder.mutation<SendOtpResponse, SendOtpRequest>({
      query: (data) => ({
        url: '/upi-payment/send-otp',
        method: 'POST',
        body: data,
      }),
    }),
    // Verify OTP and create PayPal payment
    verifyOtpAndCreatePaypalPayment: builder.mutation<ApiResponse<PaypalPaymentResponse>, VerifyOtpAndCreateRequest>({
      query: (data) => ({
        url: '/upi-payment/verify-otp-and-create',
        method: 'POST',
        body: data,
      }),
    }),
    // New PayPal payment endpoint (deprecated - use OTP flow instead)
    createPaypalPayment: builder.mutation<ApiResponse<PaypalPaymentResponse>, PaypalPaymentDto>({
      query: (data) => ({
        url: '/upi-payment/verify-otp-and-create',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  useCreatePaypalPaymentMutation,
  useSendOtpForPaypalPaymentMutation,
  useVerifyOtpAndCreatePaypalPaymentMutation,
} = paypalPaymentApi;
