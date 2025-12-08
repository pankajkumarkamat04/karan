import { baseApi } from "../baseApi";

export interface RepeatPurchaser {
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
  lastOrderDate: string | null;
  orders: Array<{
    payment_id: string;
    order_id: string;
    amount: number;
    created_at: string;
    customer_name: string;
  }>;
  user?: {
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    is_banned: boolean | null;
    banned_at: string | null;
    ban_reason: string | null;
    created_at: string;
  } | null;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const repeatPurchasersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRepeatPurchasers: builder.query<ApiResponse<RepeatPurchaser[]>, void>({
      query: () => '/admin/repeat-purchasers',
      providesTags: ['RepeatPurchasers'],
    }),
    checkUser: builder.query<ApiResponse<any>, string>({
      query: (userId) => `/admin/repeat-purchasers/${userId}/check`,
      providesTags: ['RepeatPurchasers'],
    }),
    banUser: builder.mutation<ApiResponse<any>, { userId: string; reason?: string }>({
      query: ({ userId, reason }) => ({
        url: `/admin/repeat-purchasers/${userId}/ban`,
        method: 'PATCH',
        body: { reason },
      }),
      invalidatesTags: ['RepeatPurchasers'],
    }),
    banCustomer: builder.mutation<ApiResponse<any>, { 
      customer_email: string; 
      customer_phone: string; 
      customer_name?: string;
      reason?: string;
      userId?: string;
    }>({
      query: (data) => ({
        url: `/admin/repeat-purchasers/ban-customer`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['RepeatPurchasers'],
    }),
    unbanUser: builder.mutation<ApiResponse<any>, string>({
      query: (userId) => ({
        url: `/admin/repeat-purchasers/${userId}/unban`,
        method: 'PATCH',
      }),
      invalidatesTags: ['RepeatPurchasers'],
    }),
  }),
});

export const {
  useGetRepeatPurchasersQuery,
  useCheckUserQuery,
  useBanUserMutation,
  useUnbanUserMutation,
  useBanCustomerMutation,
} = repeatPurchasersApi;

