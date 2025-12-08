import Hero from "@/components/Home/Hero/Hero";
import OurGames from "@/components/Home/OurGames/OurGames";
import OurBestSell from "@/components/Home/OurBestSell/OurBestSell";
import WhyChoose from "@/components/Home/WhyChoose/WhyChoose";
import FAQ from "@/components/Home/FAQ/FAQ";
import PurchaseLimitNotification from "@/components/Home/PurchaseLimitNotification/PurchaseLimitNotification";

const page = () => {
  return (
    <div className="fade-in">
      <PurchaseLimitNotification />
      <Hero />
      <WhyChoose />
      <OurGames />
      <OurBestSell />
      <FAQ />
    </div>
  );
};

export default page;
