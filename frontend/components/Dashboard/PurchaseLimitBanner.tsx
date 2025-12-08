"use client";
import React, { useEffect, useState } from "react";
import { useGetWeeklyPurchaseStatusQuery } from "@/app/store/api/services/purchaseLimitApi";

export default function PurchaseLimitBanner() {
  const { data, isLoading } = useGetWeeklyPurchaseStatusQuery();
  const [isVisible, setIsVisible] = useState(true);

  const status = data?.data;
  const remainingLimit = status?.remainingLimit || 0;
  const weeklyTotal = status?.weeklyTotal || 0;
  const weeklyLimit = status?.weeklyLimit || 2000;
  const hasHighValue = status?.hasHighValueProduct || false;

  // Calculate percentage
  const percentage = (weeklyTotal / weeklyLimit) * 100;

  // Determine message based on status
  const getMessage = () => {
    if (hasHighValue) {
      return "⚠️ You have already purchased a high-value product (>₹2000) this week. Only one high-value product allowed per week.";
    }
    if (remainingLimit <= 0) {
      return "🚫 Weekly purchase limit of ₹2000 reached. Purchases will reset next week.";
    }
    if (percentage >= 80) {
      return `⚠️ Warning: You have used ${percentage.toFixed(0)}% of your weekly limit (₹${weeklyTotal.toFixed(2)}/₹${weeklyLimit}). Remaining: ₹${remainingLimit.toFixed(2)}`;
    }
    return `💰 Weekly Purchase Limit: ₹${weeklyTotal.toFixed(2)} / ₹${weeklyLimit} (Remaining: ₹${remainingLimit.toFixed(2)})`;
  };

  if (isLoading || !isVisible) {
    return null;
  }

  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 py-2">
      <div className="flex items-center justify-between px-4">
        {/* Sliding Text */}
        <div className="flex-1 overflow-hidden">
          <div className="animate-scroll whitespace-nowrap text-black font-semibold text-sm md:text-base">
            <span className="inline-block">{getMessage()}</span>
          </div>
        </div>
        
        {/* Close Button */}
        <button
          onClick={() => setIsVisible(false)}
          className="ml-4 text-black hover:text-gray-800 font-bold text-lg"
          aria-label="Close banner"
        >
          ×
        </button>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
        <div
          className="h-full bg-black transition-all duration-300"
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
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

