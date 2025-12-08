"use client";
import React, { useState, useMemo } from "react";
import {
  useGetBannedUsersQuery,
  useUnbanUserMutation,
} from "@/app/store/api/services/bannedUsersApi";
import { toast } from "sonner";
import { FaBan, FaCheckCircle, FaEnvelope, FaPhone, FaUser, FaSearch, FaFilter } from "react-icons/fa";

export default function BannedUsersPage() {
  const { data, isLoading, refetch } = useGetBannedUsersQuery();
  const [unbanUser] = useUnbanUserMutation();
  const [unbanConfirm, setUnbanConfirm] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("ALL");

  const handleUnban = async (id: string) => {
    try {
      await unbanUser(id).unwrap();
      toast.success("User unbanned successfully");
      setUnbanConfirm(null);
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to unban user");
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "EMAIL":
        return <FaEnvelope className="text-blue-400" />;
      case "PHONE":
        return <FaPhone className="text-green-400" />;
      case "USERNAME":
        return <FaUser className="text-purple-400" />;
      default:
        return <FaBan className="text-red-400" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "EMAIL":
        return "bg-blue-500/20 text-blue-400 border-blue-500/50";
      case "PHONE":
        return "bg-green-500/20 text-green-400 border-green-500/50";
      case "USERNAME":
        return "bg-purple-500/20 text-purple-400 border-purple-500/50";
      default:
        return "bg-red-500/20 text-red-400 border-red-500/50";
    }
  };

  // Filter and search functionality - MUST be before early returns (Rules of Hooks)
  const bannedUsers = data?.data?.all || [];
  
  const filteredBannedUsers = useMemo(() => {
    if (!Array.isArray(bannedUsers)) {
      return [];
    }

    let filtered = [...bannedUsers]; // Create a copy to avoid mutation

    // Filter by type
    if (filterType !== "ALL") {
      filtered = filtered.filter((banned) => banned.type === filterType);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (banned) =>
          banned.value?.toLowerCase().includes(query) ||
          (banned.reason && banned.reason.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [bannedUsers, filterType, searchQuery]);

  const grouped = data?.data?.grouped || {
    EMAIL: [],
    PHONE: [],
    USERNAME: [],
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#FADA1B] text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-[#FADA1B] text-2xl font-bold">Banned Users List</h2>
        <div className="text-white text-sm bg-[#2a2927] px-4 py-2 rounded">
          Total: {data?.data?.total || 0} banned entries
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-[#191817] rounded-lg p-4 border border-[#2a2927]">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by value or reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#2a2927] border border-[#3a3937] rounded text-white placeholder-gray-500 focus:outline-none focus:border-[#FADA1B]"
            />
          </div>
          {/* Filter by Type */}
          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 bg-[#2a2927] border border-[#3a3937] rounded text-white focus:outline-none focus:border-[#FADA1B]"
            >
              <option value="ALL">All Types</option>
              <option value="EMAIL">Email Only</option>
              <option value="PHONE">Phone Only</option>
              <option value="USERNAME">Username Only</option>
            </select>
          </div>
        </div>
        {searchQuery || filterType !== "ALL" ? (
          <div className="mt-3 text-sm text-gray-400">
            Showing {filteredBannedUsers.length} of {bannedUsers.length} entries
          </div>
        ) : null}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#191817] rounded-lg p-4 border border-[#2a2927]">
          <div className="flex items-center gap-3">
            <FaEnvelope className="text-blue-400 text-2xl" />
            <div>
              <p className="text-gray-400 text-sm">Banned Emails</p>
              <p className="text-[#FADA1B] text-2xl font-bold">
                {grouped.EMAIL?.length || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-[#191817] rounded-lg p-4 border border-[#2a2927]">
          <div className="flex items-center gap-3">
            <FaPhone className="text-green-400 text-2xl" />
            <div>
              <p className="text-gray-400 text-sm">Banned Phone Numbers</p>
              <p className="text-[#FADA1B] text-2xl font-bold">
                {grouped.PHONE?.length || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-[#191817] rounded-lg p-4 border border-[#2a2927]">
          <div className="flex items-center gap-3">
            <FaUser className="text-purple-400 text-2xl" />
            <div>
              <p className="text-gray-400 text-sm">Banned Usernames</p>
              <p className="text-[#FADA1B] text-2xl font-bold">
                {grouped.USERNAME?.length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {filteredBannedUsers.length === 0 ? (
        <div className="bg-[#191817] rounded-lg p-8 border border-[#2a2927] text-center">
          <FaBan className="text-gray-500 text-5xl mx-auto mb-4" />
          <p className="text-gray-400 text-lg">
            {bannedUsers.length === 0
              ? "No banned users found"
              : "No results match your search criteria"}
          </p>
        </div>
      ) : (
        <div className="bg-[#191817] rounded-lg border border-[#2a2927] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#2a2927]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#FADA1B] uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#FADA1B] uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#FADA1B] uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#FADA1B] uppercase tracking-wider">
                    Banned Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#FADA1B] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2927]">
                {filteredBannedUsers.map((banned) => (
                  <tr key={banned.id} className="hover:bg-[#2a2927]">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(banned.type)}
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded border ${getTypeColor(
                            banned.type
                          )}`}
                        >
                          {banned.type}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white font-medium">{banned.value}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-400 text-sm">
                        {banned.reason || (
                          <span className="italic">No reason provided</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-400 text-sm">
                      {new Date(banned.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setUnbanConfirm(banned.id)}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-semibold flex items-center gap-2"
                      >
                        <FaCheckCircle /> Unban
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Unban Confirmation Modal */}
      {unbanConfirm && (() => {
        const bannedItem = bannedUsers.find((b) => b.id === unbanConfirm);
        return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[#191817] rounded-lg p-6 border border-green-500 max-w-md w-full mx-4">
              <h3 className="text-green-400 text-xl font-bold mb-4">
                Confirm Unban
              </h3>
              <div className="space-y-4">
                {bannedItem && (
                  <div className="bg-[#2a2927] p-4 rounded border border-[#3a3937]">
                    <div className="flex items-center gap-2 mb-3">
                      {getTypeIcon(bannedItem.type)}
                      <span className={`px-3 py-1 text-xs font-semibold rounded border ${getTypeColor(bannedItem.type)}`}>
                        {bannedItem.type}
                      </span>
                    </div>
                    <p className="text-white text-sm mb-2">
                      <strong className="text-[#FADA1B]">Value:</strong>{" "}
                      <span className="text-gray-300">{bannedItem.value}</span>
                    </p>
                    {bannedItem.reason && (
                      <p className="text-gray-400 text-sm">
                        <strong>Reason:</strong> {bannedItem.reason}
                      </p>
                    )}
                    <p className="text-gray-400 text-xs mt-2">
                      Banned on: {new Date(bannedItem.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                )}
                <p className="text-white">
                  Are you sure you want to unban this entry? They will be able
                  to make purchases again using this {bannedItem?.type.toLowerCase() || "identifier"}.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setUnbanConfirm(null)}
                    className="flex-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleUnban(unbanConfirm)}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-semibold"
                  >
                    Confirm Unban
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

