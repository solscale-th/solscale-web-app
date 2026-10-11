/**
 * Mock of the hire request an entrepreneur sends from the confirm step.
 * It is a private direct invite, so it shows on the influencer Direct tab.
 */
import { buildEngagement } from "@/lib/flowchart/builders";
import { dispatchFlowchart, loadFlowchartState } from "@/lib/flowchart/store";
import type { FlowInvite, FlowPostedJob } from "@/lib/flowchart/types";
import type { MockUser } from "@/lib/mock-users";
import { encodeWorkFeedback } from "@/lib/work-feedback";

export const HIRE_REQUEST_JOB_ID = "job-hire-glow-serum";

const SENT_AT = Date.parse("2026-10-10T09:00:00+07:00");

export const HIRE_REQUEST_POSTED_JOB: FlowPostedJob = {
  id: HIRE_REQUEST_JOB_ID,
  entrepreneurId: "e1",
  companyName: "Glow Lab Thailand",
  title: "Glow Serum 30ml — Standard",
  description: "Brightening serum for a 30-second Reel.",
  brief:
    "Standard package for Nina Somchai: Instagram Reels + Feed posts, plus an extra revision. Post on 20 Oct 2026. Language: Thai. Subtitle: Glow in 30 seconds.",
  platform: "Instagram",
  deliverables: [
    "Standard package — Instagram Reels + Feed posts (฿9,200)",
    "Add-on — Extra revision (฿800)",
    "Total ฿10,000",
  ],
  requirements: [
    "Posting date: 20 Oct 2026",
    "Product: Glow Serum 30ml",
    "Language: Thai",
    "Subtitle: Glow in 30 seconds",
    "Storyboard: storyboard.pdf — concept, content, and camera angles",
    "Voice over: voiceover.pdf — script and narration tone",
    "Super (on-screen text): super.png — on-screen text, key message, and logo",
    "Other detail: other.pdf — mood, tone, and references",
    "Required message: Mention the 30ml size and that it is fragrance-free.",
    "Restricted message: Do not claim it cures acne overnight.",
  ],
  tags: ["Beauty", "Skincare"],
  location: "Bangkok, TH",
  duration: "Post on 20 Oct 2026",
  budgetMin: 10000,
  budgetMax: 10000,
  visibility: "private",
  createdAt: SENT_AT,
};

export function hireRequestInvite(user: Pick<MockUser, "id" | "name">): FlowInvite {
  return {
    id: `inv-hire-glow-serum-${user.id}`,
    jobId: HIRE_REQUEST_JOB_ID,
    entrepreneurId: HIRE_REQUEST_POSTED_JOB.entrepreneurId,
    influencerId: user.id,
    fromCompany: HIRE_REQUEST_POSTED_JOB.companyName,
    influencerName: user.name,
    isPrivate: true,
    status: "pending",
    createdAt: SENT_AT,
  };
}

type AcceptedBy = { id: string; name: string; handle: string };

type ExtraOffer = {
  id: string;
  entrepreneurId: string;
  companyName: string;
  product: string;
  packageName: string;
  packageDetail: string;
  packagePrice: number;
  addonName: string;
  addonPrice: number;
  postDate: string;
  platform: string;
  language: string;
  subtitle: string;
  description: string;
  tags: string[];
  location: string;
  storyboard: string;
  voiceOver?: string;
  superFile: string;
  otherDetail?: string;
  requiredMessage: string;
  restrictedMessage: string;
  acceptedBy?: AcceptedBy;
  createdAt: number;
};

const EXTRA_OFFERS: ExtraOffer[] = [
  {
    id: "job-hire-oak-chair",
    entrepreneurId: "brand-casa",
    companyName: "Casa Modern TH",
    product: "Oak Lounge Chair",
    packageName: "Standard",
    packageDetail: "Instagram Reels + Feed posts",
    packagePrice: 12400,
    addonName: "Extra revision",
    addonPrice: 800,
    postDate: "24 Oct 2026",
    platform: "Instagram",
    language: "Thai",
    subtitle: "Quiet luxury at home",
    description: "A solid-oak lounge chair for a 30-second living-room Reel.",
    tags: ["Home", "Furniture"],
    location: "Bangkok, TH",
    storyboard: "storyboard-oak.pdf — concept, content, and camera angles",
    voiceOver: "voiceover-oak.pdf — script and narration tone",
    superFile: "super-oak.png — on-screen text, key message, and logo",
    otherDetail: "other-oak.pdf — mood, tone, and references",
    requiredMessage: "Mention the solid oak frame and the linen cushion.",
    restrictedMessage: "Do not claim it is handmade in Thailand.",
    acceptedBy: { id: "inf18", name: "Bua Home", handle: "@bua.athome" },
    createdAt: Date.parse("2026-10-11T09:10:00+07:00"),
  },
  {
    id: "job-hire-whey",
    entrepreneurId: "brand-peak",
    companyName: "PeakForm Thailand",
    product: "Whey Isolate 1kg",
    packageName: "Campaign",
    packageDetail: "TikTok video + stitches",
    packagePrice: 18600,
    addonName: "Rush delivery",
    addonPrice: 1100,
    postDate: "28 Oct 2026",
    platform: "TikTok",
    language: "English",
    subtitle: "Train. Recover. Repeat.",
    description: "Vanilla whey isolate for a gym-floor TikTok.",
    tags: ["Fitness", "Nutrition"],
    location: "Bangkok, TH",
    storyboard: "storyboard-whey.pdf — concept, content, and camera angles",
    voiceOver: "voiceover-whey.pdf — script and narration tone",
    superFile: "super-whey.png — on-screen text, key message, and logo",
    otherDetail: "other-whey.pdf — mood, tone, and references",
    requiredMessage: "Mention the 1kg size and 25g protein per serving.",
    restrictedMessage: "Do not claim it replaces a meal or cures injury.",
    acceptedBy: { id: "inf4", name: "Maya Fit", handle: "@maya.moves" },
    createdAt: Date.parse("2026-10-11T09:20:00+07:00"),
  },
  {
    id: "job-hire-mango",
    entrepreneurId: "brand-somtam",
    companyName: "SomTam Empire",
    product: "Mango Sticky Rice Kit",
    packageName: "Starter",
    packageDetail: "One TikTok tasting video",
    packagePrice: 6400,
    addonName: "Cross-post",
    addonPrice: 1400,
    postDate: "2 Nov 2026",
    platform: "TikTok",
    language: "Thai",
    subtitle: "Sweet, sour, street",
    description: "A ready mango sticky rice kit for a tasting TikTok.",
    tags: ["Food", "Street food"],
    location: "Bangkok, TH",
    storyboard: "storyboard-mango.pdf — concept, content, and camera angles",
    voiceOver: "voiceover-mango.pdf — script and narration tone",
    superFile: "super-mango.png — on-screen text, key message, and logo",
    otherDetail: "other-mango.pdf — mood, tone, and references",
    requiredMessage: "Mention the kit serves two and takes ten minutes.",
    restrictedMessage: "Do not say it is a restaurant secret recipe.",
    acceptedBy: { id: "inf2", name: "Tom Foodie", handle: "@tom.eats.th" },
    createdAt: Date.parse("2026-10-11T09:30:00+07:00"),
  },
  {
    id: "job-hire-andaman",
    entrepreneurId: "brand-andaman",
    companyName: "The Andaman Collection",
    product: "Rainy Season Stay",
    packageName: "Standard",
    packageDetail: "Instagram Reels + Feed posts",
    packagePrice: 21000,
    addonName: "Usage rights",
    addonPrice: 2000,
    postDate: "8 Nov 2026",
    platform: "Instagram",
    language: "Thai, English",
    subtitle: "Three nights, one tide",
    description: "A three-night rainy-season stay for a travel Reel.",
    tags: ["Travel", "Hotel"],
    location: "Phuket, TH",
    storyboard: "storyboard-andaman.pdf — concept, content, and camera angles",
    voiceOver: "voiceover-andaman.pdf — script and narration tone",
    superFile: "super-andaman.png — on-screen text, key message, and logo",
    otherDetail: "other-andaman.pdf — mood, tone, and references",
    requiredMessage: "Mention the three-night stay and breakfast included.",
    restrictedMessage: "Do not promise a private beach or a fixed room view.",
    acceptedBy: { id: "inf6", name: "Ploy Travels", handle: "@ploy.wanders" },
    createdAt: Date.parse("2026-10-11T09:40:00+07:00"),
  },
];

function baht(amount: number): string {
  return `฿${amount.toLocaleString("en-US")}`;
}

function extraPostedJob(offer: ExtraOffer): FlowPostedJob {
  const total = offer.packagePrice + offer.addonPrice;
  return {
    id: offer.id,
    entrepreneurId: offer.entrepreneurId,
    companyName: offer.companyName,
    title: `${offer.product} — ${offer.packageName}`,
    description: offer.description,
    brief: `${offer.packageName} package: ${offer.packageDetail}, plus ${offer.addonName}. Post on ${offer.postDate}. Language: ${offer.language}. Subtitle: ${offer.subtitle}.`,
    platform: offer.platform,
    deliverables: [
      `${offer.packageName} package — ${offer.packageDetail} (${baht(offer.packagePrice)})`,
      `Add-on — ${offer.addonName} (${baht(offer.addonPrice)})`,
      `Total ${baht(total)}`,
    ],
    requirements: [
      `Posting date: ${offer.postDate}`,
      `Product: ${offer.product}`,
      `Language: ${offer.language}`,
      `Subtitle: ${offer.subtitle}`,
      `Storyboard: ${offer.storyboard}`,
      ...(offer.voiceOver ? [`Voice over: ${offer.voiceOver}`] : []),
      `Super (on-screen text): ${offer.superFile}`,
      ...(offer.otherDetail ? [`Other detail: ${offer.otherDetail}`] : []),
      `Required message: ${offer.requiredMessage}`,
      `Restricted message: ${offer.restrictedMessage}`,
    ],
    tags: offer.tags,
    location: offer.location,
    duration: `Post on ${offer.postDate}`,
    budgetMin: total,
    budgetMax: total,
    visibility: "private",
    createdAt: offer.createdAt,
  };
}

const SEEDED_PRIVATE_JOBS: FlowPostedJob[] = [
  HIRE_REQUEST_POSTED_JOB,
  ...EXTRA_OFFERS.map(extraPostedJob),
];

const READY_TO_SUBMIT: ExtraOffer[] = [
  {
    id: "job-submit-sunscreen",
    entrepreneurId: "brand-solstice",
    companyName: "Solstice Lab",
    product: "Mineral Sunscreen Stick",
    packageName: "Standard",
    packageDetail: "Instagram Reels + Feed posts",
    packagePrice: 8900,
    addonName: "Extra revision",
    addonPrice: 800,
    postDate: "18 Oct 2026",
    platform: "Instagram",
    language: "Thai",
    subtitle: "Sun, then go",
    description: "A mineral sunscreen stick for a daytime Reel.",
    tags: ["Beauty", "Skincare"],
    location: "Bangkok, TH",
    storyboard: "storyboard-sun.pdf — concept, content, and camera angles",
    voiceOver: "voiceover-sun.pdf — script and narration tone",
    superFile: "super-sun.png — on-screen text, key message, and logo",
    otherDetail: "other-sun.pdf — mood, tone, and references",
    requiredMessage: "Mention SPF 50 and that it leaves no white cast.",
    restrictedMessage: "Do not claim it replaces a dermatologist visit.",
    createdAt: Date.parse("2026-10-08T10:00:00+07:00"),
  },
  {
    id: "job-submit-matcha",
    entrepreneurId: "brand-niran",
    companyName: "Cafe Niran",
    product: "Ceremonial Matcha 50g",
    packageName: "Starter",
    packageDetail: "One TikTok tasting video",
    packagePrice: 5400,
    addonName: "Rush delivery",
    addonPrice: 1100,
    postDate: "22 Oct 2026",
    platform: "TikTok",
    language: "Thai",
    subtitle: "Whisk, pour, sip",
    description: "Ceremonial matcha for a whisking TikTok.",
    tags: ["Food", "Cafe"],
    location: "Chiang Mai, TH",
    storyboard: "storyboard-matcha.pdf — concept, content, and camera angles",
    voiceOver: "voiceover-matcha.pdf — script and narration tone",
    superFile: "super-matcha.png — on-screen text, key message, and logo",
    otherDetail: "other-matcha.pdf — mood, tone, and references",
    requiredMessage: "Mention the 50g tin and the bamboo whisk in the kit.",
    restrictedMessage: "Do not say it cures fatigue or replaces coffee for health.",
    createdAt: Date.parse("2026-10-08T11:00:00+07:00"),
  },
  {
    id: "job-submit-sneakers",
    entrepreneurId: "brand-northrun",
    companyName: "North Run",
    product: "Cloud Sprint Shoes",
    packageName: "Campaign",
    packageDetail: "Instagram Reels + Feed posts + Stories",
    packagePrice: 16000,
    addonName: "Usage rights",
    addonPrice: 2000,
    postDate: "30 Oct 2026",
    platform: "Instagram",
    language: "English",
    subtitle: "Light on the landing",
    description: "A road-running shoe for a morning-run Reel.",
    tags: ["Fitness", "Sport"],
    location: "Bangkok, TH",
    storyboard: "storyboard-sprint.pdf — concept, content, and camera angles",
    voiceOver: "voiceover-sprint.pdf — script and narration tone",
    superFile: "super-sprint.png — on-screen text, key message, and logo",
    otherDetail: "other-sprint.pdf — mood, tone, and references",
    requiredMessage: "Mention the cushioned sole and the 280g weight.",
    restrictedMessage: "Do not claim it prevents injury.",
    createdAt: Date.parse("2026-10-08T12:00:00+07:00"),
  },
  {
    id: "job-submit-speaker",
    entrepreneurId: "brand-beam",
    companyName: "Beam Audio",
    product: "Pocket Speaker Mini",
    packageName: "Standard",
    packageDetail: "TikTok video + stitches",
    packagePrice: 11200,
    addonName: "Cross-post",
    addonPrice: 1400,
    postDate: "5 Nov 2026",
    platform: "TikTok",
    language: "Thai, English",
    subtitle: "Sound that fits a pocket",
    description: "A pocket speaker for a desk-setup TikTok.",
    tags: ["Tech", "Audio"],
    location: "Bangkok, TH",
    storyboard: "storyboard-speaker.pdf — concept, content, and camera angles",
    voiceOver: "voiceover-speaker.pdf — script and narration tone",
    superFile: "super-speaker.png — on-screen text, key message, and logo",
    otherDetail: "other-speaker.pdf — mood, tone, and references",
    requiredMessage: "Mention 12-hour battery and Bluetooth pairing.",
    restrictedMessage: "Do not claim it is waterproof.",
    createdAt: Date.parse("2026-10-08T13:00:00+07:00"),
  },
];

const NEEDS_FIX: ExtraOffer[] = [
  {
    id: "job-fix-toner",
    entrepreneurId: "brand-lily",
    companyName: "Lily Atelier",
    product: "Rice Toner 150ml",
    packageName: "Standard",
    packageDetail: "Instagram Reels + Feed posts",
    packagePrice: 9200,
    addonName: "Extra revision",
    addonPrice: 800,
    postDate: "16 Oct 2026",
    platform: "Instagram",
    language: "Thai",
    subtitle: "Soft water, clear skin",
    description: "A rice toner for a bathroom-shelf Reel.",
    tags: ["Beauty", "Skincare"],
    location: "Bangkok, TH",
    storyboard: "storyboard-toner.pdf — concept, content, and camera angles",
    voiceOver: "voiceover-toner.pdf — script and narration tone",
    superFile: "super-toner.png — on-screen text, key message, and logo",
    otherDetail: "other-toner.pdf — mood, tone, and references",
    requiredMessage: "Mention the 150ml bottle and that it is alcohol-free.",
    restrictedMessage: "Do not claim it removes dark spots overnight.",
    createdAt: Date.parse("2026-10-07T10:00:00+07:00"),
  },
  {
    id: "job-fix-noodles",
    entrepreneurId: "brand-nightwok",
    companyName: "Night Wok",
    product: "Chilli Oil Noodles",
    packageName: "Starter",
    packageDetail: "One TikTok tasting video",
    packagePrice: 6100,
    addonName: "Rush delivery",
    addonPrice: 1100,
    postDate: "19 Oct 2026",
    platform: "TikTok",
    language: "Thai",
    subtitle: "Heat, then slurp",
    description: "A chilli oil noodle kit for a late-night tasting TikTok.",
    tags: ["Food", "Noodles"],
    location: "Bangkok, TH",
    storyboard: "storyboard-noodles.pdf — concept, content, and camera angles",
    voiceOver: "voiceover-noodles.pdf — script and narration tone",
    superFile: "super-noodles.png — on-screen text, key message, and logo",
    otherDetail: "other-noodles.pdf — mood, tone, and references",
    requiredMessage: "Mention the kit cooks in eight minutes.",
    restrictedMessage: "Do not say it is less spicy than it looks.",
    createdAt: Date.parse("2026-10-07T11:00:00+07:00"),
  },
  {
    id: "job-fix-mat",
    entrepreneurId: "brand-stillform",
    companyName: "Still Form",
    product: "Cork Yoga Mat",
    packageName: "Campaign",
    packageDetail: "Instagram Reels + Feed posts + Stories",
    packagePrice: 14800,
    addonName: "Usage rights",
    addonPrice: 2000,
    postDate: "26 Oct 2026",
    platform: "Instagram",
    language: "English",
    subtitle: "Quiet under the hands",
    description: "A cork yoga mat for a morning-practice Reel.",
    tags: ["Fitness", "Wellness"],
    location: "Bangkok, TH",
    storyboard: "storyboard-mat.pdf — concept, content, and camera angles",
    voiceOver: "voiceover-mat.pdf — script and narration tone",
    superFile: "super-mat.png — on-screen text, key message, and logo",
    otherDetail: "other-mat.pdf — mood, tone, and references",
    requiredMessage: "Mention the cork surface and the 4mm thickness.",
    restrictedMessage: "Do not claim it prevents injury.",
    createdAt: Date.parse("2026-10-07T12:00:00+07:00"),
  },
  {
    id: "job-fix-bottle",
    entrepreneurId: "brand-carryday",
    companyName: "Carry Day",
    product: "Steel Bottle 500ml",
    packageName: "Standard",
    packageDetail: "TikTok video + stitches",
    packagePrice: 7800,
    addonName: "Cross-post",
    addonPrice: 1400,
    postDate: "1 Nov 2026",
    platform: "TikTok",
    language: "Thai, English",
    subtitle: "Cold until lunch",
    description: "A steel bottle for a commute TikTok.",
    tags: ["Lifestyle", "Daily"],
    location: "Bangkok, TH",
    storyboard: "storyboard-bottle.pdf — concept, content, and camera angles",
    voiceOver: "voiceover-bottle.pdf — script and narration tone",
    superFile: "super-bottle.png — on-screen text, key message, and logo",
    otherDetail: "other-bottle.pdf — mood, tone, and references",
    requiredMessage: "Mention the 500ml size and that it stays cold for 12 hours.",
    restrictedMessage: "Do not claim it is unbreakable.",
    createdAt: Date.parse("2026-10-07T13:00:00+07:00"),
  },
];

const FIX_SUBMISSIONS = [
  "https://www.instagram.com/p/rice-toner\nFile: toner-reel.mp4\nFile: toner-shelf.png",
  "https://www.tiktok.com/@night.wok/video/chilli\nFile: noodles-slurp.mp4",
  "https://www.instagram.com/p/cork-mat\nFile: mat-practice.mp4",
  "https://www.tiktok.com/@carry.day/video/bottle\nFile: bottle-commute.mp4\nFile: bottle-lid.png",
];

const FIX_FEEDBACK = [
  encodeWorkFeedback({
    items: [
      { key: "storyboard", score: 2, comment: "The opening shot misses the bottle." },
      { key: "voiceOver", score: 4, comment: "The tone is calm. Shorten the last line." },
      { key: "super", score: 3, comment: "The logo sits too close to the edge." },
      { key: "other", score: 2, comment: "The cut is cooler than the mood board." },
    ],
    overall: "Recut the first three seconds and move the logo in.",
  }),
  encodeWorkFeedback({
    items: [
      { key: "storyboard", score: 3, comment: "Show the chilli oil pour before the first bite." },
      { key: "voiceOver", score: 2, comment: "The spice level is never said out loud." },
      { key: "super", score: 4, comment: "The eight-minute line is clear." },
      { key: "other", score: 3, comment: "Add one tighter shot of the noodles." },
    ],
    overall: "Say the cook time and show the oil hitting the bowl.",
  }),
  encodeWorkFeedback({
    items: [
      { key: "storyboard", score: 2, comment: "The mat is only visible at the end." },
      { key: "voiceOver", score: 3, comment: "Mention the cork and the 4mm thickness." },
      { key: "super", score: 2, comment: "The brand name is covered by the hands." },
      { key: "other", score: 4, comment: "The morning light matches the reference." },
    ],
    overall: "Start on the mat and keep the logo readable.",
  }),
  encodeWorkFeedback({
    items: [
      { key: "storyboard", score: 3, comment: "The commute shot is too short." },
      { key: "voiceOver", score: 2, comment: "The 12-hour cold claim is missing." },
      { key: "super", score: 3, comment: "The 500ml text is hard to read." },
      { key: "other", score: 4, comment: "The lid close-up is useful." },
    ],
    overall: "Hold the bottle longer and say that it stays cold until lunch.",
  }),
];

const PASSED: ExtraOffer[] = [
  {
    id: "job-pass-serum",
    entrepreneurId: "brand-citrus",
    companyName: "Citrus Lab",
    product: "Vitamin C Serum",
    packageName: "Standard",
    packageDetail: "Instagram Reels + Feed posts",
    packagePrice: 9800,
    addonName: "Extra revision",
    addonPrice: 800,
    postDate: "12 Oct 2026",
    platform: "Instagram",
    language: "Thai",
    subtitle: "Bright by morning",
    description: "A vitamin C serum for a vanity Reel.",
    tags: ["Beauty", "Skincare"],
    location: "Bangkok, TH",
    storyboard: "storyboard-serum.pdf — concept, content, and camera angles",
    voiceOver: "voiceover-serum.pdf — script and narration tone",
    superFile: "super-serum.png — on-screen text, key message, and logo",
    otherDetail: "other-serum.pdf — mood, tone, and references",
    requiredMessage: "Mention vitamin C and the 30ml dropper.",
    restrictedMessage: "Do not claim it erases wrinkles.",
    createdAt: Date.parse("2026-10-06T10:00:00+07:00"),
  },
  {
    id: "job-pass-coffee",
    entrepreneurId: "brand-rail",
    companyName: "Morning Rail",
    product: "Pour Over Coffee",
    packageName: "Starter",
    packageDetail: "One TikTok tasting video",
    packagePrice: 5600,
    addonName: "Rush delivery",
    addonPrice: 1100,
    postDate: "14 Oct 2026",
    platform: "TikTok",
    language: "Thai",
    subtitle: "Bloom, then pour",
    description: "A pour-over coffee for a morning TikTok.",
    tags: ["Food", "Coffee"],
    location: "Chiang Mai, TH",
    storyboard: "storyboard-coffee.pdf — concept, content, and camera angles",
    voiceOver: "voiceover-coffee.pdf — script and narration tone",
    superFile: "super-coffee.png — on-screen text, key message, and logo",
    otherDetail: "other-coffee.pdf — mood, tone, and references",
    requiredMessage: "Mention the 250g bag and the brew time.",
    restrictedMessage: "Do not claim it replaces sleep.",
    createdAt: Date.parse("2026-10-06T11:00:00+07:00"),
  },
  {
    id: "job-pass-hat",
    entrepreneurId: "brand-shade",
    companyName: "Shade Club",
    product: "Linen Cap",
    packageName: "Campaign",
    packageDetail: "Instagram Reels + Feed posts + Stories",
    packagePrice: 13200,
    addonName: "Usage rights",
    addonPrice: 2000,
    postDate: "21 Oct 2026",
    platform: "Instagram",
    language: "English",
    subtitle: "Shade that folds flat",
    description: "A linen cap for a street-style Reel.",
    tags: ["Fashion", "Daily"],
    location: "Bangkok, TH",
    storyboard: "storyboard-hat.pdf — concept, content, and camera angles",
    voiceOver: "voiceover-hat.pdf — script and narration tone",
    superFile: "super-hat.png — on-screen text, key message, and logo",
    otherDetail: "other-hat.pdf — mood, tone, and references",
    requiredMessage: "Mention the linen and that it packs flat.",
    restrictedMessage: "Do not claim it blocks all UV.",
    createdAt: Date.parse("2026-10-06T12:00:00+07:00"),
  },
  {
    id: "job-pass-candle",
    entrepreneurId: "brand-quiet",
    companyName: "Room Quiet",
    product: "Fig Candle",
    packageName: "Standard",
    packageDetail: "TikTok video + stitches",
    packagePrice: 7400,
    addonName: "Cross-post",
    addonPrice: 1400,
    postDate: "25 Oct 2026",
    platform: "TikTok",
    language: "Thai, English",
    subtitle: "One room, one flame",
    description: "A fig candle for an evening desk TikTok.",
    tags: ["Home", "Lifestyle"],
    location: "Bangkok, TH",
    storyboard: "storyboard-candle.pdf — concept, content, and camera angles",
    voiceOver: "voiceover-candle.pdf — script and narration tone",
    superFile: "super-candle.png — on-screen text, key message, and logo",
    otherDetail: "other-candle.pdf — mood, tone, and references",
    requiredMessage: "Mention the fig scent and the 40-hour burn.",
    restrictedMessage: "Do not claim it is unscented.",
    createdAt: Date.parse("2026-10-06T13:00:00+07:00"),
  },
];

const PASS_SUBMISSIONS = [
  "https://www.instagram.com/p/vitamin-c\nFile: serum-reel.mp4",
  "https://www.tiktok.com/@morning.rail/video/pour\nFile: coffee-pour.mp4",
  "https://www.instagram.com/p/linen-cap\nFile: hat-street.mp4",
  "https://www.tiktok.com/@room.quiet/video/fig\nFile: candle-desk.mp4",
];

export function findSeededPrivateJob(id: string): FlowPostedJob | undefined {
  const ready = READY_TO_SUBMIT.find((offer) => offer.id === id);
  if (ready) return extraPostedJob(ready);
  const fix = NEEDS_FIX.find((offer) => offer.id === id);
  if (fix) return extraPostedJob(fix);
  const passed = PASSED.find((offer) => offer.id === id);
  if (passed) return extraPostedJob(passed);
  return SEEDED_PRIVATE_JOBS.find((job) => job.id === id);
}

export function isSeededPrivateJob(id: string): boolean {
  return SEEDED_PRIVATE_JOBS.some((job) => job.id === id);
}

export function isReadyToSubmitJob(id: string): boolean {
  return READY_TO_SUBMIT.some((offer) => offer.id === id);
}

export function isRevisionJob(id: string): boolean {
  return NEEDS_FIX.some((offer) => offer.id === id);
}

export function isPassedJob(id: string): boolean {
  return PASSED.some((offer) => offer.id === id);
}

function publishIfMissing(job: FlowPostedJob): void {
  if (!loadFlowchartState().postedJobs.some((item) => item.id === job.id)) {
    dispatchFlowchart({ type: "PUBLISH_JOB", job });
  }
}

function syncPostedJob(job: FlowPostedJob): void {
  dispatchFlowchart({ type: "SYNC_POSTED_JOB", job });
}

function pendingInvite(job: FlowPostedJob, user: Pick<MockUser, "id" | "name">): FlowInvite {
  return {
    id: `inv-${job.id}-${user.id}`,
    jobId: job.id,
    entrepreneurId: job.entrepreneurId,
    influencerId: user.id,
    fromCompany: job.companyName,
    influencerName: user.name,
    isPrivate: true,
    status: "pending",
    createdAt: job.createdAt,
  };
}

/** Adds private offers once for this influencer. A declined invite stays declined. */
export function ensureHireRequestInvite(user: MockUser): void {
  if (user.role !== "influencer") return;
  if (typeof window === "undefined") return;

  for (const job of SEEDED_PRIVATE_JOBS) {
    publishIfMissing(job);
    syncPostedJob(job);
    const alreadyInvited = loadFlowchartState().invites.some(
      (invite) => invite.jobId === job.id && invite.influencerId === user.id
    );
    if (!alreadyInvited) {
      dispatchFlowchart({
        type: "SEND_INVITE",
        invite: job.id === HIRE_REQUEST_JOB_ID ? hireRequestInvite(user) : pendingInvite(job, user),
      });
    }
  }
}

/**
 * Same four offers, already accepted, so the brand who is logged in sees a
 * payment dot on Direct. Uses the signed-in entrepreneur id.
 */
export function ensureAcceptedPrivateOffers(user: MockUser): void {
  if (user.role !== "entrepreneur") return;
  if (typeof window === "undefined") return;

  for (const offer of EXTRA_OFFERS) {
    if (!offer.acceptedBy) continue;
    const acceptedBy = offer.acceptedBy;
    const job = extraPostedJob(offer);
    publishIfMissing(job);
    const existing = loadFlowchartState().invites.find(
      (invite) => invite.jobId === job.id && invite.entrepreneurId === user.id
    );
    if (existing?.status === "accepted" || existing?.status === "declined") continue;

    const invite: FlowInvite = existing ?? {
      id: `inv-${job.id}-accepted-${user.id}`,
      jobId: job.id,
      entrepreneurId: user.id,
      influencerId: acceptedBy.id,
      fromCompany: job.companyName,
      influencerName: acceptedBy.name,
      isPrivate: true,
      status: "pending",
      createdAt: job.createdAt,
    };
    if (!existing) {
      dispatchFlowchart({ type: "SEND_INVITE", invite });
    }
    const total = offer.packagePrice + offer.addonPrice;
    dispatchFlowchart({
      type: "ACCEPT_INVITE",
      inviteId: invite.id,
      engagement: buildEngagement({
        jobId: job.id,
        influencerId: acceptedBy.id,
        entrepreneurId: user.id,
        influencerName: acceptedBy.name,
        influencerHandle: acceptedBy.handle,
        escrowAmount: total,
        source: "invite",
        sourceId: invite.id,
      }),
    });
  }
}

/** Paid jobs whose work is finished and waiting for the influencer to upload it. */
export function ensureReadyToSubmitJobs(user: MockUser): void {
  if (user.role !== "influencer") return;
  if (typeof window === "undefined") return;

  const handle = `@${user.name.replace(/\s+/g, "").toLowerCase()}`;

  for (const offer of READY_TO_SUBMIT) {
    const job = extraPostedJob(offer);
    publishIfMissing(job);
    syncPostedJob(job);
    const existing = loadFlowchartState().engagements.find(
      (item) => item.jobId === job.id && item.influencerId === user.id
    );
    if (existing) {
      if (!existing.checkoutPaid && existing.paymentStatus === "escrowed") {
        dispatchFlowchart({ type: "PAY_JOB", engagementId: existing.id });
      }
      continue;
    }

    const inviteId = `inv-${job.id}-ready-${user.id}`;
    if (!loadFlowchartState().invites.some((item) => item.id === inviteId)) {
      dispatchFlowchart({
        type: "SEND_INVITE",
        invite: {
          id: inviteId,
          jobId: job.id,
          entrepreneurId: job.entrepreneurId,
          influencerId: user.id,
          fromCompany: job.companyName,
          influencerName: user.name,
          isPrivate: true,
          status: "pending",
          createdAt: job.createdAt,
        },
      });
    }
    const invite = loadFlowchartState().invites.find((item) => item.id === inviteId);
    if (invite?.status !== "pending") continue;

    const engagement = buildEngagement({
      jobId: job.id,
      influencerId: user.id,
      entrepreneurId: job.entrepreneurId,
      influencerName: user.name,
      influencerHandle: handle,
      escrowAmount: offer.packagePrice + offer.addonPrice,
      source: "invite",
      sourceId: inviteId,
    });
    dispatchFlowchart({ type: "ACCEPT_INVITE", inviteId, engagement });
    dispatchFlowchart({ type: "PAY_JOB", engagementId: engagement.id });
  }
}

const REVIEW_INFLUENCERS = [
  { id: "inf-review-mina", name: "Mina Glow", handle: "@mina.glow" },
  { id: "inf-review-ken", name: "Ken Brew", handle: "@ken.brew" },
  { id: "inf-review-aom", name: "Aom Run", handle: "@aom.run" },
  { id: "inf-review-kit", name: "Kit Sound", handle: "@kit.sound" },
];

const REVIEW_NOTES = [
  "https://www.instagram.com/p/sunscreen-reel\nhttps://www.tiktok.com/@mina.glow/video/88\nFile: sunscreen-reel.mp4\nFile: sunscreen-still.png",
  "https://www.tiktok.com/@ken.brew/video/matcha\nFile: matcha-whisk.mp4\nFile: matcha-tin.jpg",
  "https://www.instagram.com/p/cloud-sprint\nhttps://www.instagram.com/stories/aom.run/sprint\nFile: sprint-reel.mp4",
  "https://www.tiktok.com/@kit.sound/video/pocket\nFile: speaker-desk.mp4\nFile: speaker-detail.png",
];

/** Paid jobs the influencer has already submitted, for the signed-in brand to review. */
export function ensureSubmittedReviews(user: MockUser): void {
  if (user.role !== "entrepreneur") return;
  if (typeof window === "undefined") return;

  READY_TO_SUBMIT.forEach((offer, index) => {
    const job = extraPostedJob(offer);
    const reviewer = REVIEW_INFLUENCERS[index];
    const note = REVIEW_NOTES[index];
    if (!reviewer || !note) return;
    publishIfMissing(job);
    syncPostedJob(job);

    const existing = loadFlowchartState().engagements.find(
      (item) => item.jobId === job.id && item.entrepreneurId === user.id
    );
    if (existing) {
      if (!existing.checkoutPaid && existing.paymentStatus === "escrowed") {
        dispatchFlowchart({ type: "PAY_JOB", engagementId: existing.id });
      }
      const current = loadFlowchartState().engagements.find((item) => item.id === existing.id);
      if (current?.checkoutPaid && current.workStatus === "not_submitted") {
        dispatchFlowchart({ type: "SUBMIT_WORK", engagementId: current.id, note });
      }
      return;
    }

    const inviteId = `inv-${job.id}-review-${user.id}`;
    if (!loadFlowchartState().invites.some((item) => item.id === inviteId)) {
      dispatchFlowchart({
        type: "SEND_INVITE",
        invite: {
          id: inviteId,
          jobId: job.id,
          entrepreneurId: user.id,
          influencerId: reviewer.id,
          fromCompany: job.companyName,
          influencerName: reviewer.name,
          isPrivate: true,
          status: "pending",
          createdAt: job.createdAt,
        },
      });
    }
    const invite = loadFlowchartState().invites.find((item) => item.id === inviteId);
    if (invite?.status !== "pending") return;

    const engagement = buildEngagement({
      jobId: job.id,
      influencerId: reviewer.id,
      entrepreneurId: user.id,
      influencerName: reviewer.name,
      influencerHandle: reviewer.handle,
      escrowAmount: offer.packagePrice + offer.addonPrice,
      source: "invite",
      sourceId: inviteId,
    });
    dispatchFlowchart({ type: "ACCEPT_INVITE", inviteId, engagement });
    dispatchFlowchart({ type: "PAY_JOB", engagementId: engagement.id });
    dispatchFlowchart({ type: "SUBMIT_WORK", engagementId: engagement.id, note });
  });
}

/** Paid submissions the brand has sent back for the influencer to fix. */
export function ensureRevisionJobs(user: MockUser): void {
  if (user.role !== "influencer") return;
  if (typeof window === "undefined") return;

  const handle = `@${user.name.replace(/\s+/g, "").toLowerCase()}`;

  NEEDS_FIX.forEach((offer, index) => {
    const job = extraPostedJob(offer);
    const submission = FIX_SUBMISSIONS[index];
    const feedback = FIX_FEEDBACK[index];
    if (!submission || !feedback) return;
    publishIfMissing(job);
    syncPostedJob(job);

    const existing = loadFlowchartState().engagements.find(
      (item) => item.jobId === job.id && item.influencerId === user.id
    );
    if (existing) {
      if (!existing.checkoutPaid && existing.paymentStatus === "escrowed") {
        dispatchFlowchart({ type: "PAY_JOB", engagementId: existing.id });
      }
      const current = loadFlowchartState().engagements.find((item) => item.id === existing.id);
      if (current?.checkoutPaid && current.workStatus === "not_submitted") {
        dispatchFlowchart({ type: "SUBMIT_WORK", engagementId: current.id, note: submission });
        dispatchFlowchart({ type: "REQUEST_REVISION", engagementId: current.id, note: feedback });
      }
      return;
    }

    const inviteId = `inv-${job.id}-fix-${user.id}`;
    if (!loadFlowchartState().invites.some((item) => item.id === inviteId)) {
      dispatchFlowchart({
        type: "SEND_INVITE",
        invite: {
          id: inviteId,
          jobId: job.id,
          entrepreneurId: job.entrepreneurId,
          influencerId: user.id,
          fromCompany: job.companyName,
          influencerName: user.name,
          isPrivate: true,
          status: "pending",
          createdAt: job.createdAt,
        },
      });
    }
    const invite = loadFlowchartState().invites.find((item) => item.id === inviteId);
    if (invite?.status !== "pending") return;

    const engagement = buildEngagement({
      jobId: job.id,
      influencerId: user.id,
      entrepreneurId: job.entrepreneurId,
      influencerName: user.name,
      influencerHandle: handle,
      escrowAmount: offer.packagePrice + offer.addonPrice,
      source: "invite",
      sourceId: inviteId,
    });
    dispatchFlowchart({ type: "ACCEPT_INVITE", inviteId, engagement });
    dispatchFlowchart({ type: "PAY_JOB", engagementId: engagement.id });
    dispatchFlowchart({ type: "SUBMIT_WORK", engagementId: engagement.id, note: submission });
    dispatchFlowchart({ type: "REQUEST_REVISION", engagementId: engagement.id, note: feedback });
  });
}

/** Paid submissions the brand has accepted, so the influencer can release payment. */
export function ensurePassedJobs(user: MockUser): void {
  if (user.role !== "influencer") return;
  if (typeof window === "undefined") return;

  const handle = `@${user.name.replace(/\s+/g, "").toLowerCase()}`;

  PASSED.forEach((offer, index) => {
    const job = extraPostedJob(offer);
    const submission = PASS_SUBMISSIONS[index];
    if (!submission) return;
    publishIfMissing(job);
    syncPostedJob(job);

    const existing = loadFlowchartState().engagements.find(
      (item) => item.jobId === job.id && item.influencerId === user.id
    );
    if (existing) {
      if (!existing.checkoutPaid && existing.paymentStatus === "escrowed") {
        dispatchFlowchart({ type: "PAY_JOB", engagementId: existing.id });
      }
      const current = loadFlowchartState().engagements.find((item) => item.id === existing.id);
      if (current?.checkoutPaid && current.workStatus === "not_submitted") {
        dispatchFlowchart({ type: "SUBMIT_WORK", engagementId: current.id, note: submission });
        dispatchFlowchart({ type: "APPROVE_WORK", engagementId: current.id });
      } else if (current?.checkoutPaid && current.workStatus === "submitted") {
        dispatchFlowchart({ type: "APPROVE_WORK", engagementId: current.id });
      }
      return;
    }

    const inviteId = `inv-${job.id}-pass-${user.id}`;
    if (!loadFlowchartState().invites.some((item) => item.id === inviteId)) {
      dispatchFlowchart({
        type: "SEND_INVITE",
        invite: {
          id: inviteId,
          jobId: job.id,
          entrepreneurId: job.entrepreneurId,
          influencerId: user.id,
          fromCompany: job.companyName,
          influencerName: user.name,
          isPrivate: true,
          status: "pending",
          createdAt: job.createdAt,
        },
      });
    }
    const invite = loadFlowchartState().invites.find((item) => item.id === inviteId);
    if (invite?.status !== "pending") return;

    const engagement = buildEngagement({
      jobId: job.id,
      influencerId: user.id,
      entrepreneurId: job.entrepreneurId,
      influencerName: user.name,
      influencerHandle: handle,
      escrowAmount: offer.packagePrice + offer.addonPrice,
      source: "invite",
      sourceId: inviteId,
    });
    dispatchFlowchart({ type: "ACCEPT_INVITE", inviteId, engagement });
    dispatchFlowchart({ type: "PAY_JOB", engagementId: engagement.id });
    dispatchFlowchart({ type: "SUBMIT_WORK", engagementId: engagement.id, note: submission });
    dispatchFlowchart({ type: "APPROVE_WORK", engagementId: engagement.id });
  });
}
