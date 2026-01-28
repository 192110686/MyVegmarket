export type ProductCategory =
  | "vegetables"
  | "fruits"
  | "spices"
  | "nuts"
  | "eggs"
  | "oils";

export type Product = {
  id: string;
  name: string;
  subtitle: string;
  category: ProductCategory;
  origin: string;
  type: "Organic" | "Regular";
  unit: string;
  marketAvg: number; // Al Aweer Rate
  myPrice: number; // MyVegMarket Price
  image: string; // primary image
  fallbackImage?: string; // fallback if primary fails
  badgeColor: string;
  about?: string;
  packaging?: string;
  freshness?: string;
};

// Use direct images.unsplash.com URLs (stable, not random like source.unsplash.com)
const FALLBACK_PRODUCE =
  "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=80";

export const PRODUCTS: Product[] = [
  // ----------------------------
  // VEGETABLES
  // ----------------------------
  {
    id: "tomato-uae",
    name: "Tomato (Local)",
    subtitle: "Fresh Daily Supply • Per KG",
    category: "vegetables",
    origin: "UAE",
    type: "Regular",
    unit: "KG",
    marketAvg: 9.5,
    myPrice: 6.75,
    image:
     "/images/products/vegetables/tomato.jpeg",
    fallbackImage: FALLBACK_PRODUCE,
    badgeColor: "bg-red-600",
    packaging: "Per KG",
    freshness: "Arrived This Morning",
    about:
      "Fresh local tomatoes with good firmness—ideal for restaurants and daily bulk cooking.",
  },
  {
    id: "cucumber-uae",
    name: "Cucumber (Local)",
    subtitle: "Crisp & Clean • 5kg Carton",
    category: "vegetables",
    origin: "UAE",
    type: "Regular",
    unit: "Carton",
    marketAvg: 22,
    myPrice: 18.5,
    image:
      "/images/products/vegetables/cucumber.jpeg",
    fallbackImage: FALLBACK_PRODUCE,
    badgeColor: "bg-green-700",
    packaging: "5kg Carton",
    freshness: "Harvested 24h ago",
    about:
      "Crisp cucumbers for salads and juice bars. Clean grading and stable supply.",
  },
  
  {
    id: "carrot-aus",
    name: "Carrot (Australia)",
    subtitle: "Crunchy & Sweet • 10kg Bag",
    category: "vegetables",
    origin: "Australia",
    type: "Regular",
    unit: "Bag",
    marketAvg: 38,
    myPrice: 32,
    image:
      "https://images.unsplash.com/photo-1447175008436-054170c2e979?auto=format&fit=crop&w=1600&q=80",
    fallbackImage: FALLBACK_PRODUCE,
    badgeColor: "bg-orange-600",
    packaging: "10kg Bag",
    freshness: "Chilled Storage",
    about:
      "Premium carrots with consistent crunch—great for salads, juices and soups.",
  },
   {
    id: "drumstick",
    name: "Drumstick (Moringa)",
    subtitle: "Fresh Pods • Per KG",
    category: "vegetables",
    origin: "India",
    type: "Regular",
    unit: "KG",
    marketAvg: 22,
    myPrice: 18,
    image: "/images/products/vegetables/drumstick.png",
    badgeColor: "bg-emerald-700",
    packaging: "Per KG",
    freshness: "Harvested Recently",
    about: "Fresh drumsticks—ideal for sambar and South Indian cuisine.",
  },
   {
    id: "cluster-beans",
    name: "Cluster Beans (Chikudukaya)",
    subtitle: "Fresh • Per KG",
    category: "vegetables",
    origin: "India",
    type: "Regular",
    unit: "KG",
    marketAvg: 20,
    myPrice: 16.5,
    image: "/images/products/vegetables/chikudukaya.png",
    badgeColor: "bg-green-800",
    packaging: "Per KG",
    freshness: "Fresh Stock",
    about: "Fresh chikudukaya—popular for stir fry and curries.",
  },
   {
    id: "coconut",
    name: "Coconut",
    subtitle: "Whole • Per Piece",
    category: "vegetables",
    origin: "Sri Lanka",
    type: "Regular",
    unit: "Piece",
    marketAvg: 6,
    myPrice: 4.75,
    image: "/images/products/vegetables/coconut.png",
    badgeColor: "bg-stone-700",
    packaging: "Per Piece",
    freshness: "New Stock",
    about: "Whole coconuts—good for fresh cooking and catering prep.",
  },
  {
    id: "onion-red-oman",
    name: "Red Onions (Oman)",
    subtitle: "Medium Size • 10kg Bag",
    category: "vegetables",
    origin: "Oman",
    type: "Regular",
    unit: "Bag",
    marketAvg: 32,
    myPrice: 26.5,
    image: "/images/products/vegetables/onion.png",
    badgeColor: "bg-red-800",
    packaging: "10kg Bag",
    freshness: "Daily Supply",
    about:
      "Stable daily onion supply with consistent sizing—ideal for large kitchens.",
  },
   {
    id: "garlic",
    name: "Garlic",
    subtitle: "Fresh Bulbs • Per KG",
    category: "vegetables",
    origin: "China",
    type: "Regular",
    unit: "KG",
    marketAvg: 18,
    myPrice: 14.5,
    image: "/images/products/vegetables/garlic.png",
    badgeColor: "bg-zinc-700",
    packaging: "Per KG",
    freshness: "New Stock",
    about: "Clean garlic bulbs—great for restaurants and bulk cooking.",
  },
   {
    id: "ginger",
    name: "Ginger",
    subtitle: "Fresh Roots • Per KG",
    category: "vegetables",
    origin: "India",
    type: "Regular",
    unit: "KG",
    marketAvg: 16,
    myPrice: 12.75,
    image: "/images/products/vegetables/ginger.png",
    badgeColor: "bg-amber-700",
    packaging: "Per KG",
    freshness: "Fresh Batch",
    about: "Aromatic ginger roots—perfect for tea, marinades, and kitchens.",
  },

  // ----------------------------
  // FRUITS
  // ----------------------------
  {
    id: "apple-turkey",
    name: "Apple (Turkey)",
    subtitle: "Crisp & Sweet • 18kg Carton",
    category: "fruits",
    origin: "Turkey",
    type: "Regular",
    unit: "Carton",
    marketAvg: 95,
    myPrice: 86,
    image:
      "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=1600&q=80",
    fallbackImage: FALLBACK_PRODUCE,
    badgeColor: "bg-red-600",
    packaging: "18kg Carton",
    freshness: "Import Batch Today",
    about:
      "Premium apples with strong crunch and shelf life—ideal for hotels and retail supply.",
  },
  {
    id: "banana-ecuador",
    name: "Banana (Ecuador)",
    subtitle: "Premium Grade • 13kg Carton",
    category: "fruits",
    origin: "Ecuador",
    type: "Regular",
    unit: "Carton",
    marketAvg: 62,
    myPrice: 56,
    image:
      "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=1600&q=80",
    fallbackImage: FALLBACK_PRODUCE,
    badgeColor: "bg-yellow-500",
    packaging: "13kg Carton",
    freshness: "Ripening Controlled",
    about:
      "Consistent size bananas—great for breakfast buffets, smoothie bars and grocery supply.",
  },
  {
    id: "grapes-india",
    name: "Green Grapes (India)",
    subtitle: "Seedless • 4.5kg Box",
    category: "fruits",
    origin: "India",
    type: "Regular",
    unit: "Box",
    marketAvg: 78,
    myPrice: 69,
    image:
      "https://images.unsplash.com/photo-1519996529931-28324d5a630e?auto=format&fit=crop&w=1600&q=80",
    fallbackImage: FALLBACK_PRODUCE,
    badgeColor: "bg-emerald-600",
    packaging: "4.5kg Box",
    freshness: "Cold Chain Delivered",
    about:
      "Sweet seedless grapes for desserts and fruit platters—handled in cold chain.",
  },
  {
    id: "orange-egypt",
    name: "Valencia Oranges (Egypt)",
    subtitle: "Juice Grade • 15kg Carton",
    category: "fruits",
    origin: "Egypt",
    type: "Regular",
    unit: "Carton",
    marketAvg: 75,
    myPrice: 68,
    image:
      "https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&w=1600&q=80",
    fallbackImage: FALLBACK_PRODUCE,
    badgeColor: "bg-orange-600",
    packaging: "15kg Carton",
    freshness: "Import Batch Today",
    about:
      "Juicy oranges with consistent sweetness—perfect for juice stations and breakfast service.",
  },
  {
    id: "pineapple-ph",
    name: "Pineapple (Philippines)",
    subtitle: "Golden Sweet • 12pcs Carton",
    category: "fruits",
    origin: "Philippines",
    type: "Regular",
    unit: "Carton",
    marketAvg: 92,
    myPrice: 84,
    image:
      "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=1600&q=80",
    fallbackImage: FALLBACK_PRODUCE,
    badgeColor: "bg-amber-600",
    packaging: "12pcs Carton",
    freshness: "Chilled Import Stock",
    about:
      "Sweet pineapples with good yield for juice and dessert counters—ideal for catering.",
  },

  // ----------------------------
  // EGGS
  // ----------------------------
  {
    id: "eggs-brown-uae",
    name: "Brown Eggs (UAE)",
    subtitle: "Farm Fresh • 30 pcs Tray",
    category: "eggs",
    origin: "UAE",
    type: "Organic",
    unit: "Tray",
    marketAvg: 19,
    myPrice: 16.5,
    image:
      "https://images.unsplash.com/photo-1587486913049-53fc88980cfc?auto=format&fit=crop&w=1600&q=80",
    fallbackImage: FALLBACK_PRODUCE,
    badgeColor: "bg-neutral-700",
    packaging: "30 pcs Tray",
    freshness: "Collected Today",
    about:
      "Locally sourced brown eggs—perfect for bakeries, cafes and breakfast operations.",
  },
  {
    id: "white-eggs-uae",
    name: "White Eggs (UAE)",
    subtitle: "Daily Supply • 30 pcs Tray",
    category: "eggs",
    origin: "UAE",
    type: "Regular",
    unit: "Tray",
    marketAvg: 18,
    myPrice: 15.5,
    image:
      "https://images.unsplash.com/photo-1587486913049-53fc88980cfc?auto=format&fit=crop&w=1600&q=80",
    fallbackImage: FALLBACK_PRODUCE,
    badgeColor: "bg-neutral-700",
    packaging: "30 pcs Tray",
    freshness: "Daily Delivery",
    about:
      "Clean white eggs with stable daily supply—best for restaurants and supermarkets.",
  },
  {
    id: "quail-eggs-uae",
    name: "Quail Eggs",
    subtitle: "Premium Pack • 24 pcs",
    category: "eggs",
    origin: "UAE",
    type: "Regular",
    unit: "Pack",
    marketAvg: 28,
    myPrice: 24,
    image:
      "https://images.unsplash.com/photo-1604908177522-040a1340b3b9?auto=format&fit=crop&w=1600&q=80",
    fallbackImage: FALLBACK_PRODUCE,
    badgeColor: "bg-zinc-800",
    packaging: "24 pcs Pack",
    freshness: "Chilled Stock",
    about:
      "Popular for gourmet plating and premium catering—packed clean and delivered chilled.",
  },

  // ----------------------------
  // SPICES
  // ----------------------------
  {
    id: "cardamom-green",
    name: "Cardamom (Green)",
    subtitle: "Aromatic Pods • 1kg Pack",
    category: "spices",
    origin: "India",
    type: "Regular",
    unit: "KG",
    marketAvg: 0,
    myPrice: 0,
    image:
      "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1600&q=80",
    fallbackImage: FALLBACK_PRODUCE,
    badgeColor: "bg-emerald-700",
    packaging: "1kg Pack",
    freshness: "Sealed Pack",
    about: "Premium green cardamom—ideal for tea, desserts and masala blends.",
  },
  {
    id: "black-pepper",
    name: "Black Pepper",
    subtitle: "Whole Peppercorn • 1kg Pack",
    category: "spices",
    origin: "Vietnam",
    type: "Regular",
    unit: "KG",
    marketAvg: 0,
    myPrice: 0,
    image:
      "https://images.unsplash.com/photo-1615485737651-580c9159c89a?auto=format&fit=crop&w=1600&q=80",
    fallbackImage: FALLBACK_PRODUCE,
    badgeColor: "bg-neutral-800",
    packaging: "1kg Pack",
    freshness: "Sealed Pack",
    about: "Whole peppercorns with strong pungency—perfect for kitchens and grinders.",
  },
  {
    id: "turmeric",
    name: "Turmeric Powder",
    subtitle: "Fine Ground • 1kg Pack",
    category: "spices",
    origin: "India",
    type: "Regular",
    unit: "KG",
    marketAvg: 0,
    myPrice: 0,
    image:
      "https://images.unsplash.com/photo-1615485500704-8e990f5b1b2f?auto=format&fit=crop&w=1600&q=80",
    fallbackImage: FALLBACK_PRODUCE,
    badgeColor: "bg-yellow-600",
    packaging: "1kg Pack",
    freshness: "Sealed Pack",
    about: "Bright color and aroma—best for curries, marinades and bulk cooking.",
  },

  // ----------------------------
  // NUTS (important: use DRY FRUITS / MIXED NUTS visuals)
  // ----------------------------
  {
    id: "cashew",
    name: "Cashew Nuts",
    subtitle: "Whole Premium • 10kg Carton",
    category: "nuts",
    origin: "Vietnam",
    type: "Regular",
    unit: "Carton",
    marketAvg: 0,
    myPrice: 0,
    image:
      "https://images.unsplash.com/photo-1603046891288-5ae31f3e1dae?auto=format&fit=crop&w=1600&q=80",
    fallbackImage:
      "https://images.unsplash.com/photo-1633168850968-76be3bb0a2fc?auto=format&fit=crop&w=1600&q=80",
    badgeColor: "bg-amber-600",
    packaging: "10kg Carton",
    freshness: "Sealed Carton",
    about: "Whole cashews for sweets, snacks and bulk kitchen use.",
  },
  {
    id: "almond",
    name: "Almond",
    subtitle: "Premium Grade • 10kg Carton",
    category: "nuts",
    origin: "USA",
    type: "Regular",
    unit: "Carton",
    marketAvg: 0,
    myPrice: 0,
    image:
      "https://images.unsplash.com/photo-1542990253-0f2b9a7f8f91?auto=format&fit=crop&w=1600&q=80",
    fallbackImage:
      "https://images.unsplash.com/photo-1633168850968-76be3bb0a2fc?auto=format&fit=crop&w=1600&q=80",
    badgeColor: "bg-rose-700",
    packaging: "10kg Carton",
    freshness: "Sealed Carton",
    about: "Crunchy almonds for bakeries, cafes and retail packing.",
  },
  {
    id: "walnut",
    name: "Walnut",
    subtitle: "Shelled • 10kg Carton",
    category: "nuts",
    origin: "Chile",
    type: "Regular",
    unit: "Carton",
    marketAvg: 0,
    myPrice: 0,
    image:
      "https://images.unsplash.com/photo-1505576391880-b3f9d713dc0b?auto=format&fit=crop&w=1600&q=80",
    fallbackImage:
      "https://images.unsplash.com/photo-1633168850968-76be3bb0a2fc?auto=format&fit=crop&w=1600&q=80",
    badgeColor: "bg-stone-700",
    packaging: "10kg Carton",
    freshness: "Sealed Carton",
    about: "Premium walnuts—perfect for desserts, salads and healthy mixes.",
  },
  {
    id: "dates",
    name: "Dates",
    subtitle: "Premium Grade • 5kg Box",
    category: "nuts",
    origin: "UAE",
    type: "Regular",
    unit: "Box",
    marketAvg: 0,
    myPrice: 0,
    image:
      "https://images.unsplash.com/photo-1590080876209-7b0f2f7a9f94?auto=format&fit=crop&w=1600&q=80",
    fallbackImage:
      "https://images.unsplash.com/photo-1633168850968-76be3bb0a2fc?auto=format&fit=crop&w=1600&q=80",
    badgeColor: "bg-amber-800",
    packaging: "5kg Box",
    freshness: "Packed Fresh",
    about: "Soft premium dates for retail, gifting and hotel breakfast service.",
  },
  {
    id: "raisins",
    name: "Dry Grapes (Raisins)",
    subtitle: "Golden Raisins • 5kg Pack",
    category: "nuts",
    origin: "Turkey",
    type: "Regular",
    unit: "Pack",
    marketAvg: 0,
    myPrice: 0,
    image:
      "https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?auto=format&fit=crop&w=1600&q=80",
    fallbackImage:
      "https://images.unsplash.com/photo-1633168850968-76be3bb0a2fc?auto=format&fit=crop&w=1600&q=80",
    badgeColor: "bg-yellow-700",
    packaging: "5kg Pack",
    freshness: "Sealed Pack",
    about: "Golden raisins for bakeries, desserts and bulk mixes.",
  },
  {
    id: "pista",
    name: "Pistachio",
    subtitle: "Premium • 10kg Carton",
    category: "nuts",
    origin: "Iran",
    type: "Regular",
    unit: "Carton",
    marketAvg: 0,
    myPrice: 0,
    image:
      "https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=1600&q=80",
    fallbackImage:
      "https://images.unsplash.com/photo-1633168850968-76be3bb0a2fc?auto=format&fit=crop&w=1600&q=80",
    badgeColor: "bg-lime-700",
    packaging: "10kg Carton",
    freshness: "Sealed Carton",
    about: "Premium pistachios for sweets, ice cream, bakeries and retail packs.",
  },

  // ----------------------------
  // OILS
  // ----------------------------
  {
    id: "olive-oil",
    name: "Olive Oil",
    subtitle: "Extra Virgin • 5L Tin",
    category: "oils",
    origin: "Spain",
    type: "Regular",
    unit: "Tin",
    marketAvg: 0,
    myPrice: 0,
    image:
      "https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=1600&q=80",
    fallbackImage: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=1600&q=80",
    badgeColor: "bg-green-700",
    packaging: "5L Tin",
    freshness: "Sealed Pack",
    about: "Premium olive oil for salads, cooking and horeca supply.",
  },
  {
    id: "sunflower-oil",
    name: "Sunflower Oil",
    subtitle: "Cooking Oil • 5L Bottle",
    category: "oils",
    origin: "Ukraine",
    type: "Regular",
    unit: "Bottle",
    marketAvg: 0,
    myPrice: 0,
    image:
      "https://images.unsplash.com/photo-1542444459-db63c5a0236b?auto=format&fit=crop&w=1600&q=80",
    fallbackImage: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=1600&q=80",
    badgeColor: "bg-yellow-600",
    packaging: "5L Bottle",
    freshness: "Sealed Pack",
    about: "Everyday cooking oil for restaurants and bulk kitchens.",
  },
  {
    id: "groundnut-oil",
    name: "Groundnut Oil",
    subtitle: "High Heat Cooking • 5L Bottle",
    category: "oils",
    origin: "India",
    type: "Regular",
    unit: "Bottle",
    marketAvg: 0,
    myPrice: 0,
    image:
      "https://images.unsplash.com/photo-1606756790138-261d2b21cd75?auto=format&fit=crop&w=1600&q=80",
    fallbackImage: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=1600&q=80",
    badgeColor: "bg-orange-700",
    packaging: "5L Bottle",
    freshness: "Sealed Pack",
    about: "Good for frying and high-heat cooking with a clean taste.",
  },
  {
    id: "sesame-oil",
    name: "Sesame Oil",
    subtitle: "Aromatic • 1L Bottle",
    category: "oils",
    origin: "India",
    type: "Regular",
    unit: "Bottle",
    marketAvg: 0,
    myPrice: 0,
    image:
      "https://images.unsplash.com/photo-1542444459-db63c5a0236b?auto=format&fit=crop&w=1600&q=80",
    fallbackImage: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=1600&q=80",
    badgeColor: "bg-amber-700",
    packaging: "1L Bottle",
    freshness: "Sealed Pack",
    about: "Aromatic sesame oil—best for flavor-rich cooking and marinades.",
  },
];
