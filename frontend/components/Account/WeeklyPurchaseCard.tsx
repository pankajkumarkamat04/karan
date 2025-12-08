"use client";
import React from "react";
import { useGetWeeklyPurchaseStatusQuery } from "@/app/store/api/services/purchaseLimitApi";

export default function WeeklyPurchaseCard() {
  const { data, isLoading } = useGetWeeklyPurchaseStatusQuery();

  if (isLoading) {
    return (
      <div className="bg-[#191817] rounded-lg p-6 border border-[#2a2927]">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  const status = data?.data;
  if (!status) {
    return null;
  }

  const { weeklyTotal, weeklyLimit, remainingLimit, hasHighValueProduct, weekStart, weekEnd } = status;
  const percentage = (weeklyTotal / weeklyLimit) * 100;

  // Format dates
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-[#191817] rounded-lg p-6 border border-[#2a2927]">
      <h3 className="text-[#FADA1B] text-xl font-semibold mb-4">Weekly Purchase Limit</h3>
      
      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-white text-sm">Spent this week</span>
          <span className="text-white text-sm font-medium">
            ₹{weeklyTotal.toFixed(2)} / ₹{weeklyLimit}
          </span>
        </div>
        <div className="w-full bg-[#2a2927] rounded-full h-3 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 rounded-full ${
              percentage >= 100
                ? 'bg-red-500'
                : percentage >= 80
                ? 'bg-yellow-500'
                : 'bg-[#FADA1B]'
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-gray-400 text-xs">
            Week: {formatDate(weekStart)} - {formatDate(weekEnd)}
          </span>
          <span className={`text-sm font-medium ${
            remainingLimit <= 0 ? 'text-red-400' : 'text-green-400'
          }`}>
            Remaining: ₹{remainingLimit.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Status Messages */}
      <div className="space-y-2">
        {hasHighValueProduct && (
          <div className="bg-yellow-500/20 border border-yellow-500/50 rounded p-3">
            <p className="text-yellow-400 text-sm">
              ⚠️ You have purchased a high-value product (>₹2000) this week. Only one high-value product allowed per week.
            </p>
          </div>
        )}
        
        {remainingLimit <= 0 && (
          <div className="bg-red-500/20 border border-red-500/50 rounded p-3">
            <p className="text-red-400 text-sm">
              🚫 Weekly limit reached. Purchases will reset next week.
            </p>
          </div>
        )}

        {remainingLimit > 0 && remainingLimit < 500 && !hasHighValueProduct && (
          <div className="bg-yellow-500/20 border border-yellow-500/50 rounded p-3">
            <p className="text-yellow-400 text-sm">
              ⚠️ You have less than ₹500 remaining in your weekly limit.
            </p>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="mt-4 pt-4 border-t border-[#2a2927]">
        <p className="text-gray-400 text-xs">
          <strong className="text-white">Note:</strong> Weekly purchase limit resets every Monday. 
          You can purchase products up to ₹{weeklyLimit} per week. 
          Products above ₹{weeklyLimit} count as high-value purchases and only one is allowed per week.
        </p>
      </div>
    </div>
  );
}

