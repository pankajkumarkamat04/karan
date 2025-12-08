"use client";
import React from "react";
import WeeklyPurchaseCard from "@/components/Account/WeeklyPurchaseCard";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store/store";

export default function AccountPage() {
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-[#191817] rounded-lg p-6 border border-[#2a2927]">
        <h2 className="text-[#FADA1B] text-2xl font-bold mb-4">Account Information</h2>
        <div className="space-y-3">
          <div>
            <label className="text-gray-400 text-sm">Email</label>
            <p className="text-white text-lg">{user?.email || 'N/A'}</p>
          </div>
          {user?.first_name && (
            <div>
              <label className="text-gray-400 text-sm">Name</label>
              <p className="text-white text-lg">
                {user?.first_name} {user?.last_name || ''}
              </p>
            </div>
          )}
        </div>
      </div>

      <WeeklyPurchaseCard />
    </div>
  );
}

