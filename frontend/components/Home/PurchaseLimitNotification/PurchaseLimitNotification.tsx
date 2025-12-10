"use client";
import React from "react";

const message =
  "Weekly purchases are capped at ₹2,000. Want a higher limit? Join our Discord and complete KYC to unlock upgrades!";

export default function PurchaseLimitNotification() {
  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 py-3 px-4 shadow-lg">
      <div className="flex items-center justify-center">
        <div className="flex-1 overflow-hidden">
          <div className="animate-scroll whitespace-nowrap text-black font-semibold text-sm md:text-base">
            <span className="inline-block">{message}</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        .animate-scroll {
          animation: scroll 20s linear infinite;
        }
      `}</style>
    </div>
  );
}

