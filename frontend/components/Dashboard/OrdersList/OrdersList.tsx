"use client";
import DynamicTable, {
  TableColumn,
} from "@/components/ui/DynamicTable/DynamicTable";
import React, { useState, useMemo } from "react";
import { useGetOrdersQuery, useBanOrderMutation } from "@/app/store/api/services/orderApi";
import OrderDetailsModal from "./OrderDetailsModal";
import Pagination from "@/components/ui/Pagination/Pagination";
import { FaSearch, FaBan } from "react-icons/fa";
import dayjs from "dayjs";
import { toast } from "sonner";

const OrdersList = () => {
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "pending">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isBanModalOpen, setIsBanModalOpen] = useState(false);
  const [orderToBan, setOrderToBan] = useState<any>(null);
  const [banReason, setBanReason] = useState("");

  const [banOrder, { isLoading: isBanning }] = useBanOrderMutation();

  const isFiltering = Boolean(searchTerm.trim()) || statusFilter !== "all";

  const { data: orders, isLoading, refetch } = useGetOrdersQuery({
    page: isFiltering ? 1 : currentPage,
    limit: isFiltering ? 1000 : itemsPerPage
  });

  const ordersData = orders?.data;
  const paginationData = orders?.data?.pagination;

  console.log("ordersData", ordersData);

  const formatStatus = (status: string) => {
    if (status === "pending" || status === "PENDING") {
      return (
        <p className="bg-yellow-500 text-black font-bold px-4 py-2 text-center">
          Unpaid
        </p>
      );
    } else if (status === "COMPLETED") {
      return (
        <p className="bg-green-500 text-black font-bold px-4 py-2 text-center">
          Paid
        </p>
      );
    } else if (status === "completed") {
      return (
        <p className="bg-green-500 text-black font-bold px-4 py-2 text-center">
          Paid
        </p>
      );
    }
    return status;
  };

  const formatAmount = (amount: number) => {
    return `₹${amount}`;
  };

  const dateTime = (date: string) => {
    return dayjs(date).format("DD MMM YYYY, hh:mm A");
  };

  const allFormattedData = useMemo(() => {
    if (!ordersData) return [];
    return ordersData?.data?.map((item: any) => ({
      ...item,
      status: formatStatus(item.status),
      amount: formatAmount(item.amount),
      created_at: dateTime(item.created_at),
    }));
  }, [ordersData]);

  const filteredData = useMemo(() => {
    let filtered = allFormattedData;

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((order: any) => {
        const originalStatus = ordersData?.data?.find((o: any) => o.id === order.id)?.status?.toLowerCase();
        if (statusFilter === "completed") {
          return originalStatus === "completed";
        } else if (statusFilter === "pending") {
          return originalStatus === "pending";
        }
        return true;
      });
    }

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter((order: any) =>
        order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [allFormattedData, searchTerm, statusFilter, ordersData]);

  // Calculate pagination based on filtered data
  const totalItems = isFiltering ? filteredData.length : (paginationData?.total || filteredData.length);
  const totalPages = isFiltering
    ? Math.ceil(filteredData.length / itemsPerPage)
    : (paginationData?.totalPages || Math.ceil(totalItems / itemsPerPage));

  // Apply client-side pagination to filtered data
  const currentPageData = isFiltering
    ? filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : filteredData;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (status: "all" | "completed" | "pending") => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const columns: TableColumn[] = [
    { key: "customer_email", label: "Customer Email", type: "text" },
    { key: "customer_name", label: "Roblox Username", type: "text" },
    { key: "customer_phone", label: "Customer Phone", type: "text" },
    { key: "created_at", label: "Order Date & Time", type: "text" },
    { key: "amount", label: "Total Amount", type: "text" },
    { key: "status", label: "Payment Status", type: "text" },
    { key: "order_delivery", label: "Order Status", type: "text" },
  ];

  const handleBanClick = (row: any) => {
    // Get the original order data before formatting
    const originalOrder = ordersData?.data?.find((o: any) => o.id === row.id);
    setOrderToBan(originalOrder || row);
    setIsBanModalOpen(true);
    setBanReason("");
  };

  const handleBanConfirm = async () => {
    if (!orderToBan) return;

    try {
      // Use order_id or id, whichever is available
      const orderId = orderToBan.order_id || orderToBan.id;
      await banOrder({ orderId, reason: banReason || undefined }).unwrap();
      toast.success("Order banned successfully");
      setIsBanModalOpen(false);
      setOrderToBan(null);
      setBanReason("");
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to ban order");
    }
  };

  const tableActions = (row: any) => {
    return (
      <div className="flex gap-2">
        <button
          onClick={() => {
            setSelectedOrder(row);
            setIsModalOpen(true);
          }}
          className="bg-[#80fa1d] hover:brightness-150 text-black font-bold px-4 py-2 duration-300 cursor-pointer flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Details
        </button>
        <button
          onClick={() => handleBanClick(row)}
          className="bg-red-500 hover:bg-red-600 text-white font-bold px-4 py-2 duration-300 cursor-pointer flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaBan /> Ban
        </button>
      </div>
    );
  };

  return (
    <div className="relative">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-[#fada1d]">Orders List</h1>

        {/* Search Input */}
        <div className="relative max-w-md w-full">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by Roblox username or email..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full px-4 py-3 pl-12 bg-gradient-to-l to-[#fada1b26] from-[#594d0026] border border-[#fad91d67] focus:outline-none focus:border-[#fada1d] text-[#fada1d] placeholder-[#fada1d]/60  transition-all duration-300"
            />
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#fada1d]/60" />
          </div>
        </div>
      </div>

      {/* Status Filter Buttons */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => handleStatusFilterChange("all")}
          className={`px-6 py-2 font-semibold transition-all duration-300 ${statusFilter === "all"
              ? "bg-[#fada1d] text-black"
              : "bg-gradient-to-l to-[#fada1b26] from-[#594d0026] border border-[#fad91d67] text-[#fada1d] hover:bg-[#fada1d]/20"
            }`}
        >
          All Orders
        </button>
        <button
          onClick={() => handleStatusFilterChange("completed")}
          className={`px-6 py-2 font-semibold transition-all duration-300 ${statusFilter === "completed"
              ? "bg-green-500 text-black"
              : "bg-gradient-to-l to-[#fada1b26] from-[#594d0026] border border-[#fad91d67] text-[#fada1d] hover:bg-green-500/20"
            }`}
        >
          Completed
        </button>
        <button
          onClick={() => handleStatusFilterChange("pending")}
          className={`px-6 py-2 font-semibold transition-all duration-300 ${statusFilter === "pending"
              ? "bg-yellow-500 text-black"
              : "bg-gradient-to-l to-[#fada1b26] from-[#594d0026] border border-[#fad91d67] text-[#fada1d] hover:bg-yellow-500/20"
            }`}
        >
          Pending
        </button>
      </div>

      {/* Search Results Info */}
      {(searchTerm || statusFilter !== "all") && (
        <div className="mb-4 p-3 bg-gradient-to-l to-[#fada1b26] from-[#594d0026] border border-[#fad91d67] rounded-lg">
          <p className="text-[#fada1d] text-sm">
            Found <span className="font-bold">{filteredData.length}</span> order{filteredData.length !== 1 ? "s" : ""}
            {statusFilter !== "all" && (
              <span> with status: <span className="font-bold capitalize">{statusFilter}</span></span>
            )}
            {searchTerm && (
              <span> matching "<span className="font-bold">{searchTerm}</span>"</span>
            )}
          </p>
        </div>
      )}

      <DynamicTable
        columns={columns}
        data={currentPageData}
        actions={tableActions}
        loading={isLoading}
      />

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          itemsPerPage={itemsPerPage}
          totalItems={totalItems}
        />
      )}

      {/* No Results Message */}
      {!isLoading && filteredData.length === 0 && (
        <div className="text-center py-8">
          <p className="text-[#fada1d] text-lg">
            No orders found
            {statusFilter !== "all" && ` with status: ${statusFilter}`}
            {searchTerm && ` matching "${searchTerm}"`}
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("all");
            }}
            className="mt-2 text-[#fada1d]/80 hover:text-[#fada1d] underline"
          >
            Clear all filters
          </button>
        </div>
      )}

      {isModalOpen && selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setIsModalOpen(false)}
          refetch={refetch}
        />
      )}

      {/* Ban Confirmation Modal */}
      {isBanModalOpen && orderToBan && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-[#080705] p-6 rounded-lg shadow-lg max-w-md w-full relative border border-red-500">
            <h2 className="text-xl font-bold text-center uppercase text-red-500 mb-4">
              Ban Order
            </h2>
            <div className="mb-4">
              <p className="text-[#fada1d] mb-2">
                <strong>Customer Email:</strong> {orderToBan.customer_email}
              </p>
              <p className="text-[#fada1d] mb-2">
                <strong>Roblox Username:</strong> {orderToBan.customer_name}
              </p>
              <p className="text-[#fada1d] mb-4">
                <strong>Order ID:</strong> {orderToBan.order_id || orderToBan.id}
              </p>
              <p className="text-yellow-500 text-sm mb-4">
                This will ban the customer's phone, email, and username from making future purchases.
              </p>
              <label className="block text-[#fada1d] mb-2">
                Ban Reason (Optional):
              </label>
              <textarea
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Enter ban reason..."
                className="w-full px-4 py-2 bg-gradient-to-l to-[#fada1b26] from-[#594d0026] border border-[#fad91d67] focus:outline-none focus:border-[#fada1d] text-[#fada1d] placeholder-[#fada1d]/60 resize-none"
                rows={3}
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setIsBanModalOpen(false);
                  setOrderToBan(null);
                  setBanReason("");
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold px-4 py-2 duration-300 cursor-pointer"
                disabled={isBanning}
              >
                Cancel
              </button>
              <button
                onClick={handleBanConfirm}
                className="bg-red-500 hover:bg-red-600 text-white font-bold px-4 py-2 duration-300 cursor-pointer flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isBanning}
              >
                <FaBan /> {isBanning ? "Banning..." : "Confirm Ban"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersList;