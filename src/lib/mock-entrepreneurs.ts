import { MOCK_JOBS, type Job } from "@/lib/mock-jobs";

export type Entrepreneur = {
  id: string;
  name: string;
  website: string;
  verified: boolean;
  rating: number;
  reviews: number;
  about: string;
  avatarBg: string;
};

export const MOCK_ENTREPRENEURS: Entrepreneur[] = [
  { id: "e1",  name: "Glow Lab Thailand",       website: "glowlabthailand.com",   verified: true,  rating: 4.8, reviews: 132, avatarBg: "bg-[#d4e8d0]", about: "Glow Lab Thailand is a homegrown premium skincare brand founded in 2019. We combine Thai botanical ingredients with modern dermatological science to create effective, clean beauty products loved by over 200,000 customers nationwide." },
  { id: "e2",  name: "SomTam Empire",            website: "somtamempire.co.th",    verified: true,  rating: 4.2, reviews: 88,  avatarBg: "bg-[#ffe8cc]", about: "SomTam Empire is one of Thailand's fastest-growing casual dining chains, known for authentic Isaan flavors and modern restaurant experiences across Bangkok and Chiang Mai." },
  { id: "e3",  name: "TechEdge Asia",            website: "techedge.asia",         verified: true,  rating: 4.7, reviews: 127, avatarBg: "bg-[#cce4ff]", about: "TechEdge Asia distributes premium mobile accessories across Southeast Asia, partnering with global brands to bring innovative tech products to Thai consumers." },
  { id: "e4",  name: "Zara TH Studio",           website: "zarathstudio.com",      verified: false, rating: 4.4, reviews: 56,  avatarBg: "bg-[#f0e6ff]", about: "Zara TH Studio curates contemporary fashion collections for the modern Thai consumer, blending international trends with local style sensibilities." },
  { id: "e5",  name: "WealthWise TH",            website: "wealthwise.th",         verified: true,  rating: 4.7, reviews: 41,  avatarBg: "bg-[#fce8ee]", about: "WealthWise TH is Thailand's leading personal finance podcast, helping young professionals build wealth through practical, actionable advice." },
  { id: "e6",  name: "LaeOlin Partner Brand",    website: "laeolin.co.th",         verified: false, rating: 4.3, reviews: 95,  avatarBg: "bg-[#e3eeff]", about: "LaeOlin Partner Brand is a leading electronics distributor running flash sale events across Facebook and Lazada for top consumer tech brands." },
  { id: "e7",  name: "The Resort Phuket",        website: "theresortphuket.com",   verified: false, rating: 3.0, reviews: 22,  avatarBg: "bg-[#d0f0e8]", about: "The Resort Phuket is a boutique wellness retreat on the Andaman coast, offering spa treatments, yoga classes, and farm-to-table dining in a serene tropical setting." },
  { id: "e8",  name: "LeanFuel Thailand",        website: "leanfuelthailand.com",  verified: true,  rating: 4.5, reviews: 198, avatarBg: "bg-[#fff3cc]", about: "LeanFuel Thailand produces premium protein supplements for fitness enthusiasts, with products available at major retailers and online across the country." },
  { id: "e9",  name: "The Andaman Collection",   website: "andamancollection.com", verified: true,  rating: 4.6, reviews: 74,  avatarBg: "bg-[#d4e8ff]", about: "The Andaman Collection is a group of boutique luxury resorts along Thailand's Andaman coast, celebrated for personalised service and stunning natural settings." },
  { id: "e10", name: "StockDee Thailand",        website: "stockdee.th",           verified: true,  rating: 4.5, reviews: 53,  avatarBg: "bg-[#e8e0ff]", about: "StockDee Thailand is a commission-free stock and ETF trading app designed for the next generation of Thai investors, with over 500,000 active users." },
  { id: "e11", name: "ArcLight Games TH",        website: "arclightgames.co.th",   verified: true,  rating: 4.3, reviews: 61,  avatarBg: "bg-[#f0e6ff]", about: "ArcLight Games TH develops and publishes mobile games for Southeast Asian audiences, with a portfolio of 12 titles across RPG, strategy, and casual genres." },
  { id: "e12", name: "Casa Modern TH",           website: "casamodern.co.th",      verified: false, rating: 4.4, reviews: 48,  avatarBg: "bg-[#fef0e0]", about: "Casa Modern TH brings Scandinavian-inspired furniture to Thai homes, offering clean lines, quality materials, and affordable pricing through its online and showroom stores." },
  { id: "e13", name: "NaturePure TH",            website: "naturepure.co.th",      verified: true,  rating: 4.6, reviews: 82,  avatarBg: "bg-[#d8f0e0]", about: "NaturePure TH sources premium herbal and botanical ingredients to create certified wellness supplements trusted by over 100,000 customers across Thailand." },
  { id: "e14", name: "GreenDrive TH",            website: "greendrive.co.th",      verified: false, rating: 4.2, reviews: 31,  avatarBg: "bg-[#d0e8d4]", about: "GreenDrive TH is an EV advisory and community platform helping Thai consumers navigate the shift to electric vehicles with guides, reviews, and charging station maps." },
  { id: "e15", name: "Founders FM Thailand",     website: "foundersfm.th",         verified: true,  rating: 4.8, reviews: 39,  avatarBg: "bg-[#ffe8d8]", about: "Founders FM Thailand is a weekly podcast interviewing Thai entrepreneurs and startup founders, with 80,000+ listeners per episode across Spotify and Apple Podcasts." },
  { id: "e16", name: "ColorBoom Cosmetics",      website: "colorboom.co.th",       verified: true,  rating: 4.5, reviews: 109, avatarBg: "bg-[#ffe0ec]", about: "ColorBoom Cosmetics is a Thai-born makeup brand known for bold, long-lasting lip products at accessible price points, available in 500+ stores nationwide." },
  { id: "e17", name: "Krua Authentic Kitchen",   website: "kruaauthentic.com",     verified: false, rating: 4.3, reviews: 44,  avatarBg: "bg-[#fff0cc]", about: "Krua Authentic Kitchen offers premium Thai cooking classes for locals and tourists, featuring hands-on instruction by professional chefs in a traditional Thai home setting." },
  { id: "e18", name: "PeakForm Thailand",        website: "peakform.co.th",        verified: true,  rating: 4.7, reviews: 67,  avatarBg: "bg-[#d0f0e8]", about: "PeakForm Thailand designs performance activewear for Southeast Asian athletes, combining technical fabrics with bold local-inspired designs at competitive prices." },
];

export function getEntrepreneurById(id: string): Entrepreneur | undefined {
  return MOCK_ENTREPRENEURS.find((e) => e.id === id);
}

export function getJobsByEntrepreneur(companyId: string): Job[] {
  return MOCK_JOBS.filter((j) => j.companyId === companyId);
}
