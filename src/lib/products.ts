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
  id: "white-eggs-uae",
  name: "White Eggs (UAE)",
  subtitle: "Daily Supply • 30 pcs Tray",
  category: "eggs",
  origin: "UAE",
  type: "Regular",
  unit: "Tray",
  marketAvg: 0,
  myPrice: 0,
  image: "https://images.unsplash.com/photo-1587486912758-4367d2017d6c?auto=format&fit=crop&w=1600&q=80",
  badgeColor: "bg-neutral-700",
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
    // ----------------------------
  // SPICES
  // ----------------------------
  {
    id: "cardamom",
    name: "Cardamom (Green)",
    subtitle: "Aromatic Pods • 1kg Pack",
    category: "spices",
    origin: "India",
    type: "Regular",
    unit: "KG",
    marketAvg: 0,
    myPrice: 0,
    image:
      "https://images.unsplash.com/photo-1625944525092-11b5cc7f7b5b?auto=format&fit=crop&w=1600&q=80",
    badgeColor: "bg-emerald-700",
    packaging: "1kg Pack",
    freshness: "Sealed Pack",
    about:
      "Premium green cardamom with strong aroma—ideal for tea, desserts, and biryani masala.",
  },
  {
    id: "black-pepper",
    name: "Black Pepper",
    subtitle: "Bold Flavor • 1kg Pack",
    category: "spices",
    origin: "Vietnam",
    type: "Regular",
    unit: "KG",
    marketAvg: 0,
    myPrice: 0,
    image:
      "https://images.unsplash.com/photo-1615486363973-672b5f9f1c8b?auto=format&fit=crop&w=1600&q=80",
    badgeColor: "bg-neutral-800",
    packaging: "1kg Pack",
    freshness: "Sealed Pack",
    about:
      "Whole peppercorns for restaurants and commercial kitchens—fresh, pungent and consistent quality.",
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
      "https://images.unsplash.com/photo-1615485925600-9724cc7a7b2b?auto=format&fit=crop&w=1600&q=80",
    badgeColor: "bg-yellow-600",
    packaging: "1kg Pack",
    freshness: "Sealed Pack",
    about:
      "Bright color and rich aroma—perfect for curries, marinades and daily bulk cooking.",
  },
  {
    id: "clove",
    name: "Clove",
    subtitle: "Whole Buds • 1kg Pack",
    category: "spices",
    origin: "Indonesia",
    type: "Regular",
    unit: "KG",
    marketAvg: 0,
    myPrice: 0,
    image:
      "https://images.unsplash.com/photo-1604335399105-b0c3c2f2c8f2?auto=format&fit=crop&w=1600&q=80",
    badgeColor: "bg-amber-700",
    packaging: "1kg Pack",
    freshness: "Sealed Pack",
    about:
      "Whole clove buds—great for biryani, tea, spice blends and premium catering use.",
  },
  {
    id: "cinnamon",
    name: "Cinnamon Sticks",
    subtitle: "Whole Sticks • 1kg Pack",
    category: "spices",
    origin: "Sri Lanka",
    type: "Regular",
    unit: "KG",
    marketAvg: 0,
    myPrice: 0,
    image:
      "https://images.unsplash.com/photo-1600459429297-68df86b1a7e2?auto=format&fit=crop&w=1600&q=80",
    badgeColor: "bg-orange-700",
    packaging: "1kg Pack",
    freshness: "Sealed Pack",
    about:
      "Premium cinnamon sticks—perfect for desserts, beverages and aromatic spice mixes.",
  },
  {
    id: "bay-leaf",
    name: "Bay Leaf",
    subtitle: "Whole Leaves • 500g Pack",
    category: "spices",
    origin: "Turkey",
    type: "Regular",
    unit: "Pack",
    marketAvg: 0,
    myPrice: 0,
    image:
      "https://images.unsplash.com/photo-1604908812571-2f7cfbbf89c6?auto=format&fit=crop&w=1600&q=80",
    badgeColor: "bg-green-700",
    packaging: "500g Pack",
    freshness: "Sealed Pack",
    about:
      "Aromatic bay leaves for soups, curries and rice dishes—clean and packed for bulk kitchens.",
  },
  {
    id: "star-anise",
    name: "Star Anise",
    subtitle: "Whole Flower • 1kg Pack",
    category: "spices",
    origin: "China",
    type: "Regular",
    unit: "KG",
    marketAvg: 0,
    myPrice: 0,
    image:
      "https://images.unsplash.com/photo-1615485925644-25e72f8e7c44?auto=format&fit=crop&w=1600&q=80",
    badgeColor: "bg-yellow-900",
    packaging: "1kg Pack",
    freshness: "Sealed Pack",
    about:
      "Strong aroma and premium look—ideal for biryani masala and spice blends.",
  },

  // ----------------------------
  // NUTS & DRY FRUITS
  // ----------------------------
  {
    id: "cashew",
    name: "Cashew Nuts",
    subtitle: "Premium Whole • 10kg Carton",
    category: "nuts",
    origin: "Vietnam",
    type: "Regular",
    unit: "Carton",
    marketAvg: 0,
    myPrice: 0,
    image:
      "https://images.unsplash.com/photo-1599599810694-bb3a3b1d4b6b?auto=format&fit=crop&w=1600&q=80",
    badgeColor: "bg-amber-600",
    packaging: "10kg Carton",
    freshness: "Sealed Carton",
    about:
      "Premium whole cashews for sweets, snacks, and bulk kitchen usage.",
  },
  {
    id: "almond",
    name: "Almond",
    subtitle: "California Grade • 10kg Carton",
    category: "nuts",
    origin: "USA",
    type: "Regular",
    unit: "Carton",
    marketAvg: 0,
    myPrice: 0,
    image:
      "https://images.unsplash.com/photo-1615485925878-c8d7a3a3f2bd?auto=format&fit=crop&w=1600&q=80",
    badgeColor: "bg-rose-700",
    packaging: "10kg Carton",
    freshness: "Sealed Carton",
    about:
      "Crunchy premium almonds for bakeries, cafes and retail packs.",
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
      "https://images.unsplash.com/photo-1599599810720-2f2b6d3d6e7a?auto=format&fit=crop&w=1600&q=80",
    badgeColor: "bg-stone-700",
    packaging: "10kg Carton",
    freshness: "Sealed Carton",
    about:
      "Premium shelled walnuts—perfect for desserts, salads and healthy mixes.",
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
      "https://images.unsplash.com/photo-1604908554131-2c8d12c8e9f6?auto=format&fit=crop&w=1600&q=80",
    badgeColor: "bg-amber-800",
    packaging: "5kg Box",
    freshness: "Packed Fresh",
    about:
      "Soft premium dates for gifting, retail, and hotel breakfast service.",
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
      "https://images.unsplash.com/photo-1604908553783-9b5c16d2a2fd?auto=format&fit=crop&w=1600&q=80",
    badgeColor: "bg-yellow-700",
    packaging: "5kg Pack",
    freshness: "Sealed Pack",
    about:
      "Sweet golden raisins for bakeries, desserts and bulk mixes.",
  },
  {
    id: "pista",
    name: "Pistachio",
    subtitle: "Roasted • 10kg Carton",
    category: "nuts",
    origin: "Iran",
    type: "Regular",
    unit: "Carton",
    marketAvg: 0,
    myPrice: 0,
    image:
      "https://images.unsplash.com/photo-1599599810833-7f447ddb5f9b?auto=format&fit=crop&w=1600&q=80",
    badgeColor: "bg-lime-700",
    packaging: "10kg Carton",
    freshness: "Sealed Carton",
    about:
      "Premium pistachios for sweets, ice cream and retail packs.",
  },

  // ----------------------------
  // COOKING OILS
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
      "https://images.unsplash.com/photo-1615485925712-2cbe4c1f0a2c?auto=format&fit=crop&w=1600&q=80",
    badgeColor: "bg-green-700",
    packaging: "5L Tin",
    freshness: "Sealed Pack",
    about:
      "Premium olive oil for salads, kitchens and horeca supply.",
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
      "https://images.unsplash.com/photo-1625944525117-8c5a2dbf7b52?auto=format&fit=crop&w=1600&q=80",
    badgeColor: "bg-yellow-600",
    packaging: "5L Bottle",
    freshness: "Sealed Pack",
    about:
      "Everyday cooking oil for restaurants and bulk kitchens.",
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
      "https://images.unsplash.com/photo-1604908553697-61a2a6d52c42?auto=format&fit=crop&w=1600&q=80",
    badgeColor: "bg-orange-700",
    packaging: "5L Bottle",
    freshness: "Sealed Pack",
    about:
      "Great for frying and high-heat cooking with clean taste.",
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
      "https://images.unsplash.com/photo-1604908553628-0e8c6f0c54fd?auto=format&fit=crop&w=1600&q=80",
    badgeColor: "bg-amber-700",
    packaging: "1L Bottle",
    freshness: "Sealed Pack",
    about:
      "Aromatic sesame oil for flavor-rich cooking and marinades.",
  },

];
