export type ProductCategory = "vegetables" | "fruits" | "eggs";

export type Product = {
  id: string;
  name: string;
  subtitle: string;
  category: ProductCategory;
  origin: string;
  type: "Organic" | "Regular";
  unit: string;
  marketAvg: number; // Al Aweer Rate
  myPrice: number;   // MyVegMarket Price
  image: string;
  badgeColor: string;
  about?: string;
  packaging?: string;
  freshness?: string;
};

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
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Tomatoes.jpg",
    badgeColor: "bg-red-600",
    packaging: "Per KG",
    freshness: "Arrived This Morning",
    about:
      "Fresh local tomatoes with consistent sizing and firmness—ideal for restaurants, cafeterias, and daily bulk cooking.",
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
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Cucumber.jpg",
    badgeColor: "bg-green-700",
    packaging: "5kg Carton",
    freshness: "Harvested 24h ago",
    about:
      "Crisp cucumbers suitable for salads, juice bars, and hotel kitchens. Stable supply and clean grading.",
  },
  {
    id: "bell-pepper-nl",
    name: "Bell Peppers Mix (Netherlands)",
    subtitle: "Red/Yellow/Green • 5kg Carton",
    category: "vegetables",
    origin: "Netherlands",
    type: "Regular",
    unit: "Carton",
    marketAvg: 85,
    myPrice: 72,
    image:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Bell_peppers.jpg",
    badgeColor: "bg-emerald-700",
    packaging: "5kg Carton",
    freshness: "Chilled Import Stock",
    about:
      "Premium mixed bell peppers—great for premium restaurants, salad bars, and grill menus. Bright color & crunch.",
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
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Onion.jpg",
    badgeColor: "bg-red-800",
    packaging: "10kg Bag",
    freshness: "Daily Supply",
    about:
      "Stable daily onion supply with consistent sizing, ideal for large kitchens and bulk meal production.",
  },
  {
    id: "potato-egypt",
    name: "Potato (Egypt)",
    subtitle: "Washed & Graded • 10kg Bag",
    category: "vegetables",
    origin: "Egypt",
    type: "Regular",
    unit: "Bag",
    marketAvg: 28,
    myPrice: 23,
    image:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Potato.jpg",
    badgeColor: "bg-amber-700",
    packaging: "10kg Bag",
    freshness: "New Batch This Week",
    about:
      "Clean graded potatoes—perfect for fries, mash, and bulk prep. Reliable quality for hotels and catering.",
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
      "https://commons.wikimedia.org/wiki/Special:FilePath/Carrot.jpg",
    badgeColor: "bg-orange-600",
    packaging: "10kg Bag",
    freshness: "Chilled Storage",
    about:
      "Premium carrots with consistent texture—great for salads, juices, and soup bases in commercial kitchens.",
  },
  {
    id: "broccoli-china",
    name: "Broccoli (Import)",
    subtitle: "Fresh Heads • 5kg Carton",
    category: "vegetables",
    origin: "China",
    type: "Regular",
    unit: "Carton",
    marketAvg: 55,
    myPrice: 49,
    image:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Broccoli.jpg",
    badgeColor: "bg-green-800",
    packaging: "5kg Carton",
    freshness: "Arrived This Week",
    about:
      "Fresh broccoli heads suitable for steaming, stir fry, and meal-prep menus. Uniform size and stable supply.",
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
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Apple.jpg",
    badgeColor: "bg-red-600",
    packaging: "18kg Carton",
    freshness: "Import Batch Today",
    about:
      "Premium apples with strong crunch and long shelf life—ideal for hotels, offices, and retail supply.",
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
  image: "https://commons.wikimedia.org/wiki/Special:FilePath/Banana_and_cross_section.jpg",
  badgeColor: "bg-yellow-500",
  packaging: "13kg Carton",
  freshness: "Ripening Controlled",
  about:
    "Consistent size and quality bananas—excellent for breakfast buffets, smoothie bars, and grocery supply.",
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
      "https://commons.wikimedia.org/wiki/Special:FilePath/Grapes.jpg",
    badgeColor: "bg-emerald-600",
    packaging: "4.5kg Box",
    freshness: "Cold Chain Delivered",
    about:
      "Sweet seedless grapes for desserts and fruit platters. Stored and delivered via cold chain.",
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
      "https://commons.wikimedia.org/wiki/Special:FilePath/Orange-Fruit-Pieces.jpg",
    badgeColor: "bg-orange-600",
    packaging: "15kg Carton",
    freshness: "Import Batch Today",
    about:
      "Juicy Valencia oranges with consistent sweetness—perfect for juice stations and hotel breakfast service.",
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
      "https://commons.wikimedia.org/wiki/Special:FilePath/Pineapple_and_cross_section.jpg",
    badgeColor: "bg-amber-600",
    packaging: "12pcs Carton",
    freshness: "Chilled Import Stock",
    about:
      "Sweet pineapples with good yield for juice and dessert counters. Great for hotels and catering.",
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
      "https://commons.wikimedia.org/wiki/Special:FilePath/Brown_eggs.jpg",
    badgeColor: "bg-neutral-700",
    packaging: "30 pcs Tray",
    freshness: "Collected Today",
    about:
      "Locally sourced brown eggs with stable daily availability—perfect for bakeries, cafes, and breakfast operations.",
  },
  {
    id: "eggs-white-uae",
    name: "White Eggs (UAE)",
    subtitle: "Daily Supply • 30 pcs Tray",
    category: "eggs",
    origin: "UAE",
    type: "Regular",
    unit: "Tray",
    marketAvg: 17,
    myPrice: 14.75,
    image:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Eggs_in_a_basket.jpg",
    badgeColor: "bg-slate-700",
    packaging: "30 pcs Tray",
    freshness: "Daily Collection",
    about:
      "Cost-effective white eggs for bulk kitchens and catering. Consistent weight and reliable supply.",
  },
  {
    id: "quail-eggs",
    name: "Quail Eggs",
    subtitle: "Premium Pack • 24 pcs",
    category: "eggs",
    origin: "UAE",
    type: "Regular",
    unit: "Pack",
    marketAvg: 28,
    myPrice: 24,
    image:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Quail_eggs.jpg",
    badgeColor: "bg-zinc-800",
    packaging: "24 pcs Pack",
    freshness: "Chilled Stock",
    about:
      "Popular for gourmet plating and premium catering. Clean packed and delivered in chilled conditions.",
  },
];
