import React from "react";
import Image from "next/image";
import image1 from "@/public/cardsImage/whychoose.png";
import image2 from "@/public/cardsImage/whychoose2.png";
import image3 from "@/public/cardsImage/whychoose3.png";

const cardData = [
  {
    image: image1,
    title: "Instant Delivery",
    description: "No waiting. Get your in-game items within moments!",
  },
  {
    image: image2,
    title: "Affordable Pricing",
    description: "Enjoy the best deals for premium in-game gear.",
  },
  {
    image: image3,
    title: "Guaranteed Security",
    description:
      "Our system provides secure and seamless transactions, ensuring your peace of mind.",
  },
];

const Card = ({
  image,
  title,
  description,
}: {
  image: any;
  title: string;
  description: string;
}) => (
  <div className="bg-[#0a0a09] rounded-lg relative">
    <div className="relative">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        
        viewBox="0 0 416 280"
        fill="none"
      >
        <path d="M45 48L416 0L408 280H0L45 48Z" fill="#151411" />
      </svg>
      <Image
        src={image}
        height={140}
        width={140}
        alt="why choose"
        className="absolute h-28 w-28 xl:h-36 xl:w-36 -top-10 left-1/3"
      />
      <div className="absolute top-10 left-0 w-full h-full flex flex-col items-center justify-center px-4">
        <h2 className="text-[1.5rem] font-medium text-white text-center mb-2">
          {title}
        </h2>
        <p className="text-[#BEC1CE] text-center w-[32ch]">{description}</p>
      </div>
    </div>
  </div>
);

export default function WhyChoose() {
  return (
    <div className="max-w-[1320px] mx-auto px-4 2 mt-20">
      <div className="mb-24 lg:flex items-center justify-between text-white">
        <h1 className="text-3xl xl:text-5xl font-medium uppercase">
          Why Choose{" "}
          <span className="bg-gradient-to-l to-[#FADA1B] from-white bg-clip-text text-transparent">
            Blox Fruit Hub?
          </span>
        </h1>
      </div>
      <div className="space-y-6 md:space-y-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
        {cardData.map((item, index) => (
          <Card key={index} {...item} />
        ))}
      </div>
    </div>
  );
}
