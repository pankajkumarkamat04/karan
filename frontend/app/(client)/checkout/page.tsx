"use client";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import CheckoutForm from "@/components/CheckoutForm/CheckoutForm";
import UpiCheckout from "@/components/CheckoutForm/UpiCheckout";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

const CheckoutPage = () => {
  return (
    <div className="w-full text-white flex items-center justify-center px-4 py-10 rounded-2xl fade-in">
        <UpiCheckout />
    </div>
  );
};

export default CheckoutPage;
