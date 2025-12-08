"use client";
import React from "react";
import Image from "next/image";
import { FaEthereum } from "react-icons/fa";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import { useRouter } from "next/navigation";


export default function OurGamesCard({game}: any) {
  const router = useRouter();
  const {image,title,items,description,url}=game
  return (
    <div className="card-bg p-4 rounded-lg shadow-lg flex flex-col sm:flex-row items-start sm:items-center sm:space-x-4 space-y-4 sm:space-y-0  w-full">
      {/* Game Image */}
      <div className="relative rounded-sm h-[190px] w-full  overflow-hidden border-[1.5px] border-[#FADA1B] ">
        <Image src={image} alt="Blox Fruits" fill className="object-cover" />
        <div className="absolute top-1 left-1 bg-white rounded-full p-1">
          <FaEthereum className=" text-base" />
        </div>
      </div>

      <div className="flex flex-col justify-between w-full">
        <div>
          {/* <p className="text-base text-[#9D99AD] mb-1">{items} dsdsdsItems</p> */}
          <div className="flex items-center gap-1">
            <h2 className="text-lg text-white font-bold">{title}</h2>
            <RiVerifiedBadgeFill className="text-[#1d96ff]" />
          </div>
          <hr className="mt-2 my-4 border rgb-border" />
          <p className="text-gray-400 text-base mt-1 line-clamp-2">
            {description}
          </p>
        </div>
        <button onClick={()=>router.push(url)} className="mt-3 font-bold bg-gradient-to-r from-[#FADA1B] to-white hover:brightness-110 text-black text-sm py-[13px] px-4 rounded cursor-pointer">
          View Items
        </button>
      </div>
    </div>
  );
}
