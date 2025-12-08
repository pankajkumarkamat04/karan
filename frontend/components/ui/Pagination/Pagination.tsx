"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  totalItems: number;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  totalItems,
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 p-4 bg-[#080705] border border-[#191817] rounded-lg">
      {/* Items info */}
      <div className="text-[#fada1d] text-sm">
        Showing {startItem} to {endItem} of {totalItems} results
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-2">
        {/* Previous button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`flex items-center gap-1 px-3 py-2 text-sm font-bold transition-all duration-300 ${
            currentPage === 1
              ? "bg-[#191817] text-gray-500 cursor-not-allowed"
              : "bg-[#fada1d] hover:brightness-150 text-black cursor-pointer group"
          }`}
        >
          <div className={`absolute inset-0 z-0 pointer-events-none ${
            currentPage === 1 ? "hidden" : "block"
          }`}>
            <div className="w-full h-full group-hover:bg-[radial-gradient(white_1px,transparent_1px)] [background-size:5px_5px] opacity-100" />
          </div>
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) => (
            <React.Fragment key={index}>
              {page === "..." ? (
                <span className="px-3 py-2 text-[#fada1d]">...</span>
              ) : (
                <button
                  onClick={() => onPageChange(page as number)}
                  className={`px-3 py-2 text-sm font-bold transition-all duration-300 relative ${
                    currentPage === page
                      ? "bg-[#80fa1d] text-black group"
                      : "bg-[#fada1d] hover:brightness-150 text-black group"
                  }`}
                >
                  <div className="absolute inset-0 z-0 pointer-events-none">
                    <div className="w-full h-full group-hover:bg-[radial-gradient(white_1px,transparent_1px)] [background-size:5px_5px] opacity-100" />
                  </div>
                  <span className="relative z-10">{page}</span>
                </button>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Next button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`flex items-center gap-1 px-3 py-2 text-sm font-bold transition-all duration-300 ${
            currentPage === totalPages
              ? "bg-[#191817] text-gray-500 cursor-not-allowed"
              : "bg-[#fada1d] hover:brightness-150 text-black cursor-pointer group"
          }`}
        >
          <div className={`absolute inset-0 z-0 pointer-events-none ${
            currentPage === totalPages ? "hidden" : "block"
          }`}>
            <div className="w-full h-full group-hover:bg-[radial-gradient(white_1px,transparent_1px)] [background-size:5px_5px] opacity-100" />
          </div>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination; 