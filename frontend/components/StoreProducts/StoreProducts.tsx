"use client";
import Image from "next/image";
import React, { useEffect, useState, useMemo } from "react";
import { IoMdArrowDropdown, IoMdClose } from "react-icons/io";
import MainCard from "../ui/MainCard/MainCard";
import CartSidebar from "./CartSidebar";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store/store";
import FilterCard from "../ui/FilterCard/FilterCard";
import { useGetProductsQuery } from "@/app/store/api/services/productApi";
import Loading from "../Loading/Loading";
import image1 from "@/public/cardsImage/ourgames.png";
import image2 from "@/public/cardsImage/ourgames2.png";
import image3 from "@/public/cardsImage/ourgames3.jpg";
import image4 from "@/public/cardsImage/ourgames4.png";
import image5 from "@/public/cardsImage/ourgames5.png";

const sort = [
  { value: "high", label: "High to Low" },
  { value: "low", label: "Low to High" },
];

const gameNames = [
  {
    name: "Blox Fruits",
    description: "Blox Fruits is a Roblox game where you explore islands, fight enemies, and gain powerful abilities from special fruits.",
    image: image1,
    gameId: "blox-fruits",
  },
  {
    name: "Blue Lock Rivals",
    description: "Blue Lock: Rivals is a Roblox soccer game inspired by the Blue Lock anime where players use unique abilities to compete in fast-paced 5v5 matches.",
    image: image2,
    gameId: "blue-lock-rivals",
  },
  {
    name: "Rivals",
    description: "RIVALS: A fast-paced first-person-shooter on Roblox where players face off in 1v1 to 5v5 duels — first to win 5 rounds wins the match",
    image: image3,
    gameId: "rivals",
  },
  // {
  //   name: "Combat Warrior",
  //   description:
  //     "Combat Warriors is a fighting experience. Players compete and fight.",
  //   image: image4,
  //   gameId: "combat-warrior",
  // },
  // {
  //   name: "Anime Reborn",
  //   description:
  //     "Anime Reborn refers to two different things: a popular tower defense game.",
  //   image: image5,
  //   gameId: "anime-reborn",
  // },
];

// Game-category mapping for navigation
const gameCategories = {
  "blox-fruits": [
    { name: "Permanent Fruit", href: "#PermanentFruit" },
    { name: "Gamepass", href: "#Gamepass" },
    { name: "Others", href: "#Others" },
  ],
  rivals: [
    { name: "Best Sellers", href: "#BestSellers" },
    { name: "Bundles", href: "#Bundles" },
    { name: "Keys", href: "#Keys" },
    { name: "Others", href: "#Others" },
  ],
  "blue-lock-rivals": [
    { name: "Gamepass", href: "#Gamepass" },
    { name: "Styles", href: "#Styles" },
    { name: "Flows", href: "#Flows" },
  ],
  "combat-warrior": [
    { name: "Gamepass", href: "#Gamepass" },
    { name: "Aether", href: "#Aether" },
    { name: "Credits", href: "#Credits" },
  ],
  "anime-reborn": [
    { name: "Gamepass", href: "#Gamepass" },
    { name: "Shards", href: "#Shards" },
    { name: "Keys", href: "#Keys" },
    { name: "Stones", href: "#Stones" },
    { name: "Potions", href: "#Potions" },
    { name: "Gold", href: "#Gold" },
    { name: "Gems", href: "#Gems" },
  ],
};

const getCategoryMapping = (categoryName: string) => {
  const categoryMap: { [key: string]: string[] } = {
    "Permanent Fruit": ["Permanent Fruit", "permanent", "permanent fruit"],
    Gamepass: ["Gamepass", "gamepass", "Game Pass"],
    Others: ["Others", "others", "Other"],
    "Best Sellers": ["Best Sellers", "best sellers", "bestsellers"],
    Bundles: ["Bundles", "bundles"],
    Keys: ["Keys", "keys"],
    Styles: ["Styles", "styles"],
    Flows: ["Flows", "flows"],
    Aether: ["Aether", "aether"],
    Credits: ["Credits", "credits"],
    Shards: ["Shards", "shards"],
    Stones: ["Stones", "stones"],
    Potions: ["Potions", "potions"],
    Gold: ["Gold", "gold"],
    Gems: ["Gems", "gems"],
  };

  return categoryMap[categoryName] || [categoryName];
};

export default function StoreProducts() {
  const [activeSection, setActiveSection] = useState("Permanent Fruit");
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState("High to Low");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isScrollingToSection, setIsScrollingToSection] = useState(false);

  const cartItems = useSelector((state: RootState) => state.cart.cartItems);

  // Add new filter states
  const [selectedRarities, setSelectedRarities] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([1, 10000]);
  const [selectedGames, setSelectedGames] = useState<string[]>(["blox-fruits"]);

  const { data: products, isLoading } = useGetProductsQuery(null);

  // Sort function
  const sortProducts = (products: any[], sortType: string) => {
    if (!products) return [];

    const sortedProducts = [...products];
    if (sortType === "high") {
      return sortedProducts.sort(
        (a, b) => parseFloat(b.regularPrice) - parseFloat(a.regularPrice)
      );
    } else if (sortType === "low") {
      return sortedProducts.sort(
        (a, b) => parseFloat(a.regularPrice) - parseFloat(b.regularPrice)
      );
    }
    return sortedProducts;
  };

  // Filter function
  const filterProducts = (products: any[]) => {
    return products.filter((product) => {
      // Filter by rarity
      if (
        selectedRarities.length > 0 &&
        !selectedRarities.includes(product.type)
      ) {
        return false;
      }

      // Filter by price range
      const price = parseFloat(product.regularPrice);
      if (price < priceRange[0] || price > priceRange[1]) {
        return false;
      }

      // Filter by game (using games_name field)
      if (
        selectedGames.length > 0 &&
        !selectedGames.includes(product.games_name)
      ) {
        return false;
      }

      return true;
    });
  };

  // Get data for each category of selected games
  const getCategoryData = (gameId: string, category: string) => {
    const categoryMappings = getCategoryMapping(category);
    const filtered = products?.data?.filter(
      (item: any) =>
        item.games_name === gameId &&
        categoryMappings.some(
          (mapping) => item.category?.toLowerCase() === mapping.toLowerCase()
        )
    );
    const filteredProducts = filterProducts(filtered || []);
    return sortProducts(
      filteredProducts,
      selected === "High to Low"
        ? "high"
        : selected === "Low to High"
        ? "low"
        : "high"
    );
  };

  // Get navigation items for selected games
  const getNavigationItems = () => {
    const items: { name: string; href: string }[] = [];
    selectedGames.forEach((gameId) => {
      const gameCategoriesForGame =
        gameCategories[gameId as keyof typeof gameCategories];
      if (gameCategoriesForGame) {
        items.push(...gameCategoriesForGame);
      }
    });
    return items;
  };

  const navigationItems = getNavigationItems();

  // Handle game selection (single selection only)
  const handleGameChange = (gameId: string) => {
    setSelectedGames([gameId]); 
    setIsScrollingToSection(false); 
    
    const gameCategoriesForGame = gameCategories[gameId as keyof typeof gameCategories];
    if (gameCategoriesForGame && gameCategoriesForGame.length > 0) {
      setActiveSection(gameCategoriesForGame[0].name);
    }
    
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle rarity selection
  const handleRarityChange = (rarity: string) => {
    setSelectedRarities((prev) =>
      prev.includes(rarity)
        ? prev.filter((r) => r !== rarity)
        : [...prev, rarity]
    );
  };

  const handlePriceRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setPriceRange((prev) => [prev[0], value]);
  };

  const clearAllFilters = () => {
    setSelectedRarities([]);
    setPriceRange([1, 10000]);
    setSelectedGames(["blox-fruits"]);
    setSelected("High to Low");
    setActiveSection("Permanent Fruit"); 
    setIsScrollingToSection(false);
  };

  useEffect(() => {
    if (selectedGames.length > 0 && navigationItems.length > 0) {
      let timeoutId: NodeJS.Timeout;
      
      const handleScroll = () => {
        if (isScrollingToSection) return;
        
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          const sections = document.querySelectorAll("section");
          const scrollPosition = window.scrollY + 150; 

          let currentSection = "";
          
          sections.forEach((section) => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionTitle = section.getAttribute("data-title");
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
              currentSection = sectionTitle || "";
            }
          });

          if (currentSection && currentSection !== activeSection) {
            setActiveSection(currentSection);
          }
        }, 50); // Debounce scroll events
      };

      // Set initial active section
      handleScroll();
      
      window.addEventListener("scroll", handleScroll, { passive: true });
      return () => {
        window.removeEventListener("scroll", handleScroll);
        clearTimeout(timeoutId);
      };
    } else {
      setActiveSection("");
    }
  }, [selectedGames, navigationItems, activeSection, isScrollingToSection]);

  useEffect(() => {
    if (selectedGames.length > 0) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [selectedGames]);

  // Set initial active section when navigation items change
  useEffect(() => {
    if (navigationItems.length > 0 && !activeSection) {
      setActiveSection(navigationItems[0].name);
    }
  }, [navigationItems, activeSection]);

  return (
    <div className="flex flex-col lg:flex-row gap-6 ">
      {/* Mobile Filter Button */}
      <button
        onClick={() => setIsFilterOpen(!isFilterOpen)}
        className="lg:hidden fixed bottom-4 left-4 z-50 bg-[#FADA1B] text-black px-4 py-2 rounded-full shadow-lg flex items-center gap-2"
      >
        <span>Filter</span>
        <IoMdArrowDropdown
          size={20}
          className={`transform duration-300 ${
            isFilterOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Sidebar */}
      <aside
        className={`lg:sticky top-4 z-10 w-full lg:w-80 h-fit bg-[#090807] border border-[#3b3b3b] text-white rounded-lg p-4 space-y-6  
          ${cartItems.length > 0 ? "xl:w-[20%]" : "xl:w-[30%]"}
          ${isFilterOpen ? "fixed inset-0 z-50 lg:relative" : "hidden lg:block"}
        `}
      >
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Filter</h2>
          <div className="flex items-center gap-4">
            <button
              onClick={clearAllFilters}
              className="text-[#FADA1B] text-sm hover:underline"
            >
              Clear All
            </button>
            <button
              onClick={() => setIsFilterOpen(false)}
              className="lg:hidden text-white text-sm hover:text-[#FADA1B]"
            >
              <IoMdClose size={24} />
            </button>
          </div>
        </div>

        {/* Game List */}
        <div className="space-y-3 h-[30vh] overflow-y-auto custom-scroll pr-2 ">
          {gameNames.map((item, index) => (
            <FilterCard
              key={index}
              data={item}
              isSelected={selectedGames.includes(item.gameId)}
              onToggle={() => handleGameChange(item.gameId)}
            />
          ))}
        </div>

        {/* Rarity Filter */}
        <div className="bg-[#0c0c09] p-4 rounded-lg">
          <h3 className="text-base font-semibold mb-3">Rarity</h3>
          <div className="space-y-2 text-base">
            {["Common", "Uncommon", "Rare", "Legendary", "Mythical"].map(
              (rarity, idx) => (
                <label key={idx} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="accent-[#FADA1B] w-4 h-4"
                    checked={selectedRarities.includes(rarity.toLowerCase())}
                    onChange={() => handleRarityChange(rarity.toLowerCase())}
                  />
                  <span
                    className={
                      selectedRarities.includes(rarity.toLowerCase())
                        ? "text-[#FADA1B]"
                        : ""
                    }
                  >
                    {rarity}
                  </span>
                </label>
              )
            )}
          </div>
        </div>

        {/* Price Range */}
        <div className="bg-[#0c0c09] p-4 rounded-lg">
          <h3 className="text-sm font-semibold mb-3">Price Range</h3>
          <input
            type="range"
            className="w-full accent-[#FADA1B]"
            min={1}
            max={10000}
            value={priceRange[1]}
            onChange={handlePriceRangeChange}
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>₹{priceRange[0]}</span>
            <span>₹{priceRange[1]}</span>
          </div>
        </div>
      </aside>

      {/* Product Grid */}
      <main className={`w-full ${cartItems.length > 0 ? "lg:w-[60%]" : ""}`}>
        {selectedGames.length > 0 && navigationItems.length > 0 ? (
          <div className="sticky top-24 md:top-4 z-40 bg-[#0a0a09] flex justify-between flex-col md:flex-row gap-4 md:gap-0 p-4 md:p-0">
            <div className="overflow-x-auto w-full custom-scroll">
              <div className="flex gap-4 text-white w-[500px] sm:w-full ">
                {navigationItems.map((item, index) => {
                  const isActive = activeSection === item.name;
                  return (
                    <a
                      key={index}
                      href={item.href}
                      onClick={(e) => {
                        e.preventDefault();
                        setIsScrollingToSection(true);
                        setActiveSection(item.name);
                        
                        const element = document.getElementById(item.href.replace("#", ""));
                        if (element) {
                          element.scrollIntoView({ behavior: "smooth", block: "start" });
                          
                          setTimeout(() => {
                            setIsScrollingToSection(false);
                          }, 1000); 
                        } else {
                          setIsScrollingToSection(false);
                        }
                      }}
                      className="relative px-2 md:px-10 py-2.5 border-x border-transparent text-center group overflow-hidden whitespace-nowrap"
                    >
                      {isActive && (
                        <div className="absolute border-x border-[#FBDE6E] inset-0 bg-[#fdfdfd00] backdrop-blur-[1px] z-0" />
                      )}
                      <span
                        className={`relative z-10 block text-xs ${
                          isActive ? "text-[#FBDE6E]" : "text-white/60"
                        }`}
                      >
                        {item.name}
                      </span>
                      {isActive && (
                        <>
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-20 h-3 bg-[#f7d54f] blur-sm rounded-full z-0" />
                          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60%] h-[1px] bg-yellow-500 rounded-full z-10" />
                        </>
                      )}
                    </a>
                  );
                })}
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2.5 pr-2">
              <div className="relative z-10 w-36 text-white bg-gradient-to-l from-[#4a45291f] to-[#fad81b41] p-[1px] rounded-sm">
                <button
                  className="text-xs px-2 sm:text-sm  w-full flex justify-between items-center rounded-sm bg-[#0a0a09] selects-border cursor-pointer  duration-300"
                  onClick={() => setIsOpen(!isOpen)}
                >
                  {selected}
                  <IoMdArrowDropdown
                    size={24}
                    className={`text-xs sm:text-sm xl:text-lg duration-300 transform ${
                      isOpen ? "rotate-180" : "rotate-0"
                    }`}
                  />
                </button>
                <div
                  className={`absolute drop-shadow-[0_0_2px_rgba(255,255,0,0.7)] mt-1 w-full scrollbar-hide transition-all duration-300 ease-linear overflow-hidden 
                    ${
                      isOpen
                        ? "opacity-100 max-h-[420px] scale-y-100"
                        : "opacity-100 max-h-0 scale-y-95"
                    }`}
                >
                  <ul>
                    {["Select one", "High to Low", "Low to High"].map(
                      (label) => (
                        <li
                          key={label}
                          className={`text-xs sm:text-sm p-1 bg-[#0a0a09] hover:text-[#0a0a09]  cursor-pointer capitalize  ${
                            selected === label
                              ? "bg-[#FADA1B] text-[#0a0a09]"
                              : "hover:bg-[#FADA1B] "
                          }`}
                          onClick={() => {
                            setSelected(label);
                            setIsOpen(false);
                          }}
                        >
                          {label}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ) : (
          ""
        )}

        {/* Sections */}
        {selectedGames.map((gameId) => {
          const gameCategoriesForGame =
            gameCategories[gameId as keyof typeof gameCategories];
          if (!gameCategoriesForGame) return null;

          return gameCategoriesForGame.map((category) => {
            const categoryData = getCategoryData(gameId, category.name);
            const sectionId = category.href.replace("#", "");

            return (
              <section
                key={`${gameId}-${category.name}`}
                id={sectionId}
                data-title={category.name}
                className="mb-24 scroll-mt-32"
              >
                <h2 className="text-[1.5rem] lg:text-[2.5rem] font-semibold mb-4">
                  <span className="bg-gradient-to-l from-white via-[#FADA1B] to-[#FADA1B] text-transparent bg-clip-text">
                    {category.name}
                  </span>
                </h2>
                {isLoading ? (
                  <Loading />
                ) : (
                  <div
                      className={`grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 ${
                        cartItems.length > 0 ? "lg:grid-cols-2" : "xl:grid-cols-4"
                      }`}
                    >
                    {categoryData.length > 0 ? (
                      categoryData?.map((item: any, index: number) => (
                        <MainCard key={index} data={item} />
                      ))
                    ) : (
                      <div className="flex justify-center items-center h-96 w-full col-span-full">
                        <h2 className="text-2xl font-semibold text-white text-center">
                          No data found
                        </h2>
                      </div>
                    )}
                  </div>
                )}
              </section>
            );
          });
        })}
      </main>
      <aside
        className={`lg:sticky top-4 z-40 w-full lg:w-80 xl:w-[20%] h-fit bg-[#090807] border border-[#3b3b3b] text-white rounded-lg p-4 space-y-6  ${
          cartItems.length > 0 ? " transition-all duration-300 hidden lg:block" : "hidden"
        }`}
      >
        <CartSidebar />
      </aside>
    </div>
  );
}
