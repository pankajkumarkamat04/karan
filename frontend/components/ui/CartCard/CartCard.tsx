"use client";
import Image from "next/image";
import React from "react";
import cardBg from "@/public/mainCardImages/card-bg.png";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/store/store";
import { decrementQty, incrementQty } from "@/app/store/slices/cartSlice";

export default function CartCard({ id }: { id: string }) {
  const dispatch = useDispatch();
  const cartItem = useSelector((state: RootState) =>
    state.cart.cartItems.find((item) => item.id === id)
  );
  
  if (!cartItem) return null;
  
 

  console.log(cartItem);
  return (
    <div className="flex items-center justify-between bg-[#0c0c09] text-white rounded-xl p-4 shadow-inner w-full lg:max-w-md ">
      {/* Image */}
      <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-amber-300">
        <div
          className="absolute inset-0 bg-cover bg-no-repeat mix-blend-color-burn z-0"
          style={{
            backgroundImage: `url(${cardBg.src})`,
          }}
        ></div>

        <img
          crossOrigin="anonymous"
          src={cartItem?.image || ""}
          alt="Product"
          width={500}
          height={500}
          className="relative z-10 w-full h-full object-cover"
        />
      </div>

      {/* Details */}
      <div className="flex-1 px-4">
        <h4 className="text-sm font-semibold leading-tight uppercase">
          {cartItem.name}
        </h4>
        <p className="text-yellow-400 text-sm mt-1">₹{cartItem.price} per ps</p>
      </div>

      {/* Quantity controls */}
      <div className="flex flex-col items-center gap-1">
        <button onClick={()=>dispatch(incrementQty(id))} className="w-6 h-6 text-black bg-white rounded border border-white hover:bg-yellow-300 transition text-sm font-bold">
          +
        </button>
        <span className="text-sm font-bold">{cartItem.quantity}</span>
        <button onClick={()=>dispatch(decrementQty(id))} className="w-6 h-6 text-yellow-400 border border-yellow-400 rounded hover:bg-yellow-400 hover:text-black transition text-sm font-bold">
          -
        </button>
      </div>
    </div>
  );
}
