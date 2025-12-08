import { baseApi } from "../baseApi";

export const productApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getProducts: build.query({
      query: () => ({
        url: "/dashboard/products",
        method: "GET",
      }),
      providesTags: ["products"],
    }),

    addProduct: build.mutation({
      query: (formData) => ({
        url: "/dashboard/product",
        method: "POST",
        body: formData,
      }),
    }),

    getProductById: build.query({
      query: (id) => ({
        url: `/dashboard/products/${id}`,
        method: "GET",
      }),
    }),

    updateProduct: build.mutation({
      query: ({id, formData}) => ({
        url: `/dashboard/products/${id}`,
        method: "PATCH",
        body: formData,
      }),
    }),

    deleteProduct: build.mutation({
      query: (id) => ({
        url: `/dashboard/products/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const { useGetProductsQuery, useAddProductMutation, useGetProductByIdQuery, useUpdateProductMutation, useDeleteProductMutation } = productApi;
