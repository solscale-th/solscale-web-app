export type Platform = "Instagram" | "TikTok" | "YouTube" | "Facebook" | "Podcast" | "Blog" | "Live Event";

export type Job = {
  id: string;
  title: string;
  company: string;
  companyRating: number;
  companyReviews: number;
  platform: Platform;
  description: string;
  brief: string;
  deliverables: string[];
  requirements: string[];
  aboutBrand: string;
  website: string;
  verified: boolean;
  tags: string[];
  location: string;
  duration: string;
  applied: number;
  budgetMin: number;
  budgetMax: number;
  postedDaysAgo: number;
  promoted?: boolean;
  thumbnailBg: string;
};

export const PLATFORM_COLORS: Record<Platform, { bg: string; text: string }> = {
  Instagram: { bg: "#E1306C", text: "#fff" },
  TikTok: { bg: "#010101", text: "#fff" },
  YouTube: { bg: "#FF0000", text: "#fff" },
  Facebook: { bg: "#1877F2", text: "#fff" },
  Podcast: { bg: "#8B5CF6", text: "#fff" },
  Blog: { bg: "#6B7280", text: "#fff" },
  "Live Event": { bg: "#059669", text: "#fff" },
};

export const CATEGORIES: { label: Platform; count: number; icon: string }[] = [
  { label: "Instagram", count: 143, icon: "📷" },
  { label: "TikTok", count: 96, icon: "🎵" },
  { label: "YouTube", count: 47, icon: "▶" },
  { label: "Blog", count: 44, icon: "📝" },
  { label: "Podcast", count: 9, icon: "🎙" },
  { label: "Live Event", count: 9, icon: "🎤" },
];

export const MOCK_JOBS: Job[] = [
  {
    id: "j1",
    title: "Instagram Lifestyle Influencer for Premium Skincare Launch",
    company: "Glow Lab Thailand",
    companyRating: 4.8,
    companyReviews: 132,
    platform: "Instagram",
    description: "Looking for a beauty influencer with 50K+ followers to promote our new skincare launch line.",
    brief:
      "Seeking a lifestyle influencer with 50K+ followers to create authentic content showcasing our new premium skincare line. The campaign focuses on daily routines, before/after results, and honest product reviews. Content must feel natural and relatable — not overly promotional.",
    deliverables: [
      "3 × Instagram feed posts (high-res, on-brand aesthetic)",
      "5 × Instagram Stories (product in daily routine, before/after)",
      "1 × Instagram Reel (30–60 sec, showing application & results)",
      "Caption copy submitted for approval at least 48 hours before posting",
      "Product must be visible and clearly tagged @glowlabthailand",
    ],
    requirements: [
      "50,000+ Instagram followers",
      "Engagement rate above 3%",
      "Audience primarily female, 20–35 age range",
      "Niche: beauty, skincare, wellness, or lifestyle",
      "Must be based in Thailand or have a Thai-speaking audience",
      "No competing skincare brand partnerships in the past 3 months",
    ],
    aboutBrand:
      "Glow Lab Thailand is a homegrown premium skincare brand founded in 2019. We combine Thai botanical ingredients with modern dermatological science to create effective, clean beauty products loved by over 200,000 customers nationwide.",
    website: "glowlabthailand.com",
    verified: true,
    tags: ["Beauty", "Skincare", "Lifestyle", "50K+ Followers"],
    location: "Bangkok, TH",
    duration: "2 Weeks",
    applied: 47,
    budgetMin: 35000,
    budgetMax: 50000,
    postedDaysAgo: 0,
    promoted: true,
    thumbnailBg: "bg-[#d4e8d0]",
  },
  {
    id: "j2",
    title: "TikTok Food Creator for Restaurant Chain Campaign",
    company: "SomTam Empire",
    companyRating: 4.2,
    companyReviews: 88,
    platform: "TikTok",
    description: "We need a good TikTok creator to produce a series of videos that make people crave our food.",
    brief:
      "Create a series of short-form TikTok videos that highlight our signature dishes, behind-the-scenes kitchen moments, and customer reactions. The tone should be fun, energetic, and mouth-watering.",
    deliverables: [
      "4 × TikTok videos (15–60 seconds each)",
      "2 × TikTok Stories or photo carousels",
      "Use campaign hashtag #SomTamEmpire in all posts",
      "Include location tag for at least 2 videos",
    ],
    requirements: [
      "20,000+ TikTok followers",
      "Strong food or lifestyle content history",
      "Based in Thailand",
      "Ability to film in-restaurant content",
    ],
    aboutBrand:
      "SomTam Empire is one of Thailand's fastest-growing casual dining chains, known for authentic Isaan flavors and modern restaurant experiences across Bangkok and Chiang Mai.",
    website: "somtamempire.co.th",
    verified: true,
    tags: ["Food", "Viral", "Entertainment"],
    location: "Nationwide",
    duration: "1 Month",
    applied: 58,
    budgetMin: 20000,
    budgetMax: 50000,
    postedDaysAgo: 3,
    promoted: true,
    thumbnailBg: "bg-[#ffe8cc]",
  },
  {
    id: "j3",
    title: "YouTube Tech Reviewer — Smartphone Accessories",
    company: "TechEdge Asia",
    companyRating: 4.7,
    companyReviews: 127,
    platform: "YouTube",
    description: "Looking for a tech YouTuber with genuine passion for gadgets to produce a detailed review.",
    brief:
      "Produce an in-depth YouTube review of our latest smartphone accessory lineup, covering unboxing, real-world usage, and an honest pros/cons summary for your audience.",
    deliverables: [
      "1 × YouTube review video (8–12 minutes)",
      "1 × YouTube Shorts teaser",
      "Include affiliate link in description",
      "Submit script outline for approval before filming",
    ],
    requirements: [
      "10,000+ YouTube subscribers",
      "Tech or gadget review niche",
      "English or Thai language content",
      "Previous unboxing/review examples required",
    ],
    aboutBrand:
      "TechEdge Asia distributes premium mobile accessories across Southeast Asia, partnering with global brands to bring innovative tech products to Thai consumers.",
    website: "techedge.asia",
    verified: true,
    tags: ["Tech", "Review", "Unboxing"],
    location: "Nationwide",
    duration: "1 Month",
    applied: 54,
    budgetMin: 15000,
    budgetMax: 25000,
    postedDaysAgo: 5,
    thumbnailBg: "bg-[#cce4ff]",
  },
  {
    id: "j4",
    title: "Fashion & Style Content Creator — Seasonal Collection",
    company: "Zara TH Studio",
    companyRating: 4.4,
    companyReviews: 56,
    platform: "Instagram",
    description: "We're launching our Summer 2026 collection and need a fashion creator to showcase key pieces.",
    brief:
      "We're launching our Summer 2026 collection and need a fashion-forward creator to showcase key pieces through styled lookbooks and lifestyle content on Instagram.",
    deliverables: [
      "2 × Instagram feed posts (styled outfit shots)",
      "3 × Instagram Stories (try-on, styling tips)",
      "1 × Instagram Reel (outfit transition or GRWM)",
      "Tag @zarathstudio and use #ZaraTHSummer26",
    ],
    requirements: [
      "30,000+ Instagram followers",
      "Fashion or lifestyle niche",
      "High-quality photography aesthetic",
      "Based in Chiang Mai or Bangkok",
    ],
    aboutBrand:
      "Zara TH Studio curates contemporary fashion collections for the modern Thai consumer, blending international trends with local style sensibilities.",
    website: "zarathstudio.com",
    verified: false,
    tags: ["Fashion", "Style", "Summer"],
    location: "Chiang Mai, TH",
    duration: "2 Weeks",
    applied: 112,
    budgetMin: 12000,
    budgetMax: 18000,
    postedDaysAgo: 3,
    thumbnailBg: "bg-[#f0e6ff]",
  },
  {
    id: "j5",
    title: "Podcast Guest & Sponsor Mention — Finance & Investment",
    company: "WealthWise TH",
    companyRating: 4.7,
    companyReviews: 41,
    platform: "Podcast",
    description: "Our finance podcast is looking for a credible guest speaker for one episode focused on young adults.",
    brief:
      "Join us as a guest on WealthWise TH podcast for a 45-minute episode discussing personal finance and investment strategies for young Thai adults aged 22–30.",
    deliverables: [
      "1 × 45-minute podcast guest appearance",
      "1 × 60-second sponsor read during the episode",
      "Share episode on your social channels",
    ],
    requirements: [
      "Demonstrated expertise in finance or investment",
      "Clear, engaging speaking style",
      "Existing audience in finance or career niche",
      "Available for remote recording",
    ],
    aboutBrand:
      "WealthWise TH is Thailand's leading personal finance podcast, helping young professionals build wealth through practical, actionable advice.",
    website: "wealthwise.th",
    verified: true,
    tags: ["Finance", "Investment", "YoungAdults"],
    location: "Remote",
    duration: "1–3 Days",
    applied: 23,
    budgetMin: 6000,
    budgetMax: 12000,
    postedDaysAgo: 1,
    thumbnailBg: "bg-[#fce8ee]",
  },
  {
    id: "j6",
    title: "Facebook Live Host for Electronics Flash Sale Event",
    company: "LaeOlin Partner Brand",
    companyRating: 4.3,
    companyReviews: 95,
    platform: "Facebook",
    description: "We need an energetic, camera-confident host for a 3-hour Facebook Live flash sale event.",
    brief:
      "Host a 3-hour Facebook Live flash sale event showcasing electronics deals. You must be energetic, bilingual (Thai/English), and experienced with live selling.",
    deliverables: [
      "1 × 3-hour Facebook Live session",
      "Pre-event teaser post on your page",
      "Post-event recap Stories",
    ],
    requirements: [
      "Experience hosting live selling sessions",
      "Fluent Thai and conversational English",
      "Available on the scheduled event date",
      "Confident on-camera presence",
    ],
    aboutBrand:
      "LaeOlin Partner Brand is a leading electronics distributor running flash sale events across Facebook and Lazada for top consumer tech brands.",
    website: "laeolin.co.th",
    verified: false,
    tags: ["Electronics", "Live Selling", "Thai-English"],
    location: "Bangkok, TH",
    duration: "1–3 Days",
    applied: 41,
    budgetMin: 8000,
    budgetMax: 9000,
    postedDaysAgo: 2,
    thumbnailBg: "bg-[#e3eeff]",
  },
  {
    id: "j7",
    title: "Blog Article — Travel & Wellness Resort in Phuket",
    company: "The Resort Phuket",
    companyRating: 3.0,
    companyReviews: 22,
    platform: "Blog",
    description: "We invite a travel or wellness blogger for a complimentary 2-night stay at our resort.",
    brief:
      "We invite a travel or wellness blogger for a complimentary 2-night stay at our resort in exchange for a detailed blog article and social media coverage.",
    deliverables: [
      "1 × SEO-optimised blog article (800+ words)",
      "5 × Instagram Stories during the stay",
      "2 × Instagram feed posts",
      "Include 3 do-follow backlinks to our website",
    ],
    requirements: [
      "Established travel or wellness blog",
      "Minimum 5,000 monthly blog visitors",
      "High-quality photography skills",
      "Available for a 2-night stay within campaign period",
    ],
    aboutBrand:
      "The Resort Phuket is a boutique wellness retreat on the Andaman coast, offering spa treatments, yoga classes, and farm-to-table dining in a serene tropical setting.",
    website: "theresortphuket.com",
    verified: false,
    tags: ["Travel", "Wellness", "SEO"],
    location: "Phuket, TH",
    duration: "1 Month",
    applied: 79,
    budgetMin: 6000,
    budgetMax: 10000,
    postedDaysAgo: 4,
    thumbnailBg: "bg-[#d0f0e8]",
  },
  {
    id: "j8",
    title: "TikTok Fitness Creator — Protein Supplement Brand",
    company: "LeanFuel Thailand",
    companyRating: 4.5,
    companyReviews: 198,
    platform: "TikTok",
    description: "We are looking for an active TikTok fitness creator to promote our new Whey Pro Series brand.",
    brief:
      "Promote our new Whey Pro Series through authentic gym and workout content. Show real usage, taste tests, and results over a 2-week period.",
    deliverables: [
      "3 × TikTok workout videos featuring the product",
      "2 × TikTok taste-test or review clips",
      "Use #LeanFuelTH and tag @leanfuelthailand",
    ],
    requirements: [
      "15,000+ TikTok followers",
      "Fitness, gym, or health niche",
      "Active posting schedule (3+ posts/week)",
      "Must disclose sponsored content per platform guidelines",
    ],
    aboutBrand:
      "LeanFuel Thailand produces premium protein supplements for fitness enthusiasts, with products available at major retailers and online across the country.",
    website: "leanfuelthailand.com",
    verified: true,
    tags: ["Fitness", "Health", "Gym"],
    location: "Nationwide",
    duration: "1 Month",
    applied: 53,
    budgetMin: 18000,
    budgetMax: 28000,
    postedDaysAgo: 3,
    thumbnailBg: "bg-[#fff3cc]",
  },
  {
    id: "j9",
    title: "Instagram Travel Creator — Boutique Hotel Campaign",
    company: "The Andaman Collection",
    companyRating: 4.6,
    companyReviews: 74,
    platform: "Instagram",
    description: "Seeking a travel influencer to document a complimentary 3-night stay and create aspirational content for our resort.",
    brief:
      "We are inviting a travel content creator for a 3-night stay at our Phuket resort. Content should capture the ambience, dining, spa, and surroundings through polished, aspirational Instagram posts and Reels.",
    deliverables: [
      "3 × Instagram feed posts (resort aesthetics, dining, pool)",
      "6 × Instagram Stories (arrival, room tour, spa, sunset)",
      "1 × Instagram Reel (60 sec highlight of the stay)",
      "Tag @andamancollection and use #StayAndaman",
    ],
    requirements: [
      "40,000+ Instagram followers",
      "Travel or lifestyle niche",
      "High-quality photography and videography",
      "Available for a 3-night stay during campaign window",
    ],
    aboutBrand:
      "The Andaman Collection is a group of boutique luxury resorts along Thailand's Andaman coast, celebrated for personalised service and stunning natural settings.",
    website: "andamancollection.com",
    verified: true,
    tags: ["Travel", "Luxury", "Lifestyle"],
    location: "Phuket, TH",
    duration: "1 Month",
    applied: 66,
    budgetMin: 25000,
    budgetMax: 40000,
    postedDaysAgo: 1,
    thumbnailBg: "bg-[#d4e8ff]",
  },
  {
    id: "j10",
    title: "YouTube Finance Educator — Investment App Review",
    company: "StockDee Thailand",
    companyRating: 4.5,
    companyReviews: 53,
    platform: "YouTube",
    description: "We need a trusted finance YouTuber to produce an educational review of our stock trading app.",
    brief:
      "Create an educational YouTube video reviewing the StockDee app, covering how to open an account, key features, fees, and beginner tips. The tone should be informative and trustworthy.",
    deliverables: [
      "1 × YouTube video (10–15 minutes)",
      "1 × YouTube Shorts version (60 sec)",
      "Include referral link in description",
      "Submit script outline 5 days before filming",
    ],
    requirements: [
      "20,000+ YouTube subscribers",
      "Finance, investing, or personal finance niche",
      "Thai-speaking audience",
      "No competing trading app sponsorships in past 2 months",
    ],
    aboutBrand:
      "StockDee Thailand is a commission-free stock and ETF trading app designed for the next generation of Thai investors, with over 500,000 active users.",
    website: "stockdee.th",
    verified: true,
    tags: ["Finance", "Investing", "App Review"],
    location: "Remote",
    duration: "2 Weeks",
    applied: 31,
    budgetMin: 20000,
    budgetMax: 35000,
    postedDaysAgo: 2,
    thumbnailBg: "bg-[#e8e0ff]",
  },
  {
    id: "j11",
    title: "TikTok Gaming Creator — Mobile Game Launch",
    company: "ArcLight Games TH",
    companyRating: 4.3,
    companyReviews: 61,
    platform: "TikTok",
    description: "Looking for high-energy TikTok gaming creators to amplify our new mobile RPG launch in Thailand.",
    brief:
      "Create hype content around the launch of our new mobile RPG game. Show gameplay, first impressions, and challenge your followers to join you in-game.",
    deliverables: [
      "3 × TikTok gameplay videos (30–60 sec)",
      "1 × TikTok challenge video using #ArcLightRPG",
      "Include download link in bio during campaign period",
    ],
    requirements: [
      "30,000+ TikTok followers",
      "Gaming niche required",
      "Must play and complete tutorial before filming",
      "Disclose sponsored content per TikTok guidelines",
    ],
    aboutBrand:
      "ArcLight Games TH develops and publishes mobile games for Southeast Asian audiences, with a portfolio of 12 titles across RPG, strategy, and casual genres.",
    website: "arclightgames.co.th",
    verified: true,
    tags: ["Gaming", "Mobile", "Launch"],
    location: "Nationwide",
    duration: "2 Weeks",
    applied: 84,
    budgetMin: 15000,
    budgetMax: 22000,
    postedDaysAgo: 0,
    promoted: true,
    thumbnailBg: "bg-[#f0e6ff]",
  },
  {
    id: "j12",
    title: "Instagram Home Decor Creator — Furniture Brand",
    company: "Casa Modern TH",
    companyRating: 4.4,
    companyReviews: 48,
    platform: "Instagram",
    description: "We are looking for a home or interior influencer to showcase our new Scandinavian furniture line.",
    brief:
      "Style and photograph our new Scandinavian furniture collection in your home or a styled space. We want warm, aspirational content that shows the pieces in a real living context.",
    deliverables: [
      "2 × Instagram feed posts (styled room setups)",
      "4 × Instagram Stories (unboxing, assembly, final look)",
      "1 × Instagram Reel (before/after room transformation)",
      "Tag @casamodernth and use #CasaModernHome",
    ],
    requirements: [
      "25,000+ Instagram followers",
      "Home, interior design, or lifestyle niche",
      "High-quality photography with good natural lighting",
      "Based in Bangkok or willing to arrange photo session",
    ],
    aboutBrand:
      "Casa Modern TH brings Scandinavian-inspired furniture to Thai homes, offering clean lines, quality materials, and affordable pricing through its online and showroom stores.",
    website: "casamodern.co.th",
    verified: false,
    tags: ["Home", "Interior", "Lifestyle"],
    location: "Bangkok, TH",
    duration: "3 Weeks",
    applied: 43,
    budgetMin: 10000,
    budgetMax: 16000,
    postedDaysAgo: 4,
    thumbnailBg: "bg-[#fef0e0]",
  },
  {
    id: "j13",
    title: "Facebook Live Wellness Host — Supplement Product Demo",
    company: "NaturePure TH",
    companyRating: 4.6,
    companyReviews: 82,
    platform: "Facebook",
    description: "Looking for an engaging Facebook Live host to demo and sell our herbal supplement range.",
    brief:
      "Host a 2-hour Facebook Live event showcasing our herbal supplement range. Explain benefits, answer viewer questions live, and drive purchase during the session.",
    deliverables: [
      "1 × 2-hour Facebook Live session",
      "Pre-event promotional post on your page",
      "Post-event product highlight Stories",
      "Share performance report after session",
    ],
    requirements: [
      "Experience with Facebook Live selling",
      "Wellness, health, or lifestyle audience",
      "Minimum 15,000 Facebook followers",
      "Based in Thailand with fluent Thai communication",
    ],
    aboutBrand:
      "NaturePure TH sources premium herbal and botanical ingredients to create certified wellness supplements trusted by over 100,000 customers across Thailand.",
    website: "naturepure.co.th",
    verified: true,
    tags: ["Wellness", "Health", "Live Selling"],
    location: "Nationwide",
    duration: "1–3 Days",
    applied: 29,
    budgetMin: 8000,
    budgetMax: 14000,
    postedDaysAgo: 1,
    thumbnailBg: "bg-[#d8f0e0]",
  },
  {
    id: "j14",
    title: "Blog Writer — EV Car Ownership Guide in Thailand",
    company: "GreenDrive TH",
    companyRating: 4.2,
    companyReviews: 31,
    platform: "Blog",
    description: "We need an automotive or sustainability blogger to write a practical EV ownership guide for Thai readers.",
    brief:
      "Write a comprehensive, SEO-optimised guide on owning an EV in Thailand — covering charging infrastructure, government subsidies, cost savings, and best models available in 2026.",
    deliverables: [
      "1 × Long-form blog post (1,200+ words)",
      "Include 4 do-follow backlinks to GreenDrive TH",
      "2 × Social media posts sharing the article",
      "Submit draft within 7 days of agreement",
    ],
    requirements: [
      "Established blog with 8,000+ monthly readers",
      "Automotive, tech, or sustainability niche",
      "Strong SEO writing skills",
      "Must conduct research using current 2026 data",
    ],
    aboutBrand:
      "GreenDrive TH is an EV advisory and community platform helping Thai consumers navigate the shift to electric vehicles with guides, reviews, and charging station maps.",
    website: "greendrive.co.th",
    verified: false,
    tags: ["EV", "Automotive", "Sustainability", "SEO"],
    location: "Remote",
    duration: "2 Weeks",
    applied: 18,
    budgetMin: 5000,
    budgetMax: 9000,
    postedDaysAgo: 5,
    thumbnailBg: "bg-[#d0e8d4]",
  },
  {
    id: "j15",
    title: "Podcast Guest — Startup & Entrepreneurship Episode",
    company: "Founders FM Thailand",
    companyRating: 4.8,
    companyReviews: 39,
    platform: "Podcast",
    description: "Inviting a Thai entrepreneur or startup founder to share their journey on our popular business podcast.",
    brief:
      "Join us for a 50-minute recorded interview discussing your entrepreneurial journey, lessons learned, and advice for young Thai founders. Brand sponsor mention included in episode.",
    deliverables: [
      "1 × 50-minute podcast episode appearance",
      "1 × Brand sponsor mention (60 seconds)",
      "Share episode on LinkedIn and Instagram",
    ],
    requirements: [
      "Proven entrepreneurial background",
      "Comfortable in long-form audio interview format",
      "Following or network in business or startup niche",
      "Available for remote recording via Riverside or Zoom",
    ],
    aboutBrand:
      "Founders FM Thailand is a weekly podcast interviewing Thai entrepreneurs and startup founders, with 80,000+ listeners per episode across Spotify and Apple Podcasts.",
    website: "foundersfm.th",
    verified: true,
    tags: ["Business", "Startup", "Entrepreneurship"],
    location: "Remote",
    duration: "1–3 Days",
    applied: 14,
    budgetMin: 5000,
    budgetMax: 10000,
    postedDaysAgo: 3,
    thumbnailBg: "bg-[#ffe8d8]",
  },
  {
    id: "j16",
    title: "TikTok Beauty Creator — New Lip Product Launch",
    company: "ColorBoom Cosmetics",
    companyRating: 4.5,
    companyReviews: 109,
    platform: "TikTok",
    description: "We are launching a new lip gloss and tint collection and need TikTok beauty creators to drive awareness.",
    brief:
      "Create authentic TikTok content featuring our new lip gloss and tint collection. Show swatches, wear tests, and styling tips in short-form format.",
    deliverables: [
      "3 × TikTok videos (swatch, wear test, GRWM)",
      "Use #ColorBoomLips in all posts",
      "Tag @colorboomth in captions",
      "Submit content calendar 3 days before posting",
    ],
    requirements: [
      "20,000+ TikTok followers",
      "Beauty or makeup niche",
      "Comfortable with close-up lip swatches on camera",
      "Disclose paid partnership per TikTok guidelines",
    ],
    aboutBrand:
      "ColorBoom Cosmetics is a Thai-born makeup brand known for bold, long-lasting lip products at accessible price points, available in 500+ stores nationwide.",
    website: "colorboom.co.th",
    verified: true,
    tags: ["Beauty", "Makeup", "Lips"],
    location: "Nationwide",
    duration: "2 Weeks",
    applied: 97,
    budgetMin: 12000,
    budgetMax: 20000,
    postedDaysAgo: 0,
    promoted: true,
    thumbnailBg: "bg-[#ffe0ec]",
  },
  {
    id: "j17",
    title: "YouTube Food Creator — Cooking Class Brand Partnership",
    company: "Krua Authentic Kitchen",
    companyRating: 4.3,
    companyReviews: 44,
    platform: "YouTube",
    description: "We want a food YouTuber to attend our premium Thai cooking class and document the experience.",
    brief:
      "Attend a full-day Thai cooking class at our Bangkok studio and produce a YouTube video documenting the experience — from market shopping to plating the final dish.",
    deliverables: [
      "1 × YouTube video (8–12 minutes, full cooking class experience)",
      "1 × YouTube Shorts (60 sec highlights)",
      "Include booking link in description",
      "Submit raw footage for review before editing",
    ],
    requirements: [
      "10,000+ YouTube subscribers",
      "Food or travel niche",
      "Ability to attend the class in Bangkok",
      "Genuine enthusiasm for Thai cuisine",
    ],
    aboutBrand:
      "Krua Authentic Kitchen offers premium Thai cooking classes for locals and tourists, featuring hands-on instruction by professional chefs in a traditional Thai home setting.",
    website: "kruaauthentic.com",
    verified: false,
    tags: ["Food", "Cooking", "Travel"],
    location: "Bangkok, TH",
    duration: "1 Month",
    applied: 37,
    budgetMin: 10000,
    budgetMax: 18000,
    postedDaysAgo: 6,
    thumbnailBg: "bg-[#fff0cc]",
  },
  {
    id: "j18",
    title: "Instagram Fitness Creator — Activewear Launch Campaign",
    company: "PeakForm Thailand",
    companyRating: 4.7,
    companyReviews: 67,
    platform: "Instagram",
    description: "We are launching our SS26 activewear collection and need fitness influencers to model and review the range.",
    brief:
      "Model and review pieces from our new SS26 activewear collection. Content should show the apparel in real workout settings — gym, outdoor run, or yoga — with a focus on fit, performance, and style.",
    deliverables: [
      "2 × Instagram feed posts (workout outfit styling)",
      "4 × Instagram Stories (unboxing, try-on, workout clip)",
      "1 × Instagram Reel (workout montage featuring the collection)",
      "Tag @peakformth and use #PeakFormSS26",
    ],
    requirements: [
      "20,000+ Instagram followers",
      "Fitness, gym, yoga, or active lifestyle niche",
      "Authentic fitness content posting history",
      "Must photograph in real workout environment",
    ],
    aboutBrand:
      "PeakForm Thailand designs performance activewear for Southeast Asian athletes, combining technical fabrics with bold local-inspired designs at competitive prices.",
    website: "peakform.co.th",
    verified: true,
    tags: ["Fitness", "Activewear", "Fashion"],
    location: "Nationwide",
    duration: "3 Weeks",
    applied: 72,
    budgetMin: 15000,
    budgetMax: 25000,
    postedDaysAgo: 2,
    thumbnailBg: "bg-[#d0f0e8]",
  },
];

export function getJobById(id: string): Job | undefined {
  return MOCK_JOBS.find((job) => job.id === id);
}

export function getRelatedJobs(job: Job, limit = 1): Job[] {
  return MOCK_JOBS.filter((j) => j.id !== job.id && j.platform === job.platform).slice(0, limit);
}

export function formatBudget(n: number): string {
  if (n >= 1000) return `฿${(n / 1000).toFixed(0)}K`;
  return `฿${n.toLocaleString()}`;
}

export function formatBudgetRange(min: number, max: number): string {
  return `฿${min.toLocaleString()} – ฿${max.toLocaleString()}`;
}

export function formatPosted(daysAgo: number): string {
  if (daysAgo === 0) return "Today";
  if (daysAgo === 1) return "Yesterday";
  return `${daysAgo}d ago`;
}
