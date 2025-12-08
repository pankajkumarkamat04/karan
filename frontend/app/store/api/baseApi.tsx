import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = process.env.NEXT_PUBLIC_API;

export const baseApi = createApi({
    reducerPath: "api",
    baseQuery:fetchBaseQuery({
        baseUrl,
        prepareHeaders:(headers,api)=>{
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
            if(token){
                headers.set("Authorization",`Bearer ${token}`)
            }
            return headers;
        },
    }),
    endpoints:()=>({}),
    tagTypes:["products","PaypalAccount","PurchaseLimit","RepeatPurchasers","BannedUsers"]

});

export const {useQuery,useMutation} = baseApi as any;
