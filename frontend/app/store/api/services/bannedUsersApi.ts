import { baseApi } from "../baseApi";

export interface BannedUser {
  id: string;
  type: "EMAIL" | "PHONE" | "USERNAME";
  value: string;
  reason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BannedUsersResponse {
  all: BannedUser[];
  grouped: {
    EMAIL: BannedUser[];
    PHONE: BannedUser[];
    USERNAME: BannedUser[];
  };
  total: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const bannedUsersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBannedUsers: builder.query<ApiResponse<BannedUsersResponse>, void>({
      query: () => "/admin/banned-users",
      providesTags: ["BannedUsers"],
    }),
    unbanUser: builder.mutation<ApiResponse<any>, string>({
      query: (id) => ({
        url: `/admin/banned-users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["BannedUsers"],
    }),
    unbanByValue: builder.mutation<
      ApiResponse<any>,
      { type: string; value: string }
    >({
      query: ({ type, value }) => ({
        url: `/admin/banned-users/by-value/${type}/${encodeURIComponent(value)}`,
        method: "DELETE",
      }),
      invalidatesTags: ["BannedUsers"],
    }),
  }),
});

export const {
  useGetBannedUsersQuery,
  useUnbanUserMutation,
  useUnbanByValueMutation,
} = bannedUsersApi;

