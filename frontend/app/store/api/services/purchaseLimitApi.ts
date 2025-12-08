import { baseApi } from "../baseApi";

export interface WeeklyPurchaseStatus {
  weeklyTotal: number;
  weeklyLimit: number;
  remainingLimit: number;
  hasHighValueProduct: boolean;
  weekStart: string;
  weekEnd: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const purchaseLimitApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getWeeklyPurchaseStatus: builder.query<ApiResponse<WeeklyPurchaseStatus>, void>({
      query: () => '/purchase-limit/weekly-status',
      providesTags: ['PurchaseLimit'],
    }),
  }),
});

export const {
  useGetWeeklyPurchaseStatusQuery,
} = purchaseLimitApi;

