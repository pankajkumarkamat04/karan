import { baseApi } from "../baseApi";

export const AuthApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        login: build.mutation({
            query: (data) => ({
                url: "/auth/login",
                method: "POST",
                body: data,
            }),
        }),
    }),
})

export const { useLoginMutation } = AuthApi;