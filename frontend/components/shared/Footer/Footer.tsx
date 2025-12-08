"use client";
import React, { useEffect } from "react";
import { FaDiscord, FaInstagram, FaTwitter, FaFacebook } from "react-icons/fa";
import Image from "next/image";
import logo from "@/public/logo.svg";
import { useSubscribeToEmailMutation } from "@/app/store/api/services/emailSubscriptionApi";
import { toast } from "sonner";
import Link from "next/link";


// Add this to fix the TS error
declare global {
  interface Window {
    $crisp: any[];
    CRISP_WEBSITE_ID: string;
  }
}

const Footer = () => {
  const [subscribeToEmail, { isLoading }] = useSubscribeToEmailMutation();

  // CRISP CHAT INTEGRATION
  useEffect(() => {
    if (typeof window !== "undefined" && !window.$crisp) {
      window.$crisp = [];
      window.CRISP_WEBSITE_ID = "2bb951fc-bf28-4bda-a89a-4bd032d123b8";
      const d = document;
      const s = d.createElement("script");
      s.src = "https://client.crisp.chat/l.js";
      s.async = true;
      d.getElementsByTagName("head")[0].appendChild(s);
    }
  }, []);

  const handleSubscribe = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    try {
      const response = await subscribeToEmail({ email }).unwrap();

      if (response.success) {
        toast.success("Email subscribed successfully");
      } else {
        toast.error("Failed to subscribe");
      }
    } catch (error: any) {
      toast.error(error?.data?.message?.message || "Subscription error");
    }
  };

  return (
    <footer className="text-white border-t border-[#e4e4e414]">
      <div className="max-w-[1616px] mx-auto px-4 py-10">
        <div className="flex flex-col lg:flex-row justify-between items-start mb-6 lg:mb-8 gap-6">
          <div className="flex items-center space-x-2">
            <Image src={logo} alt="logo" width={183} height={52} className="" />
          </div>
          <div className="flex space-x-4 text-lg text-white">
            <a href="#">
              <FaFacebook size={24} />
            </a>
            <a href="#">
              <FaInstagram size={24} />
            </a>
            <a href="#">
              <FaTwitter size={24} />
            </a>
            <a href="#">
              <FaDiscord size={24} />
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Logo + Newsletter - Now spanning 2 columns */}
          <div className="lg:col-span-2">
            <p className="mb-4 text-xl font-medium">Don't miss our latest News</p>
            <form className="flex relative" onSubmit={handleSubscribe}>
              <input
                type="email"
                placeholder="Email address"
                className="bg-[#15131d] text-white p-3 rounded-lg w-full outline-none"
                name="email"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-sm bg-gradient-to-l to-[#FADA1B] from-[#FFF] text-black px-4 py-2 rounded-sm font-semibold cursor-pointer"
              >
                {isLoading ? "Subscribing..." : "Subscribe"}
              </button>
            </form>
            <div className="text-sm text-[#F0F0F0] mt-6 space-y-4">
              <p>
                Blox Fruit Hub is the premier marketplace for acquiring exclusive and high-quality Roblox items. Enjoy lightning-fast delivery, secure payments, and a trusted service that has helped thousands of gamers enhance their experience with the items they adore.
              </p>
              <p>
                Blox Fruit Hub is not affiliated with Roblox Corporation. All in-game assets are the property of their respective owners.
              </p>
            </div>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="font-semibold mb-3">Social Media</h3>
            <ul className="space-y-8 text-gray-300">
              <li>
                <a href="#">Discord</a>
              </li>
              <li>
                <a href="#">Instagram</a>
              </li>
              <li>
                <a href="#faq">FAQ</a>
              </li>
            </ul>
          </div>

          {/* All Pages */}
          <div>
            <h3 className="font-semibold mb-3">All Pages</h3>
            <ul className="space-y-8 text-gray-300">
              <li>
                <Link href="/">Home</Link>
              </li>
              <li>
                <Link href="/gamestore">Store</Link>
              </li>
            </ul>
          </div>

          {/* Products */}
          <div>
            <h3 className="font-semibold mb-3">Products</h3>
            <ul className="space-y-8 text-gray-300">
              <li>
                <Link href="/gamestore">Blox Fruits</Link>
              </li>
              <li>
                <Link href="/gamestore">Blue Lock Rivals</Link>
              </li>
              <li>
                <Link href="/gamestore">Rivals</Link>
              </li>
              <li>
                <Link href="/gamestore">Combat Warrior</Link>
              </li>
              <li>
                <Link href="/gamestore">Anime Reborn</Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4 text-lg">Legal</h3>
            <ul className="space-y-4 text-gray-300">
              <li>
                <Link href="/terms-of-service">Terms of Service</Link>
              </li>
              <li>
                <Link href="/privacy-policy">Privacy Policy</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-[#e4e4e414] mt-10 text-sm text-gray-500">
        <div className="max-w-[1616px] mx-auto py-5 flex flex-col md:flex-row justify-between items-center ">
          <div className="space-x-4 mb-3 md:mb-0">
            <a href="#">Privacy Policy</a>
            <a href="#">TOS</a>
            <a href="#">Cookies Policy</a>
          </div>
          <p className="mt-4 md:mt-0">© 2025 Rivals. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
