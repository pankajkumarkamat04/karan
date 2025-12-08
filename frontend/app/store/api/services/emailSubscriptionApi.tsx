import { baseApi } from "../baseApi";

export const emailSubscriptionApi =baseApi.injectEndpoints({
    endpoints: (builder) => ({

        getSubscribers: builder.query({
            query: () => ({
                url: "/admin/subscribe",
                method: "GET",
            }),
        }),

        subscribeToEmail: builder.mutation({
            query: (email) => ({
                url: "/admin/subscribe",
                method: "POST",
                body: email,
            }),
        }),
    }),
})

export const { useSubscribeToEmailMutation, useGetSubscribersQuery } = emailSubscriptionApi;