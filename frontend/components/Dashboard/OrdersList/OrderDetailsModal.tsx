import { useUpdateOrderStatusMutation } from "@/app/store/api/services/orderApi";
import React, { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { toast } from "sonner";

interface OrderDetailsModalProps {
  order: any;
  onClose: () => void;
  refetch: () => void;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  order,
  onClose,
  refetch,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const orderItems = order?.items;
  console.log(order,"FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF");
  const [updateOrderStatus, { isLoading }] = useUpdateOrderStatusMutation();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleUpdateOrderStatus = async () => {
    try {
      await updateOrderStatus({ order_id: order?.order_id, status: "Completed" }).unwrap();
      toast.success("Order completed successfully");
      onClose();
      refetch();
    } catch (error) {
      toast.error("Failed to update order status");
    }
  };

  return (
    <div 
      className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 transition-all duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div 
        className={`bg-[#080705] p-6 rounded-lg shadow-lg max-w-4xl w-full relative border border-[#fada1d] transition-all duration-300 transform ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        <h2 className="text-xl font-bold text-center uppercase text-[#fada1d]">
          Order Details
        </h2>
        <div>
          <p className="text-xl font-bold">
            <strong className="text-[#fada1d]">Roblox Username:</strong>{" "}
            {order?.customer_name}
          </p>
          {/* Order Items */}
          <div className="">
            <h3 className="text-lg font-bold uppercase text-[#fada1d] my-4">
              Order Items
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2  gap-4 h-72 overflow-y-auto custom-scroll">
              {orderItems?.map((item: any) => (
                <div key={item?.id} className="pr-2">
                  <div className="bg-[#fada1d] text-black flex gap-2 border border-[#fada1d]">
                    <div className="bg-[#080705] p-2 flex items-center justify-center">
                      <img
                        crossOrigin="anonymous"
                        src={
                          process.env.NEXT_PUBLIC_IMAGE_URL +
                          "/storage/product/" +
                          item?.product?.image
                        }
                        alt=""
                        className="w-20 h-20 object-cover"
                      />
                    </div>
                    <div>
                      <p>
                        Game Name :{" "}
                        <span className=" font-bold capitalize">
                          {item?.product?.games_name}
                        </span>
                      </p>
                      <p>
                        Product Name :{" "}
                        <span className=" font-bold capitalize">
                          {item?.product?.name}
                        </span>
                      </p>
                      <p>
                        Rarity :{" "}
                        <span className=" font-bold capitalize">
                          {item?.product?.type}
                        </span>
                      </p>
                      <p>
                        Quantity :{" "}
                        <span className=" font-bold text-center">
                          {item?.quantity}
                        </span>
                      </p>
                      <p>
                        Price :{" "}
                        <span className=" font-bold text-center">
                          ₹{item?.product?.regularPrice}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4">
            <p className="text-center text-sm font-bold text-gray-500">
              <strong className="text-red-500">Note:</strong> Once all the
              products have been delivered, click the 'Complete' button.{" "}
            </p>
            <button
              className={`bg-[#fada1d] mt-4 text-black font-bold px-4 py-2 hover:brightness-150 duration-300 cursor-pointer ${
                order?.order_delivery === "Pending"
                  ? "bg-red-500 text-white"
                  : "bg-green-500"
              }`}
              onClick={handleUpdateOrderStatus}
            >
              {order?.order_delivery === "Pending"
                ? isLoading ? "Completing..." : "Complete Order"
                : "Order Completed"}
            </button>
          </div>
        </div>
        <button
          onClick={handleClose}
          className="bg-red-500 absolute top-5 right-5 text-white p-1 md:p-2 cursor-pointer hover:bg-red-600 transition-colors duration-200"
        >
          <IoClose size={20} />
        </button>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
