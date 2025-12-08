"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Image from "next/image";
import { PlusIcon } from "lucide-react";
import { IoMdPhotos } from "react-icons/io";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  useAddProductMutation,
  useGetProductByIdQuery,
  useGetProductsQuery,
  useUpdateProductMutation,
} from "@/app/store/api/services/productApi";
import { useDispatch } from "react-redux";
import { syncCartWithProduct } from "@/app/store/slices/cartSlice";

type FormValues = {
  name: string;
  type: string;
  category: string;
  regularPrice: number;
  showDiscount: boolean;
  discountPrice?: number;
  image?: FileList;
  games_name?: string;
};

// Game-category mapping
const gameCategories = {
  "blox-fruits": [
    "Permanent Fruit",
    "Gamepass",
    "Others"
  ],
  "rivals": [
    "Best Sellers",
    "Bundles",
    "Keys",
    "Others"
  ],
  "blue-lock-rivals": [
    "Gamepass",
    "Styles",
    "Flows"
  ],
  "combat-warrior": [
    "Gamepass",
    "Aether",
    "Credits"
  ],
  "anime-reborn": [
    "Gamepass",
    "Shards",
    "Keys",
    "Stones",
    "Potions",
    "Gold",
    "Gems"
  ]
};

export default function FruitForm({ id }: { id: any }) {
  console.log(id, "id");
  const router = useRouter();
  const dispatch = useDispatch();
  const { data: products, refetch } = useGetProductsQuery(undefined);

  const [addProduct, { isLoading }] = useAddProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const { data: product, isLoading: isLoadingProduct, refetch: refetchProduct } =
    useGetProductByIdQuery(id, { skip: !id });
  const { register, handleSubmit, watch, reset, setValue } =
    useForm<FormValues>();
  const showDiscount = watch("showDiscount");
  const selectedGame = watch("games_name");
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);

  // Get categories for selected game
  const getCategoriesForGame = (gameName: string) => {
    return gameCategories[gameName as keyof typeof gameCategories] || [];
  };

  const onImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setValue("image", e.target.files as FileList);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setSelectedFile(null);
      setPreview(null);
      setValue("image", undefined);
    }
  };

  useEffect(() => {
    if (product) {
      setValue("name", product.data.name);
      setValue("type", product.data.type);
      setValue("regularPrice", product.data.regularPrice);
      setValue("games_name", product.data.games_name);
      setValue("category", product.data.category);

      // Handle discount price
      if (product.data.discountPrice) {
        setValue("showDiscount", true);
        setValue("discountPrice", product.data.discountPrice);
      }

      // Handle existing image
      if (product.data.imageUrl) {
        setExistingImageUrl(product.data.imageUrl);
        setPreview(product.data.imageUrl);
      }
    }
  }, [product, setValue]);

  // Reset category when game changes
  useEffect(() => {
    if (selectedGame && !id) {
      setValue("category", "");
    }
  }, [selectedGame, setValue, id]);

  const onSubmit = async (data: FormValues) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("type", data.type);
    formData.append("category", data.category);
    formData.append("regularPrice", data.regularPrice.toString());
    formData.append("games_name", data.games_name || "");

    if (data.discountPrice) {
      formData.append("discountPrice", data.discountPrice.toString());
    }
    if (selectedFile) {
      formData.append("image", selectedFile);
    }

    console.log("FormData contents:");
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    try {
      const res = id
        ? await updateProduct({ id, formData })
        : await addProduct(formData);
      console.log(res);

      if (res.data?.success) {
        toast.success(
          id ? "Product updated successfully!" : "Product added successfully!"
        );
        if (id) {
          // Sync cart with updated product details
          // Refetch the product to get the latest data including image URL
          const updatedProductData = await refetchProduct();
          if (updatedProductData.data?.data) {
            const updatedProduct = updatedProductData.data.data;
            const finalPrice = updatedProduct.discountPrice || updatedProduct.regularPrice;
            const finalImage = updatedProduct.imageUrl || existingImageUrl || preview || "";
            
            dispatch(syncCartWithProduct({
              id: id,
              name: data.name,
              price: finalPrice,
              image: finalImage,
            }));
          } else {
            // Fallback: use form data if refetch fails
            const finalPrice = data.discountPrice || data.regularPrice;
            const finalImage = preview || existingImageUrl || "";
            
            dispatch(syncCartWithProduct({
              id: id,
              name: data.name,
              price: finalPrice,
              image: finalImage,
            }));
          }
          
          router.push("/dashboard/products");
          refetch();
        } else {
          reset();
          setPreview(null);
          setSelectedFile(null);
          setExistingImageUrl(null);
          refetch();
        }
      } else {
        toast.error("Unauthorized");
      }
    } catch (error: any) {
      console.error("Error submitting form:", error);
      toast.error("An error occurred during submission.");
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-2 text-yellow-500">
        {id ? "Update Fruit" : "Add New Fruit"}
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className=" bg-[#09090b] p-4">
          <div className="xl:w-1/3 rounded-xl mb-2">
            <label className="block mb-2 text-[#fada1d]">Image Upload</label>

            <label
              htmlFor="imageUpload"
              className="cursor-pointer w-full max-w-sm border-1 border-dashed border-[#fad91d67] rounded-lg p-6 flex flex-col items-center justify-center text-yellow-400 hover:bg-zinc-900 transition text-center"
            >
              {preview ? (
                <img
                  loading="lazy"
                  crossOrigin="anonymous"
                  src={preview}
                  alt="Preview"
                  width={160}
                  height={150}
                  className="rounded object-cover"
                />
              ) : (
                <>
                  <div className="text-3xl mb-2">
                    <IoMdPhotos />
                  </div>
                  <p className="text-sm font-medium">Click to browse</p>
                  <p className="text-xs text-gray-400">
                    Recommended size: 600 × 400px
                  </p>
                </>
              )}
            </label>

            <input
              id="imageUpload"
              type="file"
              accept="image/*"
              onChange={onImageChange}
              className="hidden"
              required={!id}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
            <div>
              <label className="block mb-2 text-[#fada1d]">Name</label>
              <input
                {...register("name")}
                placeholder="Fruit Name"
                required
                className="w-full border border-[#fad91d67] focus:outline-none text-yellow-600 rounded px-4 py-3"
              />
            </div>
            <div>
              <label className="block mb-2 text-[#fada1d]">Type</label>
              <select
                {...register("type")}
                required
                className="w-full border border-[#fad91d67] focus:outline-none text-yellow-600 rounded px-4 py-[15px] bg-[#09090b]"
              >
                <option value="">Select Type</option>
                <option value="rare">Rare</option>
                <option value="common">Common</option>
                <option value="uncommon">Uncommon</option>
                <option value="legendary">Legendary</option>
                <option value="mythical">Mythical</option>
              </select>
            </div>
            <div>
              <label className="block mb-2 text-[#fada1d]">Games</label>
              <select
                {...register("games_name")}
                required
                className="w-full border border-[#fad91d67] focus:outline-none text-yellow-600 rounded px-4 py-[15px] bg-[#09090b]"
              >
                <option value="">Select Games</option>
                <option value="blox-fruits">Blox Fruits</option>
                <option value="blue-lock-rivals">Blue Lock Rivals</option>
                <option value="rivals">Rivals</option>
                <option value="combat-warrior">Combat Warrior</option>
                <option value="anime-reborn">Anime Reborn</option>
              </select>
            </div>
            <div>
              <label className="block mb-2 text-[#fada1d]">Category</label>
              <select
                {...register("category")}
                required
                disabled={!selectedGame && !id}
                className="w-full border border-[#fad91d67] focus:outline-none text-yellow-600 rounded px-4 py-[15px] bg-[#09090b] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">
                  {selectedGame ? "Select Category" : id ? "Select Category" : "Select Game First"}
                </option>
                {(selectedGame || (id && product?.data.games_name)) && 
                  getCategoriesForGame(selectedGame || product?.data.games_name || "").map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))
                }
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block mb-2 text-[#fada1d]">Regular Price</label>
              <input
                type="number"
                step="0.01"
                placeholder="Price"
                {...register("regularPrice")}
                required
                className="w-full border border-[#fad91d67] focus:outline-none text-yellow-600 rounded px-4 py-3 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-4 mt-6">
                <input
                  type="checkbox"
                  {...register("showDiscount")}
                  className="w-5 h-5 accent-[#FADA1B] border-yellow-200 border-2 rounded-md bg-red-500 "
                />
                <label className="text-[#fada1d]">Show Discount Price</label>
              </div>

              {showDiscount && (
                <div>
                  <label className="block mb-2 text-[#fada1d]">
                    Discount Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Discount Price"
                    {...register("discountPrice")}
                    className="w-full border border-[#fad91d67] focus:outline-none text-yellow-600 rounded px-4 py-3 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading || isUpdating}
            className="flex items-center gap-2 p-2 w-fit bg-[#fada1d] text-gray-900 font-bold py-3 rounded hover:brightness-125 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PlusIcon className="w-4 h-4 text-2xl" />
            {id ? (
              <span className="">{isUpdating ? "Updating..." : "Update"}</span>
            ) : (
              <span className="">{isLoading ? "Adding..." : "Add Fruit"}</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
