import React from "react";

const Loading = () => {
  return (
    <div>
      <div className="flex items-center justify-center py-10 relative ">
        <div className=" animate-spin relative">
          <div className="rounded h-6 w-6 border border-[#fada1d]"></div>
          <div className="rounded h-6 w-6 border border-[#e7e7ad] rotate-45 absolute top-0"></div>
        </div>
      </div>
    </div>
  );
};

export default Loading;
