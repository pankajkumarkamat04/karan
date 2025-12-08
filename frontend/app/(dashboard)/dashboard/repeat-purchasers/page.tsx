"use client";
import React, { useState } from "react";
import {
  useGetRepeatPurchasersQuery,
  useBanUserMutation,
  useUnbanUserMutation,
  useBanCustomerMutation,
  RepeatPurchaser,
} from "@/app/store/api/services/repeatPurchasersApi";
import { toast } from "sonner";

export default function RepeatPurchasersPage() {
  const { data, isLoading, refetch } = useGetRepeatPurchasersQuery();
  const [banUser] = useBanUserMutation();
  const [banCustomer] = useBanCustomerMutation();
  const [unbanUser] = useUnbanUserMutation();
  const [banReason, setBanReason] = useState<{ [key: string]: string }>({});
  const [showBanModal, setShowBanModal] = useState<string | null>(null);
  const [showCustomerBanModal, setShowCustomerBanModal] = useState<string | null>(null);
  const [selectedPurchaser, setSelectedPurchaser] = useState<any | null>(null);

  const handleBan = async (userId: string) => {
    try {
      await banUser({ userId, reason: banReason[userId] || undefined }).unwrap();
      toast.success("User banned successfully");
      setShowBanModal(null);
      setBanReason({});
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to ban user");
    }
  };

  const handleBanCustomer = async (purchaser: any) => {
    try {
      const banKey = `${purchaser.customer_email}_${purchaser.customer_phone}`;
      const reason = banReason[banKey] || undefined;
      
      await banCustomer({
        customer_email: purchaser.customer_email,
        customer_phone: purchaser.customer_phone,
        customer_name: purchaser.customer_name,
        reason: reason || 'Repeated purchase pattern detected',
        userId: purchaser.user?.id,
      }).unwrap();
      
      toast.success("Customer banned successfully (Email, Phone, and Game Username)");
      setShowCustomerBanModal(null);
      setSelectedPurchaser(null);
      setBanReason({});
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to ban customer");
    }
  };

  const handleUnban = async (userId: string) => {
    try {
      await unbanUser(userId).unwrap();
      toast.success("User unbanned successfully");
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to unban user");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#FADA1B] text-lg">Loading...</div>
      </div>
    );
  }

  const repeatPurchasers = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-[#FADA1B] text-2xl font-bold">Repeat Purchasers</h2>
        <div className="text-white text-sm">
          Total: {repeatPurchasers.length} repeat purchase pattern(s)
        </div>
        <div className="text-[#FADA1B] text-xs bg-[#2a2927] px-3 py-1 rounded">
          Shows orders with 2+ same game/email/phone in a day, or 5+ in a week
        </div>
      </div>

      {repeatPurchasers.length === 0 ? (
        <div className="bg-[#191817] rounded-lg p-8 border border-[#2a2927] text-center">
          <p className="text-gray-400 text-lg">No repeat purchasers found</p>
        </div>
      ) : (
        <div className="bg-[#191817] rounded-lg border border-[#2a2927] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#2a2927]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#FADA1B] uppercase tracking-wider">
                    Customer / Game
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#FADA1B] uppercase tracking-wider">
                    Daily Count
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#FADA1B] uppercase tracking-wider">
                    Weekly Count
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#FADA1B] uppercase tracking-wider">
                    Total Orders
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#FADA1B] uppercase tracking-wider">
                    Last Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#FADA1B] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#FADA1B] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2927]">
                {repeatPurchasers.map((purchaser, index) => {
                  const uniqueKey = `${purchaser.customer_email}_${purchaser.customer_phone}_${purchaser.productId}_${index}`;
                  const userId = purchaser.user?.id || purchaser.customer_email;
                  
                  return (
                    <tr key={uniqueKey} className="hover:bg-[#2a2927]">
                      <td className="px-6 py-4">
                        <div className="text-white">
                          <div className="font-medium">
                            {purchaser.customer_name || purchaser.user?.first_name || purchaser.customer_email}
                          </div>
                          <div className="text-sm text-gray-400">{purchaser.customer_email}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            📱 {purchaser.customer_phone}
                          </div>
                          <div className="text-xs text-[#FADA1B] mt-1">
                            🎮 {purchaser.gameName} - {purchaser.productName}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded ${
                            purchaser.exceedsDailyLimit
                              ? "bg-red-500/20 text-red-400"
                              : "bg-gray-500/20 text-gray-400"
                          }`}
                        >
                          {purchaser.dailyCount} {purchaser.exceedsDailyLimit && "⚠️"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded ${
                            purchaser.exceedsWeeklyLimit
                              ? "bg-red-500/20 text-red-400"
                              : "bg-gray-500/20 text-gray-400"
                          }`}
                        >
                          {purchaser.weeklyCount} {purchaser.exceedsWeeklyLimit && "⚠️"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-white">
                        {purchaser.totalOrders}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-400 text-sm">
                        {purchaser.lastOrderDate
                          ? new Date(purchaser.lastOrderDate).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {purchaser.user?.is_banned ? (
                          <span className="px-2 py-1 text-xs font-semibold rounded bg-red-500/20 text-red-400">
                            Banned
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-semibold rounded bg-green-500/20 text-green-400">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          {purchaser.user && purchaser.user.is_banned ? (
                            <button
                              onClick={() => handleUnban(purchaser.user!.id)}
                              className="text-green-400 hover:text-green-300 px-3 py-1 border border-green-400 rounded"
                            >
                              Unban User
                            </button>
                          ) : (
                            <>
                              {purchaser.user && (
                                <button
                                  onClick={() => setShowBanModal(purchaser.user!.id)}
                                  className="text-red-400 hover:text-red-300 px-3 py-1 border border-red-400 rounded"
                                >
                                  Ban User
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  setSelectedPurchaser(purchaser);
                                  setShowCustomerBanModal(`${purchaser.customer_email}_${purchaser.customer_phone}`);
                                }}
                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded font-semibold"
                                title="Ban Email, Phone & Game Username"
                              >
                                🚫 Ban All
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Ban User Modal */}
      {showBanModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#191817] rounded-lg p-6 border border-[#2a2927] max-w-md w-full mx-4">
            <h3 className="text-[#FADA1B] text-xl font-bold mb-4">Ban User Account</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-white text-sm mb-2">Ban Reason (Optional)</label>
                <textarea
                  value={banReason[showBanModal] || ""}
                  onChange={(e) =>
                    setBanReason({ ...banReason, [showBanModal]: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-[#2a2927] border border-[#3a3937] rounded text-white"
                  rows={3}
                  placeholder="Enter reason for banning this user..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowBanModal(null);
                    setBanReason({});
                  }}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleBan(showBanModal)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Confirm Ban
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ban Customer Modal (Email, Phone, Game Username) */}
      {showCustomerBanModal && selectedPurchaser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#191817] rounded-lg p-6 border border-red-500 max-w-md w-full mx-4">
            <h3 className="text-red-500 text-xl font-bold mb-4">🚫 Ban Customer</h3>
            <div className="space-y-4">
              <div className="bg-[#2a2927] p-4 rounded border border-[#3a3937]">
                <p className="text-white text-sm mb-2">
                  <strong className="text-[#FADA1B]">This will ban:</strong>
                </p>
                <ul className="text-white text-sm space-y-1 ml-4 list-disc">
                  <li>Email: <span className="text-red-400">{selectedPurchaser.customer_email}</span></li>
                  <li>Phone: <span className="text-red-400">{selectedPurchaser.customer_phone}</span></li>
                  <li>Game Username: <span className="text-red-400">{selectedPurchaser.customer_name}</span></li>
                  {selectedPurchaser.user && (
                    <li>User Account: <span className="text-red-400">{selectedPurchaser.user.email}</span></li>
                  )}
                </ul>
                <p className="text-yellow-400 text-xs mt-3">
                  ⚠️ This will prevent them from making future purchases using any of these identifiers.
                </p>
              </div>
              <div>
                <label className="block text-white text-sm mb-2">Ban Reason (Optional)</label>
                <textarea
                  value={banReason[showCustomerBanModal] || ""}
                  onChange={(e) =>
                    setBanReason({ ...banReason, [showCustomerBanModal]: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-[#2a2927] border border-[#3a3937] rounded text-white"
                  rows={3}
                  placeholder="Enter reason for banning this customer..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCustomerBanModal(null);
                    setSelectedPurchaser(null);
                    setBanReason({});
                  }}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleBanCustomer(selectedPurchaser)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-semibold"
                >
                  🚫 Ban All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

