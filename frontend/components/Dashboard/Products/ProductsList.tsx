"use client";
import DynamicTable, {
  TableColumn,
} from "@/components/ui/DynamicTable/DynamicTable";
import React, { useState, useMemo } from "react";
import { FaPlus, FaSearch } from "react-icons/fa";
import { MdDelete, MdEdit } from "react-icons/md";
import Link from "next/link";
import { useDeleteProductMutation, useGetProductsQuery } from "@/app/store/api/services/productApi";
import { useRouter } from "next/navigation";
import Pagination from "@/components/ui/Pagination/Pagination";

const ProductsList = () => {
  const router = useRouter()
  const { data: products, isLoading, refetch } = useGetProductsQuery(undefined);
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
  const productsData = products?.data;
  
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 10;

  console.log(productsData);

  const handleDelete =  async (id:string)=>{
    if(confirm("Are you sure you want to delete this product?")){
    const res = await deleteProduct(id)
    if(res.data?.success){
        alert("Product deleted successfully");
        refetch();
      }
    }
  };

  const dateFormatter = (date:string)=>{
    return new Date(date).toLocaleString();
  }

  const priceFormatter = (price:number)=>{
    return `$${price}`;
  }

  const imageFormatter = (image:string)=>{
    const url = `${image}`;
    console.log(url, "url");
    console.log('Generated image URL:',encodeURI(url));
    return encodeURI(url);
  }

  // Format all data first
  const allFormattedData = useMemo(() => {
    return productsData?.map((product:any)=>({
      ...product,
      regularPrice: priceFormatter(product.regularPrice),
      created_at: dateFormatter(product.created_at),
      imageUrl: imageFormatter(product.imageUrl),
    })) || [];
  }, [productsData]);

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) {
      return allFormattedData;
    }
    return allFormattedData.filter((product: any) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allFormattedData, searchTerm]);

  // Calculate pagination for filtered data
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  
  // Get current page data
  const currentPageData = filteredData.slice(startIndex, endIndex);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle search change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const columns: TableColumn[] = [
    { key: "imageUrl", label: "Image", type: "image" },
    { key: "name", label: "Product Name", type: "text" },
    { key: "type", label: "Rarity", type: "text" },
    { key: "regularPrice", label: "Price", type: "text" },
    { key: "created_at", label: "Created Date & Time", type: "text" },
    { key: "category", label: "Category", type: "text" },
  ];

  const tableActions = (row: any) => {
    return (
      <div className="flex gap-2">
        <button onClick={()=>router.push(`/dashboard/add-fruits?id=${row.id}`)} className="bg-[#80fa1d] hover:brightness-150 group text-black font-bold px-4 py-2 duration-300 cursor-pointer flex items-center gap-1 relative">
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="w-full h-full group-hover:bg-[radial-gradient(white_1px,transparent_1px)] [background-size:5px_5px] opacity-100 " />
          </div>
          <MdEdit className="text-xl" />
          Update
        </button>
        <button onClick={()=>handleDelete(row.id)} className="bg-[#fa4242] hover:brightness-150 text-black font-bold px-4 py-2 duration-300 cursor-pointer flex items-center gap-1">
          <MdDelete className="text-xl" />
          Delete
        </button>
      </div>
    );
  };

  return (
    <div className="relative">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-[#fada1d]">Products List</h1>
        
        {/* Search Input */}
        <div className="relative max-w-md w-full">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products by name..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full px-4 py-3 pl-12 bg-gradient-to-l to-[#fada1b26] from-[#594d0026] border border-[#fad91d67] focus:outline-none focus:border-[#fada1d] text-[#fada1d] placeholder-[#fada1d]/60  transition-all duration-300"
            />
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#fada1d]/60" />
          </div>
        </div>

        <Link href="/dashboard/add-fruits" className="bg-[#fada1d] hover:brightness-150 text-black px-4 py-3 duration-300 cursor-pointer flex items-center gap-2 font-bold transition-all">
          <FaPlus />
          Add Product
        </Link>
      </div>
      
      {/* Search Results Info */}
      {searchTerm && (
        <div className="mb-4 p-3 bg-gradient-to-l to-[#fada1b26] from-[#594d0026] border border-[#fad91d67] rounded-lg">
          <p className="text-[#fada1d] text-sm">
            Found <span className="font-bold">{totalItems}</span> product{totalItems !== 1 ? 's' : ''} matching "{searchTerm}"
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
      {!isLoading && totalItems > 10 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          itemsPerPage={itemsPerPage}
          totalItems={totalItems}
        />
      )}

      {/* No Results Message */}
      {!isLoading && searchTerm && totalItems === 0 && (
        <div className="text-center py-8">
          <p className="text-[#fada1d] text-lg">No products found matching "{searchTerm}"</p>
          <button 
            onClick={() => setSearchTerm("")}
            className="mt-2 text-[#fada1d]/80 hover:text-[#fada1d] underline"
          >
            Clear search
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductsList;
