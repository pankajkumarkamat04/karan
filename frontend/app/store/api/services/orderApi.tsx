import { baseApi } from "../baseApi";


export const orderApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getOrders: builder.query({
            query: (params?: { page?: number; limit?: number }) => ({
                url: "/upi-payment/all",
                method: "GET",
                params: {
                    page: params?.page || 1,
                    limit: params?.limit || 10,
                },
            }),
        }),

        updateOrderStatus: builder.mutation({
            query: ({ order_id, status }) => ({
                url: `/upi-payment/order-delivery/${order_id}`,
                method: "PATCH",
                body: { status },
            }),
        }),

        banOrder: builder.mutation({
            query: ({ orderId, reason }) => ({
                url: `/dashboard/ban-order/${orderId}`,
                method: "POST",
                body: { reason },
            }),
        }),
    }),
});

export const { useGetOrdersQuery, useUpdateOrderStatusMutation, useBanOrderMutation } = orderApi;
