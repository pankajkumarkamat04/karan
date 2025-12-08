//app/components/CheckoutForm/CheckoutForm.tsx;
"use client";

import { useForm, Controller } from "react-hook-form";
import bannerbackground from "@/public/images/bannerbackground.png";
import paypal from "@/public/paypal.png";
import gpay from "@/public/gpay.png";
import acceptPayment from "@/public/accept-payment.png";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

interface FormValues {
  username: string;
  email: string;
  fullName: string;
  mobile: string;
}

export default function CheckoutForm() {
  const searchParams = useSearchParams();
  const total = searchParams.get('total') || '0.00';

  const {
    control,
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<FormValues>();
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: FormValues) => {
    if (!stripe || !elements) return;

    setLoading(true);
    const card = elements.getElement(CardElement);
    if (!card) return;

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card,
      billing_details: {
        name: data.fullName,
        email: data.email,
        
      },
    });

    if (error) {
      console.error(error.message);
      setLoading(false);
      return;
    }

    console.log("Submitted:", { ...data, paymentMethodId: paymentMethod.id });
    setLoading(false);
  };

  return (
    <div
      className="max-w-[1320px] mx-auto text-white flex items-center justify-center bg-cover bg-center relative "
      style={{
        backgroundImage: `url(${bannerbackground.src})`,
      }}
    >
      <div className="absolute inset-0 bg-black/60 z-0"></div>
      <div className="w-full  bg-[#0a0a0a00] p-8 sm:p-10-lg shadow-lg space-y-8 z-20">
        <h2 className="text-[1.2rem] sm:text-[2.5rem] font-medium text-center bg-gradient-to-r from-yellow-400 to-yellow-100 text-transparent bg-clip-text tracking-wide uppercase">
          Express Checkout
        </h2>

        {/* Total Amount Display */}
        <div className="text-center mb-8">
          <p className="text-lg text-[#FADA1B]">Total Amount to Pay</p>
          <p className="text-3xl font-bold text-white">${total}</p>
        </div>

        <div className="flex justify-center gap-3">
          <button className="bg-yellow-400 text-white px-5 py-2 font-semibold rounded-lg cursor-pointer">
            <Image src={paypal} alt="paypal" width={80} height={80} />
          </button>
          <button className="bg-white text-black px-5 py-2 font-semibold rounded-lg cursor-pointer">
            <Image src={gpay} alt="gpay" width={80} height={80} />
          </button>
        </div>

        <div className="flex items-center">
          <hr className="w-full rgb-border scale-x-[-1]" />
          <p className="text-lg text-white font-medium px-2 uppercase">Or</p>
          <hr className="w-full rgb-border" />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Client Info */}
          <div className="space-y-4 mb-10">
            <h1 className="text-lg">Client Information</h1>
            <div className="sm:flex items-center">
              <label className="block text-sm font-semibold w-52 sm:pl-6 py-[17.5px] sm:border-b rgb-border-checkout">
                Roblox Username
              </label>
              <input
                {...register("username", { required: true })}
                placeholder="Enter your username"
                className="w-full px-4 py-4 bg-gradient-to-l to-[#fada1b26]  from-[#594d0026] text-yellow-400 placeholder-yellow-400 outline-none"
              />
            </div>
            <div className="sm:flex items-center">
              <label className="block text-sm font-semibold w-52 sm:pl-6 py-[17.5px] sm:border-b rgb-border-checkout">
                Contact
              </label>
              <input
                {...register("email", { required: true })}
                placeholder="Enter your email here"
                className="w-full px-4 py-4 bg-gradient-to-l to-[#fada1b26]  from-[#594d0026] text-yellow-400 placeholder-yellow-400 outline-none"
              />
            </div>
          </div>
          {/* Payment */}
          <div className="space-y-4 mb-10">
            <div className="flex items-center justify-between">
              <h1 className="text-lg">Payment</h1>
              <Image src={acceptPayment} alt="acceptPayment" width={200} height={20} />
            </div>
            <div className="sm:flex items-center">
              <label className="block text-sm font-semibold w-52 sm:pl-6 py-3.5 sm:border-b rgb-border-checkout">
                <span>Credit Card Number</span>
              </label>
              <div className="p-4 bg-gradient-to-l to-[#fada1b26] from-[#594d0026] w-full">
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <CardElement
                      id="card-element"
                      options={{
                        style: {
                          base: {
                            fontSize: "16px",
                            color: "#facc15",
                            "::placeholder": { color: "#9ca3af" },
                          },
                          invalid: { color: "#ef4444" },
                        },
                      }}
                      onChange={(e) => field.onChange(e.complete)}
                    />
                  )}
                />
              </div>
            </div>
          </div>
          {/* Personal Information */}
          <div className="space-y-4 mb-10">
            <h1 className="text-lg">Personal Information</h1>
            <div className="sm:flex items-center">
              <label className="block text-sm font-semibold w-52 sm:pl-6 py-[17.5px] sm:border-b rgb-border-checkout">
                Full Name
              </label>
              <input
                {...register("fullName", { required: true })}
                placeholder="Enter your full name here"
                className="w-full px-4 py-4 bg-gradient-to-l to-[#fada1b26]  from-[#594d0026] text-white placeholder-gray-300 outline-none"
              />
            </div>
            <div className="sm:flex items-center">
              <label className="block text-sm font-semibold w-52 sm:pl-6 py-[17.5px] sm:border-b rgb-border-checkout">
                Mobile Number
              </label>
              <input
                {...register("mobile", { required: true })}
                placeholder="Enter your mobile number here"
                className="w-full px-4 py-4 bg-gradient-to-l to-[#fada1b26]  from-[#594d0026] text-white placeholder-gray-300 outline-none"
              />
            </div>
          </div>
          {/* Submit */}
          <button
            type="submit"
            className="w-full flex items-center justify-center font-bold grad-btn hover:opacity-90 text-black px-8 py-3  text-base cursor-pointer duration-300 hover:brightness-150"
          >
            {loading ? "Processing..." : `Pay $${total} Now`}
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
          <p className="text-xs text-center text-gray-400">
            Your info will be saved to a Shop account. By continuing, you agree
            to Shop's{" "}
            <a href="#" className="underline text-yellow-400">
              Terms of Service
            </a>{" "}
            and acknowledge the{" "}
            <a href="#" className="underline text-yellow-400">
              Privacy Policy
            </a>
            .
          </p>
        </form>
      </div>
    </div>
  );
}
