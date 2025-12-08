//app/store/api/services/paypalAccountApi.tsx

import { baseApi } from '../baseApi';

export interface PaypalAccount {
  id: string;
  account_name: string;
  client_id: string;
  client_secret: string;
  merchant_id?: string;
  email: string;
  environment: 'sandbox' | 'production';
  webhook_id?: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface CreatePaypalAccountDto {
  account_name: string;
  client_id: string;
  client_secret: string;
  email: string;
  environment: 'sandbox' | 'production';
  webhook_id?: string;
}

export interface UpdatePaypalAccountDto {
  account_name?: string;
  client_id?: string;
  client_secret?: string;
  email?: string;
  environment?: 'sandbox' | 'production';
  webhook_id?: string;
}

export interface CreateWebhookDto {
  webhook_url: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const paypalAccountsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPaypalAccounts: builder.query<ApiResponse<PaypalAccount[]>, void>({
      query: () => '/paypal-accounts',
      providesTags: ['PaypalAccount'],
    }),
    getPaypalAccount: builder.query<ApiResponse<PaypalAccount>, string>({
      query: (id) => `/paypal-accounts/${id}`,
      providesTags: ['PaypalAccount'],
    }),
    getActivePaypalAccount: builder.query<ApiResponse<PaypalAccount | null>, void>({
      query: () => '/paypal-accounts/active',
      providesTags: ['PaypalAccount'],
    }),
    createPaypalAccount: builder.mutation<ApiResponse<PaypalAccount>, CreatePaypalAccountDto>({
      query: (data) => ({
        url: '/paypal-accounts',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['PaypalAccount'],
    }),
    updatePaypalAccount: builder.mutation<ApiResponse<PaypalAccount>, { id: string; data: UpdatePaypalAccountDto }>({
      query: ({ id, data }) => ({
        url: `/paypal-accounts/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['PaypalAccount'],
    }),
    deletePaypalAccount: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/paypal-accounts/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['PaypalAccount'],
    }),
    verifyPaypalAccount: builder.mutation<ApiResponse<PaypalAccount>, string>({
      query: (id) => ({
        url: `/paypal-accounts/${id}/verify`,
        method: 'POST',
      }),
      invalidatesTags: ['PaypalAccount'],
    }),
    activatePaypalAccount: builder.mutation<ApiResponse<PaypalAccount>, string>({
      query: (id) => ({
        url: `/paypal-accounts/${id}/activate`,
        method: 'POST',
      }),
      invalidatesTags: ['PaypalAccount'],
    }),
    deactivatePaypalAccount: builder.mutation<ApiResponse<PaypalAccount>, string>({
      query: (id) => ({
        url: `/paypal-accounts/${id}/deactivate`,
        method: 'POST',
      }),
      invalidatesTags: ['PaypalAccount'],
    }),
    createWebhook: builder.mutation<ApiResponse<PaypalAccount>, { id: string; data: CreateWebhookDto }>({
      query: ({ id, data }) => ({
        url: `/paypal-accounts/${id}/webhook`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['PaypalAccount'],
    }),
  }),
});

export const {
  useGetPaypalAccountsQuery,
  useGetPaypalAccountQuery,
  useGetActivePaypalAccountQuery,
  useCreatePaypalAccountMutation,
  useUpdatePaypalAccountMutation,
  useDeletePaypalAccountMutation,
  useVerifyPaypalAccountMutation,
  useActivatePaypalAccountMutation,
  useDeactivatePaypalAccountMutation,
  useCreateWebhookMutation,
} = paypalAccountsApi;