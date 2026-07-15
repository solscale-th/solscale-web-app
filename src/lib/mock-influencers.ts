import type { Platform } from "./mock-jobs";

export const INFLUENCER_CATEGORY_KEYS = [
  "beauty",
  "fashion",
  "food",
  "tech",
  "fitness",
  "travel",
  "finance",
  "gaming",
  "parenting",
  "home",
] as const;

export type InfluencerCategoryKey = (typeof INFLUENCER_CATEGORY_KEYS)[number];

export type Influencer = {
  id: string;
  name: string;
  handle: string;
  platform: Platform;
  categories: InfluencerCategoryKey[];
  location: string;
  followers: number;
  rating: number;
  reviews: number;
  bio: string;
  about: string;
  contentTypes: string[];
  highlights: string[];
  audienceNotes: string[];
  engagementRate: number;
  avgViews: number;
  responseTime: string;
  collaborations: number;
  avatarBg: string;
  verified?: boolean;
  featured?: boolean;
};

export const MOCK_INFLUENCERS: Influencer[] = [
  {
    id: "inf1",
    name: "Nina Somchai",
    handle: "@nina.glows",
    platform: "Instagram",
    categories: ["beauty", "fashion"],
    location: "Bangkok, TH",
    followers: 128000,
    rating: 4.9,
    reviews: 84,
    bio: "Skincare routines, GRWM, and honest product reviews for everyday glow.",
    about:
      "Nina creates approachable beauty content for Thai women who want realistic skincare routines without the hype. Her audience trusts her for honest before/after reviews and daily GRWM videos.",
    contentTypes: ["Instagram Reels", "Feed posts", "Stories", "GRWM videos"],
    highlights: [
      "Glow Lab Thailand launch — 2.1M total reach",
      "Sephora TH skincare week — top-performing creator",
      "Local sunscreen brand campaign — 4.8% engagement",
    ],
    audienceNotes: [
      "Primary audience: women 20–32 in Bangkok and major cities",
      "Strong interest in skincare, K-beauty, and affordable luxury",
      "Average story completion rate above 70%",
    ],
    engagementRate: 4.2,
    avgViews: 45000,
    responseTime: "Within 12 hours",
    collaborations: 38,
    avatarBg: "bg-[#fce8ee]",
    verified: true,
    featured: true,
  },
  {
    id: "inf2",
    name: "Tom Foodie",
    handle: "@tom.eats.th",
    platform: "TikTok",
    categories: ["food", "travel"],
    location: "Chiang Mai, TH",
    followers: 89000,
    rating: 4.6,
    reviews: 52,
    bio: "Street food hunts and hidden cafe finds across Thailand.",
    about:
      "Tom documents hidden food spots and local cafe culture across Thailand. His short-form reviews are fast-paced, authentic, and optimized for discovery on TikTok.",
    contentTypes: ["TikTok reviews", "Street food vlogs", "Cafe tours"],
    highlights: [
      "Tourism Authority food series — 1.5M views",
      "Delivery app restaurant promo — 320K views",
      "Chiang Mai cafe crawl — viral local feature",
    ],
    audienceNotes: [
      "Food lovers and travelers aged 22–40",
      "High share rate on cafe and dessert content",
      "Strong regional following in Northern Thailand",
    ],
    engagementRate: 5.1,
    avgViews: 62000,
    responseTime: "Within 24 hours",
    collaborations: 24,
    avatarBg: "bg-[#ffe8cc]",
  },
  {
    id: "inf3",
    name: "Arkin Tech",
    handle: "@arkin.unbox",
    platform: "YouTube",
    categories: ["tech", "gaming"],
    location: "Bangkok, TH",
    followers: 245000,
    rating: 4.8,
    reviews: 131,
    bio: "Gadget reviews, comparisons, and setup guides in Thai and English.",
    about:
      "Arkin produces in-depth gadget reviews and comparison videos for Thai tech enthusiasts. His bilingual content reaches both local and regional audiences interested in smartphones, laptops, and gaming gear.",
    contentTypes: ["YouTube reviews", "Unboxing", "Comparison videos", "Setup guides"],
    highlights: [
      "Samsung Galaxy launch coverage — 890K views",
      "Gaming laptop buyer's guide — top search ranking",
      "Wireless earbuds roundup — 12 min avg watch time",
    ],
    audienceNotes: [
      "Tech-savvy audience aged 18–35",
      "High purchase intent on gadget recommendations",
      "Strong male skew with growing female segment",
    ],
    engagementRate: 3.8,
    avgViews: 78000,
    responseTime: "Within 8 hours",
    collaborations: 56,
    avatarBg: "bg-[#cce4ff]",
    verified: true,
  },
  {
    id: "inf4",
    name: "Maya Fit",
    handle: "@maya.moves",
    platform: "Instagram",
    categories: ["fitness", "fashion"],
    location: "Phuket, TH",
    followers: 67000,
    rating: 4.7,
    reviews: 39,
    bio: "Home workouts, activewear styling, and wellness tips.",
    about:
      "Maya blends fitness coaching with activewear styling for women who prefer home workouts and sustainable wellness habits. Her content is motivational without being intimidating.",
    contentTypes: ["Workout Reels", "Activewear lookbooks", "Wellness tips"],
    highlights: [
      "Sportswear brand collab — 180K reach",
      "Home workout challenge — 2-week series",
      "Protein supplement review — high save rate",
    ],
    audienceNotes: [
      "Women 25–38 interested in fitness and lifestyle",
      "Strong engagement on workout tutorials",
      "Audience values practical, equipment-free routines",
    ],
    engagementRate: 4.5,
    avgViews: 28000,
    responseTime: "Within 18 hours",
    collaborations: 19,
    avatarBg: "bg-[#d0f0e8]",
  },
  {
    id: "inf5",
    name: "James Wallet",
    handle: "@james.wallet",
    platform: "YouTube",
    categories: ["finance", "tech"],
    location: "Remote",
    followers: 156000,
    rating: 4.5,
    reviews: 67,
    bio: "Personal finance basics and investing explainers for young professionals.",
    about:
      "James breaks down personal finance, investing, and fintech products for young Thai professionals. His explainers focus on clarity, trust, and actionable takeaways.",
    contentTypes: ["Finance explainers", "App reviews", "Investing basics"],
    highlights: [
      "Digital bank app review — 420K views",
      "ETF investing series — 6-part playlist",
      "Tax season tips — high comment engagement",
    ],
    audienceNotes: [
      "Young professionals aged 24–35",
      "Audience interested in saving, investing, and side income",
      "High trust scores on financial product reviews",
    ],
    engagementRate: 3.2,
    avgViews: 55000,
    responseTime: "Within 24 hours",
    collaborations: 31,
    avatarBg: "bg-[#e8e0ff]",
  },
  {
    id: "inf6",
    name: "Ploy Travels",
    handle: "@ploy.wanders",
    platform: "Instagram",
    categories: ["travel", "food"],
    location: "Nationwide",
    followers: 203000,
    rating: 4.8,
    reviews: 98,
    bio: "Luxury stays, local eats, and itinerary ideas across ASEAN.",
    about:
      "Ploy curates travel itineraries that mix boutique stays with local food experiences across ASEAN. Her aesthetic content inspires both weekend getaways and longer trips.",
    contentTypes: ["Travel Reels", "Hotel reviews", "Itinerary guides", "Food diaries"],
    highlights: [
      "Boutique hotel chain campaign — 3.2M impressions",
      "Airline travel series — branded partnership",
      "Krabi itinerary guide — saved 45K times",
    ],
    audienceNotes: [
      "Travel enthusiasts aged 25–42",
      "High interest in boutique hotels and food tourism",
      "Audience spans Thailand and regional ASEAN markets",
    ],
    engagementRate: 4.0,
    avgViews: 52000,
    responseTime: "Within 10 hours",
    collaborations: 44,
    avatarBg: "bg-[#d4e8d0]",
    verified: true,
    featured: true,
  },
  {
    id: "inf7",
    name: "Beam Gamer",
    handle: "@beam.plays",
    platform: "TikTok",
    categories: ["gaming", "tech"],
    location: "Bangkok, TH",
    followers: 312000,
    rating: 4.4,
    reviews: 76,
    bio: "Mobile gaming clips, live highlights, and gear recommendations.",
    about:
      "Beam creates high-energy mobile gaming content with clip highlights, gear reviews, and live stream recaps. He is one of Thailand's most watched gaming creators on TikTok.",
    contentTypes: ["Gaming clips", "Live highlights", "Gear reviews", "Game tutorials"],
    highlights: [
      "Mobile game launch — 4.8M views in first week",
      "Gaming headset review — viral clip",
      "Esports event coverage — live recap series",
    ],
    audienceNotes: [
      "Gamers aged 16–28, predominantly male",
      "Peak engagement on mobile game launches",
      "Strong crossover audience for gaming peripherals",
    ],
    engagementRate: 6.2,
    avgViews: 95000,
    responseTime: "Within 6 hours",
    collaborations: 62,
    avatarBg: "bg-[#f0e6ff]",
  },
  {
    id: "inf8",
    name: "Mint Mom",
    handle: "@mint.momlife",
    platform: "Instagram",
    categories: ["parenting", "home"],
    location: "Nonthaburi, TH",
    followers: 54000,
    rating: 4.6,
    reviews: 41,
    bio: "Family routines, nursery ideas, and practical product picks for parents.",
    about:
      "Mint shares practical parenting tips, nursery organization, and honest product reviews for Thai parents. Her content feels relatable and community-driven.",
    contentTypes: ["Parenting tips", "Product reviews", "Home organization", "Daily routines"],
    highlights: [
      "Baby care brand campaign — high conversion",
      "Nursery makeover series — 120K reach",
      "School prep checklist — top saved post",
    ],
    audienceNotes: [
      "Parents aged 28–40, mostly mothers",
      "Strong trust on baby and home product recommendations",
      "Community-driven comments and DMs",
    ],
    engagementRate: 5.4,
    avgViews: 22000,
    responseTime: "Within 20 hours",
    collaborations: 17,
    avatarBg: "bg-[#fff3cc]",
  },
  {
    id: "inf9",
    name: "Kai Streetwear",
    handle: "@kai.fits",
    platform: "Instagram",
    categories: ["fashion", "home"],
    location: "Bangkok, TH",
    followers: 98000,
    rating: 4.7,
    reviews: 58,
    bio: "Streetwear styling, thrift finds, and outfit inspiration for men.",
    about:
      "Kai curates streetwear looks and thrift-style outfits for young Thai men. His content mixes affordable fashion with premium drops, helping followers build versatile wardrobes.",
    contentTypes: ["Outfit Reels", "Lookbooks", "Thrift hauls", "Styling tips"],
    highlights: [
      "Sneaker brand launch — 260K reach",
      "Streetwear capsule collab — sold out in 48h",
      "Thrift flip series — top saved posts",
    ],
    audienceNotes: [
      "Men 18–30 interested in streetwear and sneakers",
      "High save rate on outfit inspiration",
      "Growing following in Bangkok and regional cities",
    ],
    engagementRate: 4.3,
    avgViews: 41000,
    responseTime: "Within 14 hours",
    collaborations: 27,
    avatarBg: "bg-[#e0ecff]",
  },
  {
    id: "inf10",
    name: "Fern Wellness",
    handle: "@fern.calm",
    platform: "YouTube",
    categories: ["fitness", "parenting"],
    location: "Chiang Mai, TH",
    followers: 74000,
    rating: 4.8,
    reviews: 46,
    bio: "Mindfulness, prenatal wellness, and gentle home workouts.",
    about:
      "Fern focuses on holistic wellness for expecting and new mothers, blending mindfulness, prenatal fitness, and self-care routines into calming long-form videos.",
    contentTypes: ["Wellness videos", "Guided workouts", "Meditation", "Self-care routines"],
    highlights: [
      "Prenatal supplement campaign — high trust score",
      "10-minute calm series — 480K views",
      "Wellness retreat partnership — branded feature",
    ],
    audienceNotes: [
      "Women 27–40, many expecting or new mothers",
      "Strong engagement on self-care and mindfulness",
      "Loyal, community-oriented subscriber base",
    ],
    engagementRate: 4.6,
    avgViews: 33000,
    responseTime: "Within 22 hours",
    collaborations: 21,
    avatarBg: "bg-[#d8f0e0]",
  },
  {
    id: "inf11",
    name: "Dao Beauty",
    handle: "@dao.makeup",
    platform: "TikTok",
    categories: ["beauty", "fashion"],
    location: "Bangkok, TH",
    followers: 187000,
    rating: 4.7,
    reviews: 92,
    bio: "Makeup tutorials, viral products, and quick beauty hacks.",
    about:
      "Dao creates fast, trend-driven makeup tutorials and product tests for a young beauty audience. Her viral hacks and honest swatches drive strong discovery on TikTok.",
    contentTypes: ["Makeup tutorials", "Product tests", "Beauty hacks", "Get ready videos"],
    highlights: [
      "Cosmetics brand launch — 3.4M views",
      "Foundation match series — viral feature",
      "Drugstore vs luxury test — top engagement",
    ],
    audienceNotes: [
      "Women 18–29 interested in makeup and trends",
      "High conversion on affordable beauty picks",
      "Fast-growing regional ASEAN audience",
    ],
    engagementRate: 5.8,
    avgViews: 71000,
    responseTime: "Within 9 hours",
    collaborations: 49,
    avatarBg: "bg-[#ffe0ec]",
    verified: true,
  },
  {
    id: "inf12",
    name: "Pete Rides",
    handle: "@pete.rides",
    platform: "YouTube",
    categories: ["tech", "travel"],
    location: "Pattaya, TH",
    followers: 142000,
    rating: 4.5,
    reviews: 63,
    bio: "Car reviews, EV comparisons, and road trip adventures.",
    about:
      "Pete reviews cars and EVs while documenting road trips across Thailand. His long-form content balances technical detail with lifestyle storytelling for auto enthusiasts.",
    contentTypes: ["Car reviews", "EV comparisons", "Road trip vlogs", "Buyer guides"],
    highlights: [
      "EV brand launch coverage — 720K views",
      "Road trip series — 5-part branded playlist",
      "Car accessory review — high purchase intent",
    ],
    audienceNotes: [
      "Auto enthusiasts aged 25–45, male skew",
      "High interest in EVs and new car launches",
      "Strong purchase intent on auto accessories",
    ],
    engagementRate: 3.6,
    avgViews: 58000,
    responseTime: "Within 16 hours",
    collaborations: 34,
    avatarBg: "bg-[#d0e8f0]",
  },
  {
    id: "inf13",
    name: "Lyn Cooks",
    handle: "@lyn.kitchen",
    platform: "Instagram",
    categories: ["food", "home"],
    location: "Nonthaburi, TH",
    followers: 111000,
    rating: 4.8,
    reviews: 71,
    bio: "Easy Thai recipes, meal prep, and kitchen essentials.",
    about:
      "Lyn shares approachable Thai and fusion recipes with a focus on meal prep and kitchen organization. Her step-by-step content is a favorite for busy home cooks.",
    contentTypes: ["Recipe Reels", "Meal prep guides", "Kitchen tours", "Product reviews"],
    highlights: [
      "Cookware brand campaign — 240K reach",
      "Weeknight dinners series — saved 60K times",
      "Pantry organization guide — top performer",
    ],
    audienceNotes: [
      "Home cooks aged 26–45, mostly women",
      "High save rate on recipe and meal prep content",
      "Strong trust on kitchen product recommendations",
    ],
    engagementRate: 4.9,
    avgViews: 38000,
    responseTime: "Within 15 hours",
    collaborations: 29,
    avatarBg: "bg-[#fff0d8]",
  },
  {
    id: "inf14",
    name: "Rio Beats",
    handle: "@rio.beats",
    platform: "TikTok",
    categories: ["gaming", "tech"],
    location: "Bangkok, TH",
    followers: 268000,
    rating: 4.5,
    reviews: 84,
    bio: "Music production clips, gear reviews, and beat-making tutorials.",
    about:
      "Rio makes energetic music production content, from beat-making tutorials to studio gear reviews. His short-form clips reach both aspiring producers and casual music fans.",
    contentTypes: ["Production clips", "Gear reviews", "Tutorials", "Studio tours"],
    highlights: [
      "Audio brand launch — 2.6M views",
      "Beat-making challenge — viral series",
      "Studio headphone review — high engagement",
    ],
    audienceNotes: [
      "Creators and music fans aged 17–30",
      "High engagement on gear and tutorial content",
      "Crossover audience with gaming peripherals",
    ],
    engagementRate: 5.5,
    avgViews: 82000,
    responseTime: "Within 7 hours",
    collaborations: 41,
    avatarBg: "bg-[#e8e0f8]",
  },
  {
    id: "inf15",
    name: "Born Invests",
    handle: "@born.invests",
    platform: "YouTube",
    categories: ["finance", "tech"],
    location: "Remote",
    followers: 134000,
    rating: 4.6,
    reviews: 55,
    bio: "Crypto explainers, portfolio strategies, and fintech reviews.",
    about:
      "Born demystifies crypto, investing, and fintech tools for a Thai audience seeking clear, balanced guidance. His explainers emphasize risk awareness and long-term thinking.",
    contentTypes: ["Crypto explainers", "Portfolio reviews", "Fintech app reviews", "Market updates"],
    highlights: [
      "Crypto exchange campaign — 390K views",
      "Portfolio strategy series — 8-part playlist",
      "Fintech app review — high trust score",
    ],
    audienceNotes: [
      "Young investors aged 24–38",
      "High interest in crypto and passive income",
      "Strong trust on fintech product reviews",
    ],
    engagementRate: 3.4,
    avgViews: 49000,
    responseTime: "Within 24 hours",
    collaborations: 26,
    avatarBg: "bg-[#e4e0ff]",
  },
  {
    id: "inf16",
    name: "Som Adventures",
    handle: "@som.outdoors",
    platform: "Instagram",
    categories: ["travel", "fitness"],
    location: "Nationwide",
    followers: 96000,
    rating: 4.7,
    reviews: 48,
    bio: "Hiking trails, camping gear, and outdoor adventure guides.",
    about:
      "Som documents hiking, camping, and outdoor adventures across Thailand's national parks. Her content inspires active travelers with practical gear tips and trail guides.",
    contentTypes: ["Adventure Reels", "Gear reviews", "Trail guides", "Camping vlogs"],
    highlights: [
      "Outdoor gear brand collab — 210K reach",
      "National park series — branded partnership",
      "Camping essentials guide — saved 38K times",
    ],
    audienceNotes: [
      "Active travelers aged 22–40",
      "High interest in hiking and outdoor gear",
      "Engaged, adventure-seeking community",
    ],
    engagementRate: 4.4,
    avgViews: 36000,
    responseTime: "Within 18 hours",
    collaborations: 23,
    avatarBg: "bg-[#dcf0d4]",
  },
  {
    id: "inf17",
    name: "Ice Reviews",
    handle: "@ice.reviews",
    platform: "YouTube",
    categories: ["tech", "gaming"],
    location: "Bangkok, TH",
    followers: 221000,
    rating: 4.7,
    reviews: 108,
    bio: "Smart home tech, PC builds, and productivity gadget reviews.",
    about:
      "Ice reviews smart home devices, custom PC builds, and productivity gadgets with a focus on real-world testing. His detailed content helps viewers make confident tech purchases.",
    contentTypes: ["Tech reviews", "PC builds", "Smart home setups", "Productivity guides"],
    highlights: [
      "Smart home brand launch — 640K views",
      "Budget PC build series — top ranking",
      "Productivity gadget roundup — high watch time",
    ],
    audienceNotes: [
      "Tech enthusiasts aged 20–38",
      "High purchase intent on gadgets and PC parts",
      "Strong crossover with gaming hardware buyers",
    ],
    engagementRate: 3.9,
    avgViews: 68000,
    responseTime: "Within 10 hours",
    collaborations: 51,
    avatarBg: "bg-[#d4e8ff]",
    verified: true,
  },
  {
    id: "inf18",
    name: "Bua Home",
    handle: "@bua.athome",
    platform: "Instagram",
    categories: ["home", "parenting"],
    location: "Bangkok, TH",
    followers: 63000,
    rating: 4.6,
    reviews: 37,
    bio: "Interior styling, DIY decor, and cozy home organization ideas.",
    about:
      "Bua shares interior styling, DIY decor projects, and organization tips for small Thai homes and families. Her cozy aesthetic and practical ideas resonate with young households.",
    contentTypes: ["Home tours", "DIY decor", "Organization tips", "Product reviews"],
    highlights: [
      "Furniture brand campaign — 150K reach",
      "Small space makeover series — top saved",
      "DIY decor challenge — high engagement",
    ],
    audienceNotes: [
      "Homeowners and renters aged 26–42",
      "High save rate on decor and organization ideas",
      "Strong trust on home product recommendations",
    ],
    engagementRate: 5.0,
    avgViews: 25000,
    responseTime: "Within 20 hours",
    collaborations: 18,
    avatarBg: "bg-[#fef0e0]",
  },
];

export function formatFollowers(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${Math.round(count / 1_000)}K`;
  return String(count);
}

export function formatAvgViews(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${Math.round(count / 1_000)}K`;
  return String(count);
}

export function getInfluencerById(id: string): Influencer | undefined {
  return MOCK_INFLUENCERS.find((inf) => inf.id === id);
}

export function getRelatedInfluencers(
  influencer: Influencer,
  limit = 3
): Influencer[] {
  return MOCK_INFLUENCERS.filter(
    (inf) =>
      inf.id !== influencer.id &&
      (inf.platform === influencer.platform ||
        inf.categories.some((cat) => influencer.categories.includes(cat)))
  ).slice(0, limit);
}

export function filterInfluencersByCategories(
  influencers: Influencer[],
  selected: InfluencerCategoryKey[]
): Influencer[] {
  if (selected.length === 0) return influencers;
  return influencers.filter((inf) =>
    inf.categories.some((cat) => selected.includes(cat))
  );
}
