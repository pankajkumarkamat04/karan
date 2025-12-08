import OurGamesCard from "@/components/ui/OurGamesCard/OurGamesCard";
import image1 from "@/public/cardsImage/ourgames.png";
import image2 from "@/public/cardsImage/ourgames2.png";
import image3 from "@/public/cardsImage/ourgames3.jpg";
import image4 from "@/public/cardsImage/ourgames4.png";
import image5 from "@/public/cardsImage/ourgames5.png";
import React from "react";

const data = [
  {
    title: "Blox Fruits",
    items: 16,
    description: "Blox Fruits are one of the four main ways to deal d...",
    image: image1,
    url:"/gamestore"
  },
  {
    title: "Blue Lock Rivals",
    items: 16,
    description: "Blue Lock Rivals, a free-to-play Roblox game. Th...",
    image: image2,
    url:"/gamestore"
  },
  {
    title: "Rivals",
    items: 16,
    description: "RIVALS is a first-person shooter game on Roblox...",
    image: image3,
    url:"/gamestore"
  },
  {
    title: "Combat Warrior",
    items: 16,
    description:
      "Combat Warriors is a fighting experience. Players compete and fight others, and t...",
    image: image4,
    url:"/gamestore"
  },
  {
    title: "Anime Reborn",
    items: 16,
    description:
      "Anime Reborn refers to two different things: a popular tower defense game o...",
    image: image5,
    url:"/gamestore"
  },
];

export default function OurGames() {
  return (
    <div className="text-white max-w-[1320px] mx-auto px-4 2 mt-20">
      <div className="mb-12 lg:flex items-center justify-between">
        <h1 className="text-3xl xl:text-5xl font-medium uppercase">
          Our <span className="text-[#FADA1B]">Games</span>
        </h1>
        
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-12 gap-6">
        {data.map((item, index) => {
          const spanClass = index < 3 ? "xl:col-span-4" : "xl:col-span-6";
          return (
            <div key={index} className={spanClass}>
              <OurGamesCard game={item} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
