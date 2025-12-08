"use client";
import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { FaDiscord } from "react-icons/fa";
import { IoMdArrowDropdown } from "react-icons/io";
import { TbShoppingBag } from "react-icons/tb";
import us from "@/public/images/Flag_of_India.svg";
import Link from "next/link";
import Image from "next/image";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store/store";
import { HiCurrencyDollar } from "react-icons/hi";
import { PiCurrencyInrFill } from "react-icons/pi";

const Navbar = () => {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const cartItems = useSelector((state: RootState) => state.cart.cartItems);
  const router = useRouter();


  const navItems = [
    { name: "Home", href: "/" },
    { name: "Store", href: "/gamestore" },
    ...(pathname === "/cart" ? [{ name: "Cart", href: "/cart" }] : []),
    ...(pathname === "/checkout" ? [{ name: "Checkout", href: "/checkout" }] : []),
  ];

  return (
    <nav className="sticky lg:static top-0 z-50 bg-[#080705] border-b border-[#e4e4e414] ">
      <div className="text-white max-w-[1616px] mx-auto px-4  py-6 flex items-center justify-between">
        <div className="flex items-center space-x-14">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image src="/logo.svg" alt="Logo" width={183} height={52} />
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden xl:flex text-base font-medium">
            {navItems.map((item, index) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={index}
                  href={item.href}
                  className={`relative px-8 py-2.5 border-x border-transparent text-center group overflow-hidden`}
                >
                  {/* Active background */}
                  {isActive && (
                    <div className="absolute border-x border-[#FBDE6E] inset-0 bg-[#fdfdfd00] backdrop-blur-[1px] z-0" />
                  )}
                  <span
                    className={`relative z-10 block text-lg ${
                      isActive ? "text-[#FBDE6E]" : "text-opacity-60"
                    }`}
                  >
                    {item.name}
                  </span>

                  {/* Glow and underline */}
                  {isActive && (
                    <>
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-[70%] h-3 bg-[#f7d54f] blur-sm rounded-full z-0" />
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[70%] h-[1px] bg-yellow-500 rounded-full z-10" />
                    </>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right - Icons, Cart, Currency */}
        <div className="flex items-center space-x-4">
          <a href="https://discord.gg/bloxfruithub" target="_blank" className="text-[#5865F2] text-xl">
            <FaDiscord size={48} />
          </a>

          <div
            onClick={() => router.push("/cart")}
            className="flex justify-center items-center rounded-full bg-gradient-to-l to-[#FADA1B] from-[#FFF] w-12 h-12 cursor-pointer"
          >
            <div className="relative">
              <TbShoppingBag size={24} className="text-black/70 text-xl" />
              <span className="absolute -top-1 -right-1 bg-[#772DFF] text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                {cartItems.length}
              </span>
            </div>
          </div>

          <div className="hidden xl:flex mr-8">
            <div className="relative bg-gradient-to-l to-[#080705] via-[#3d3d3d] from-[#3d3d3d] flex items-center px-4 py-2 pr-12">
              {/* <HiCurrencyDollar size={24} className="text-yellow-500 mr-2" /> */}
              <PiCurrencyInrFill size={24} className="text-yellow-500 mr-2" />
              <span className="text-white text-sm font-semibold mr-1">INR</span>
              <IoMdArrowDropdown size={24} className="text-white" />
              <Image
                src={us}
                alt="US Flag"
                width={48}
                height={48}
                className="w-12 h-12 object-cover rounded-full absolute -right-4 drop-shadow-[0_0_3px_rgba(255,255,0,0.7)]"
              />
            </div>
          </div>

          {pathname !== "/gamestore" && (
            <button
              onClick={() => router.push("/gamestore")}
              className="hidden xl:flex items-center grad-btn hover:opacity-90 text-black px-8 py-3 font-medium text-base cursor-pointer duration-300 hover:brightness-150"
            >
              Get Started!
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                className="ml-2"
              >
                <path
                  d="M4 11V13H16V15H18V13H20V11H18V9H16V11H4ZM14 7H16V9H14V7ZM14 7H12V5H14V7ZM14 17H16V15H14V17ZM14 17H12V19H14V17Z"
                  fill="#0F1016"
                />
              </svg>
            </button>
          )}

          {/* Mobile Toggle */}
          <div className="xl:hidden">
            <button
              onClick={() => setMenuOpen(true)}
              className="text-white text-3xl focus:outline-none"
            >
              ☰
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-[#080705] transform transition-transform duration-300 ease-in-out z-50 ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        } xl:hidden`}
      >
        <div className="flex justify-end items-center px-4 py-[33px] border-b border-gray-800">
          <button
            onClick={() => setMenuOpen(false)}
            className="text-white text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="px-4 py-6 space-y-4">
          {navItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className={`block py-2 text-lg font-medium ${
                pathname === item.href ? "text-yellow-400" : "text-white"
              }`}
            >
              {item.name}
            </Link>
          ))}

          <div className="flex items-center justify-between bg-gradient-to-l to-[#080705] via-[#3d3d3d] from-[#3d3d3d] px-4 py-2 rounded-md mt-6">
            {/* <HiCurrencyDollar size={24} className="text-yellow-500 mr-2" /> */}
            <PiCurrencyInrFill size={24} className="text-yellow-500 mr-2" />
            <span className="text-white text-sm font-semibold mr-1">INR</span>
            <Image
              src={us}
              alt="US Flag"
              width={48}
              height={48}
              className="w-10 h-10 object-cover rounded-full drop-shadow-[0_0_3px_rgba(255,255,0,0.7)]"
            />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
