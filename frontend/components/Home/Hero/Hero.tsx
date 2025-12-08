"use client";
import React from "react";
import bannerbackground from "@/public/images/hero.svg";
import gamecharecter from "@/public/images/gamecharecter.png";
import Link from "next/link";
const Hero = () => {
  return (
    <div className="max-w-[1616px] mx-auto px-4  xl:py-4 text-white mt-4 xl:mt-0">
      <div
        className="h-[64vh] xl:h-[100vh] bg-cover bg-center rounded-t-xl flex relative overflow-hidden "
        style={{
          backgroundImage: `url(${bannerbackground.src})`,
        }}
      >
        <div className="absolute top-0 left-0 w-full h-full bg-[#0e0c15]/90"></div>
        <div className="max-w-[1320px] mx-auto flex flex-row-reverse justify-between items-center  ">
          <div className="absolute right-0 ">
            <img
              src={gamecharecter.src}
              alt="gamecharecter"
              className="hidden lg:block aspect-square lg:h-[500px] xl:h-[600px] 2xl:h-[800px] z-10"
            />
          </div>
          <div className="h-32 w-full bg-[#100b19] absolute -bottom-10 xl:-bottom-5 right-0 blur-sm"></div>
          <div className="relative ">
            <div className="lg:-ml-[22.9%] 2xl:-ml-[32.9%] px-4 xl:px-0">
              <span className="text-[1.2rem]  xl:text-[1.5rem] font-medium bg-gradient-to-l to-[#FADA1B] via-[#fad81bc0] from-white bg-clip-text text-transparent ">
                Unlock Exclusive Roblox Gear in Seconds!
              </span>
              <h1 className="text-[2rem] xl:text-[4.5rem] font-bold leading-[110%] max-w-[19ch]">
                Buy Your Favorite In-Game Items{" "}
                <span className="bg-gradient-to-l to-[#FADA1B] from-white bg-clip-text text-transparent ">
                  Instantly
                </span>
                ,{" "}
                <span className="bg-[#FADA1B] bg-clip-text text-transparent ">
                  Securely
                </span>
                ,{" "}
                <span className="bg-gradient-to-l to-[#FADA1B] from-white bg-clip-text text-transparent ">
                  and Easily{" "}
                </span>
                with Blox Fruit Hub!
              </h1>
              <p className="text-sm xl:text-base max-w-[60ch]">
                Looking for fast and trusted item purchases in BloxFruits, Blue
                Lock Rivals, Rivals, Combat Warrior, and Anime Reborn? Blox
                Fruit Hub delivers your favorite items instantly.
              </p>
              <Link href='/gamestore' className="flex w-fit items-center grad-btn hover:opacity-90 text-black px-8 py-3 font-medium text-base cursor-pointer mt-8 duration-300 hover:brightness-150">
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
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;