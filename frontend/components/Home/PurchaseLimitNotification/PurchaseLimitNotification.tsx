"use client";
import React, { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";

const NOTIFICATION_KEY = "purchase_limit_notification_closed";

export default function PurchaseLimitNotification() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has closed the notification before
    if (typeof window !== "undefined") {
      const wasClosed = localStorage.getItem(NOTIFICATION_KEY);
      setIsVisible(!wasClosed);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    if (typeof window !== "undefined") {
      localStorage.setItem(NOTIFICATION_KEY, "true");
    }
  };

  if (!isVisible) {
    return null;
  }

  const message = "Weekly purchases are capped at ₹2,000. Want a higher limit? Join our Discord and complete KYC to unlock upgrades!";

  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 py-3 px-4 shadow-lg">
      <div className="flex items-center justify-between">
        {/* Sliding Text */}
        <div className="flex-1 overflow-hidden">
          <div className="animate-scroll whitespace-nowrap text-black font-semibold text-sm md:text-base">
            <span className="inline-block">{message}</span>
          </div>
        </div>
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="ml-4 text-black hover:text-gray-800 font-bold text-xl flex-shrink-0 transition-colors"
          aria-label="Close notification"
        >
          <IoClose size={20} className="md:w-6 md:h-6" />
        </button>
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

