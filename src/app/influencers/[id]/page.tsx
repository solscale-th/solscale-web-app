import { notFound } from "next/navigation";
import InfluencerDetailContent from "@/components/influencer-detail-content";
import RequireAuth from "@/components/require-auth";
import {
  basePriceFromFollowers,
  fetchInfluencerById,
  toInfluencerProfile,
  withMockHireOffer,
  type InfluencerProfile,
  type InfluencerReview,
} from "@/lib/influencers";
import { getInfluencerById, type Influencer } from "@/lib/mock-influencers";

const SAMPLE_REVIEWS: Pick<InfluencerReview, "author" | "comment">[] = [
  {
    author: "Glow Lab Thailand",
    comment:
      "Delivered on brief and the content performed above our usual reach. Clear updates the whole way.",
  },
  {
    author: "Casa Modern TH",
    comment:
      "Easy to work with and the final cut needed almost no revisions. We would book again.",
  },
  {
    author: "PeakForm Thailand",
    comment:
      "Professional from the first call through posting. The audience fit was exactly what we needed.",
  },
];

function mockReviews(influencer: Influencer): InfluencerReview[] {
  const shown = Math.min(3, influencer.reviews);
  return SAMPLE_REVIEWS.slice(0, shown).map((review, index) => ({
    id: `${influencer.id}-review-${index}`,
    author: review.author,
    rating: Math.max(1, Math.min(5, Math.round(influencer.rating) - (index === 2 ? 1 : 0))),
    comment: review.comment,
  }));
}

function resolveMockProfile(id: string): InfluencerProfile | null {
  const mock = getInfluencerById(id);
  if (!mock) return null;

  return withMockHireOffer({
    id: mock.id,
    name: mock.name,
    handle: mock.handle,
    email: null,
    age: null,
    avatarUrl: null,
    platforms: [mock.platform],
    contentCategories: mock.categories,
    languages: [],
    otherPhotos: [],
    averageRating: mock.rating,
    reviewCount: mock.reviews,
    about: mock.about,
    avatarFallbackClass: mock.avatarBg,
    packages: [],
    addons: [],
    portfolio: mock.highlights.map((title, index) => ({
      id: `${mock.id}-work-${index}`,
      title,
      platform: mock.platform,
    })),
    reviews: mockReviews(mock),
  }, {
    includes: mock.contentTypes,
    basePrice: basePriceFromFollowers(mock.followers),
  });
}

export default async function InfluencerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numericId = Number(id);

  let influencer: InfluencerProfile | null = null;

  if (Number.isInteger(numericId) && numericId > 0) {
    try {
      const apiInfluencer = await fetchInfluencerById(numericId);
      if (apiInfluencer) {
        influencer = withMockHireOffer(toInfluencerProfile(apiInfluencer));
      }
    } catch {
      // Fall through to mock data when the API is unavailable.
    }
  }

  if (!influencer) {
    influencer = resolveMockProfile(id);
  }

  if (!influencer) notFound();

  return (
    <RequireAuth returnTo={`/influencers/${id}`}>
      <InfluencerDetailContent influencer={influencer} />
    </RequireAuth>
  );
}
