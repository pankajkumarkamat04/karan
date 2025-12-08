"use client";
import { useLoginMutation } from "@/app/store/api/services/AuthApi";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/app/store/slices/authSlice";
import Link from "next/link";

const LoginForm = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();

  const onSubmit = async (data: any) => {
    try {
      const userData = await login(data).unwrap();
      dispatch(
        setCredentials({ user: userData, token: userData.authorization.token })
      );
      toast.success("Login successful");
      router.push("/dashboard/products");
    } catch (error: any) {
      // Check if user is banned
      if (error.status === 403 && error.data?.message === "Your account has been banned") {
        const banInfo = error.data;
        const banMessage = [
          "Account Banned",
          banInfo.message,
          banInfo.reason && `Reason: ${banInfo.reason}`,
          "Contact us:",
          banInfo.contact_email && `Email: ${banInfo.contact_email}`,
          banInfo.contact_phone && `Phone: ${banInfo.contact_phone}`,
        ]
          .filter(Boolean)
          .join("\n");
        
        toast.error(banMessage, { duration: 10000 });
      } else {
        toast.error(
          error.data?.message?.message || "Login failed, please try again"
        );
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center  px-4">
      <div className="w-full max-w-md bg-zinc-900 rounded-2xl shadow-lg p-8 border border-amber-300">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Link href="/"><img src="/logo.svg" alt="Logo" className="h-12" /></Link>
        </div>

        {/* Heading */}
        <h2 className="text-center text-2xl font-bold text-white mb-6">
          Welcome Back
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Email
            </label>
            <input
              type="email"
              {...register("email", { required: "Email is required" })}
              className="w-full px-4 py-2 border border-gray-700 rounded-lg focus:outline-none focus:border-[#fada1d] text-white"
            />
            {errors.email && (
              <p className="text-red-500 text-sm">
                {errors.email.message as string}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Password
            </label>
            <input
              type="password"
              {...register("password", { required: "Password is required" })}
              className="w-full px-4 py-2 border border-gray-700 rounded-lg focus:outline-none focus:border-[#fada1d] text-white"
            />
            {errors.password && (
              <p className="text-red-500 text-sm">
                {errors.password.message as string}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#fada1d] text-black font-semibold py-2 rounded-lg hover:bg-yellow-400 transition"
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Contact Information */}
        <div className="mt-6 pt-6 border-t border-gray-700">
          <p className="text-gray-400 text-sm text-center mb-2">Need help?</p>
          <div className="text-gray-400 text-xs text-center space-y-1">
            <div>Email: {process.env.NEXT_PUBLIC_CONTACT_EMAIL || "support@example.com"}</div>
            <div>Phone: {process.env.NEXT_PUBLIC_CONTACT_PHONE || "+1-800-XXX-XXXX"}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
