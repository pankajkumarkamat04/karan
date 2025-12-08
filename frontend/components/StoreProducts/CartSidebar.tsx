import React from "react";
import { IoCart } from "react-icons/io5";
import CartCard from "../ui/CartCard/CartCard";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/store/store";
import { clearCart } from "@/app/store/slices/cartSlice";
import { useRouter } from "next/navigation";

export default function CartSidebar() {
  const router = useRouter();
  const dispatch = useDispatch();
  const cartItems = useSelector((state: RootState) => state.cart.cartItems);
  // Ensure cartItems is always an array
  const safeCartItems = Array.isArray(cartItems) ? cartItems : [];
  const totalPrice = safeCartItems.reduce(
    (acc, item) => acc + (item.price || 0) * (item.quantity || 0),
    0
  );

  const handleCheckout = () => {
    router.push(`/checkout?total=${totalPrice.toFixed(2)}`);
  };

  return (
    <div>
      <div>
        <div className="text-white flex justify-between items-center mb-4">
          <p className="flex gap-3 items-center">
            <IoCart size={24} /> Cart
          </p>
          <button
            onClick={() => dispatch(clearCart())}
            className="text-[#FADA1B] text-sm hover:underline"
          >
            Clear All
          </button>
        </div>
        {/* Cart Card */}
        {safeCartItems.length === 0 ? (
          <div className="text-white text-center h-96 flex justify-center items-center">
            <p>No items in cart</p>
          </div>
        ) : (
          <div className="space-y-4 h-[50vh] overflow-y-auto custom-scroll pr-2">
            {safeCartItems.map((item) => (
              <CartCard key={item.id} id={item.id} />
            ))}
          </div>
        )}
      </div>
      {/* Checkout */}
      {safeCartItems.length > 0 ? (
        <div>
          <div className="flex justify-between items-center my-5">
            <p className="text-[#FADA1B]">Total</p>
            <p className="text-white">₹{totalPrice.toFixed(2)}</p>
          </div>
          <button
            onClick={handleCheckout}
            className="w-full flex justify-center items-center grad-btn hover:opacity-90 text-black px-8 py-3 font-medium text-base cursor-pointer duration-300 hover:brightness-150"
          >
            Checkout
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              className="ml-2"
            >
              <path
                d="M4 11V13H16V15H18V13H20V11H18V9H16V11H4ZM14 7H16V9H14V7ZM14 7H12V5H14V7ZM14 17H16V15H14V17ZM14 17H12V19H14V17Z"
                fill="#0F1016"
              />
            </svg>
          </button>
        </div>
      ) : (
        ""
      )}
    </div>
  );
}
