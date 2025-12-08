import { baseApi } from "../baseApi";

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

export const paymentApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        createPaymentIntent: build.mutation({
            query: (formData) => ({
                url: "/mobalegends-payment/verify-otp-and-create",
                method: "POST",
                body: formData,
            }),
        }),
        sendOtpForMobalegendsPayment: build.mutation<SendOtpResponse, SendOtpRequest>({
            query: (data) => ({
                url: "/mobalegends-payment/send-otp",
                method: "POST",
                body: data,
            }),
        }),
        verifyOtpAndCreateMobalegendsPayment: build.mutation<any, VerifyOtpAndCreateRequest>({
            query: (data) => ({
                url: "/mobalegends-payment/verify-otp-and-create",
                method: "POST",
                body: data,
            }),
        }),
        resendOtpForMobalegendsPayment: build.mutation<SendOtpResponse, { otpToken: string }>({
            query: (data) => ({
                url: "/mobalegends-payment/resend-otp",
                method: "POST",
                body: data,
            }),
        }),
        sendOtpForUpiPayment: build.mutation<SendOtpResponse, SendOtpRequest>({
            query: (data) => ({
                url: "/upi-payment/send-otp",
                method: "POST",
                body: data,
            }),
        }),
        verifyOtpAndCreateUpiPayment: build.mutation<any, VerifyOtpAndCreateRequest>({
            query: (data) => ({
                url: "/upi-payment/verify-otp-and-create",
                method: "POST",
                body: data,
            }),
        }),
        resendOtpForUpiPayment: build.mutation<SendOtpResponse, { otpToken: string }>({
            query: (data) => ({
                url: "/upi-payment/resend-otp",
                method: "POST",
                body: data,
            }),
        }),
    }),
})

export const {
    useCreatePaymentIntentMutation,
    useSendOtpForMobalegendsPaymentMutation,
    useVerifyOtpAndCreateMobalegendsPaymentMutation,
    useSendOtpForUpiPaymentMutation,
    useVerifyOtpAndCreateUpiPaymentMutation,
    useResendOtpForUpiPaymentMutation,
    useResendOtpForMobalegendsPaymentMutation,
} = paymentApi;
