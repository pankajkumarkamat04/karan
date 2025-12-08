"use client";

import Loading from "@/components/Loading/Loading";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import Image from "next/image";
import React from "react";

export interface TableColumn {
  key: string;
  label: string;
  type?: "text" | "image" | "number";
}

interface TableProps {
  columns: TableColumn[];
  data: Record<string, any>[];
  actions?: (row: Record<string, any>) => React.ReactNode;
  loading?: boolean;
}

const DynamicTable: React.FC<TableProps> = ({
  columns,
  data,
  actions,
  loading,
}) => {
  return (
    <div className=" overflow-hidden bg-[#080705]">
      <Table className="w-full">
        <TableHeader className="capitalize">
          <TableRow className="bg-[#fada1d] hover:bg-[#fada1d]">
            <TableHead className="w-14 text-base text-[#000000] text-center font-medium border-b border-[#191817] ">
              Serial No.
            </TableHead>
            {columns.map((col) => (
              <TableHead
                key={col.key}
                className="text-[#000000] text-left text-base py-5 font-medium whitespace-nowrap border-b border-[#191817]"
              >
                {col.label}
              </TableHead>
            ))}
            {actions && (
              <TableHead className="w-20 text-base text-[#000000] text-center font-medium border-b border-[#191817]">
                More
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody className="hover:bg-y-950 bg-zinc-950">
          {loading ? (
            <TableRow>
              <TableCell
                colSpan={columns.length + (actions ? 2 : 1)}
                className="text-center py-4 text-gray-500"
              >
                <Loading />
              </TableCell>
            </TableRow>
          ) : data?.length > 0 ? (
            data.map((row, index) => (
              <TableRow
                key={row.id || index}
                className="text-[#fada1d] text-sm border-b border-[#191817]"
              >
                <TableCell className="text-center ">{index + 1}</TableCell>
                {columns.map((col) => (
                  <TableCell
                    key={col.key}
                    className="text-left text-[#fada1d] py-4 "
                  >
                    {col.type === "image" ? (
                      typeof row[col.key] === "string" &&
                      row[col.key] !== "" ? (
                        <img
                          crossOrigin="anonymous"
                          src={row[col.key]}
                          alt="Profile"
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : typeof row[col.key]?.src === "string" &&
                        row[col.key].src !== "" ? (
                        <img
                          crossOrigin="anonymous"
                          src={row[col.key].src}
                          alt="Profile"
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        "No Image"
                      )
                    ) : (
                      row[col.key] ?? "N/A"
                    )}
                  </TableCell>
                ))}
                {actions && (
                  <TableCell className="text-center">{actions(row)}</TableCell>
                )}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length + (actions ? 2 : 1)}
                className="text-center py-4 text-yellow-500"
              >
                No data available
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default DynamicTable;
