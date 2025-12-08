"use client";
import { useState } from "react";
import { LuChevronDown } from "react-icons/lu";
import Image from "next/image";
import faqImage from "@/public/faq.png";
import { IoMdArrowDropdown } from "react-icons/io";

const faqData = [
  {
    question: "Why choose Blox Fruit hub?",
    answer:
      "We sell premium Roblox game items—including Blox Fruits, Rivals, Blue Lock Rivals, and more—delivered safely through in-game gifting. Fast, secure, and affordable—no codes, no passwords, just trusted service.",
  },
  {
    question:
      "How do I complete my purchase?",
    answer:
      "Just select the items you want, add your Roblox username at checkout, and place your order. We'll deliver everything quickly and safely through in-game gifting—no extra steps needed!",
  },
  {
    question: "How fast is the delivery?",
    answer:
      "Lightning fast! Most orders are delivered within minutes of purchase— at max within 24 hours, just quick and secure in-game delivery so you can jump right into the action.",
  },
  {
    question:
      "Is gifting items to a friend possible?",
    answer:
      "Absolutely! Just enter your friend's Roblox username at checkout and our team will handle the delivery smoothly and quickly.",
  },
  {
    question:
      "What should I do if I haven't received my items?",
    answer:
      "No worries! If your items haven't arrived, reach out to our support team anytime—we're here 24/7 to ensure you get what you paid for, fast.",
  },
  {
    question: "What is the process of requesting refunds?",
    answer:
      "Simply contact our discord support team with your order details. We'll review your request promptly and do our best to resolve it—your satisfaction always comes first. You must comply with our Refund Policy.",
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="max-w-[1320px] mx-auto px-4 2 my-20 ">
      <div className="">
        <div className="space-y-6">
          {faqData.map((item, index) => (
            <div
              key={index}
              className={`rounded-lg shadow-lg transition transform ${openIndex === index ? "bg-[#0a0a09]":"bg-[#0c0c0d]"}`}
            >
              <button
                onClick={() => toggleAccordion(index)}
                className="w-full flex justify-between items-center text-left pl-6  text-white font-medium text-lg "
              >
                <div className="flex items-center gap-6">
                  <span className="h-8 w-8 text-base text-black font-semibold bg-gradient-to-l to-[#FADA1B] from-white rounded-full flex items-center justify-center drop-shadow-[0_0_3px_rgba(255,255,0,0.7)]">
                    {index + 1}
                  </span>
                  <span className="text-sm md:text-base">{item.question}</span>
                </div>
                <div className=" relative transform transition-transform ">
                  <Image src={faqImage} alt="faq" width={124} height={72} />
                  <IoMdArrowDropdown size={24} className={`text-[#FADA1B] absolute right-[40%] top-[40%] duration-300 ${openIndex === index ? "rotate-180":""}`} />
                </div>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index
                    ? "max-h-96 opacity-100 py-4 px-6 text-gray-300"
                    : "max-h-0 opacity-0"
                }`}
              >
                {item.answer}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
