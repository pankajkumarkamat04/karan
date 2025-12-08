"use client";
import React, { useState } from "react";
import { RxDashboard } from "react-icons/rx";
import Link from "next/link";
import Image from "next/image";
import { RiProductHuntLine, RiSettingsLine } from "react-icons/ri";
import { FaCcPaypal } from "react-icons/fa";
import { usePathname, useRouter } from "next/navigation";
import { HiOutlineMenuAlt1 } from "react-icons/hi";
import { TbSocial } from "react-icons/tb";
import { PiShoppingBagLight } from "react-icons/pi";
import { logOut } from "@/app/store/slices/authSlice";
import { useDispatch } from "react-redux";

// Menu and Bottom items
const menuItems = [
  {
    href: "/dashboard/products",
    icon: <RiProductHuntLine size={24} />,
    label: "Products",
  },
  { href: "/dashboard/orders", icon: <PiShoppingBagLight  size={24} />, label: "Orders" },
  { href: "/dashboard/paypal", icon: <FaCcPaypal size={24} />, label: "Paypal" },
  { href: "/dashboard/repeat-purchasers", icon: <PiShoppingBagLight size={24} />, label: "Repeat Purchasers" },
  { href: "/dashboard/banned-users", icon: <RiSettingsLine size={24} />, label: "Banned Users" },
  { href: "/dashboard/others", icon: <TbSocial size={24} />, label: "Others" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const dispatch = useDispatch();
  const router = useRouter();
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  const TopBar = () => {
    const currentPage =
      [...menuItems]
        .sort((a, b) => b.href.length - a.href.length)
        .find(
          (item) => pathname === item.href || pathname.startsWith(item.href)
        )?.label || "Dashboard";

    return (
      <div className="bg-[#080705] text-main px-4 pb-2 lg:py-6 flex items-center justify-between border-b border-[#191817]">
        <div className="font-semibold text-yellow-400 text-2xl">{currentPage}</div>
      </div>
    );
  };

  const handleLogout = () => {
    dispatch(logOut());
    router.push("/login");
  };

  return (
    <div className="flex bg-[#080705] min-h-screen">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/20 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed z-30 h-screen w-64 transform bg-[#080705] border-r border-[#191817] transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex items-center pt-1 pb-2 pl-12">
          <Link href="/">
            <Image src="/logo.svg" alt="logo" width={100} height={100} className="w-full" />
          </Link>
        </div>

        {/* Menu Items */}
        <nav className="mt-4 px-4">
          {menuItems.map((item, index) => {
            const isActive = (() => {
              if (item.href === "/dashboard") {
                return pathname === "/dashboard";
              }
              return pathname.startsWith(item.href);
            })();
            return (
              <div className="mb-2" key={index}>
                <Link
                  href={item.href}
                  className={`flex items-center text-base font-medium px-4 py-3 rounded-md gap-1 ${
                    isActive
                      ? "grad-btn hover:brightness-150 duration-300 font-bold hover:font-extrabold"
                      : "text-yellow-400 hover:text-black hover:bg-[#fada1b] duration-300"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              </div>
            );
          })}
        </nav>

        {/* Bottom menu */}
        <div className="absolute bottom-0 w-full px-4 mb-6">
          <button onClick={handleLogout} className="flex items-center text-base font-medium px-4 py-3 rounded-md text-white hover:bg-[#fada1b] duration-300 gap-1 w-full cursor-pointer">Logout</button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto lg:ml-64">
        <div className="p-4 lg:hidden">
          <button
            onClick={toggleSidebar}
            className="text-[#fada1b] focus:outline-none"
          >
            <HiOutlineMenuAlt1 size={26} />
          </button>
        </div>
        <TopBar />
        <div className="p-4 text-white">{children}</div>
      </div>
    </div>
  );
}