"use client";
import { useGetSubscribersQuery } from "@/app/store/api/services/emailSubscriptionApi";
import DynamicTable, {
  TableColumn,
} from "@/components/ui/DynamicTable/DynamicTable";
import Pagination from "@/components/ui/Pagination/Pagination";
import React, { useState } from "react";
import { MdDownload } from "react-icons/md";

const Others = () => {
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const { data: subscribers, isLoading } = useGetSubscribersQuery(null);
  console.log(subscribers);

  const subscribersData = subscribers?.data?.map((subscriber: any) => ({
    email: subscriber.email,
    created_at: new Date(subscriber.created_at).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
  }));

  const downloadCSV = () => {
    if (!subscribersData || subscribersData.length === 0) {
      alert("No data to download");
      return;
    }

    // Create CSV content
    const headers = ["Email", "Joined On"];
    const csvContent = [
      headers.join(","),
      ...subscribersData.map(
        (subscriber: { email: string; created_at: string }) =>
          `"${subscriber.email}","${subscriber.created_at}"`
      ),
    ].join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `email-subscribers-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalItems = subscribersData?.length || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageData = subscribersData?.slice(startIndex, endIndex) || [];
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const columns: TableColumn[] = [
    { key: "email", label: "Email", type: "text" },
    { key: "created_at", label: "Joined On", type: "text" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl">Email Subscribers</h2>
        <button
          onClick={downloadCSV}
          disabled={
            isLoading || !subscribersData || subscribersData.length === 0
          }
          className="bg-yellow-400 hover:bg-yellow-400 disabled:bg-gray-400 text-black px-4 py-2 flex items-center gap-2 transition-colors cursor-pointer"
        >
          <MdDownload size={20} />
          Download CSV
        </button>
      </div>
      <DynamicTable
        columns={columns}
        data={currentPageData}
        loading={isLoading}
      />

      {!isLoading && totalItems > 10 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          itemsPerPage={itemsPerPage}
          totalItems={totalItems}
        />
      )}
    </div>
  );
};

export default Others;
