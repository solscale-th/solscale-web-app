import { notFound } from "next/navigation";
import InfluencerDetailContent from "@/components/influencer-detail-content";
import RequireAuth from "@/components/require-auth";
import {
  fetchInfluencerById,
  toInfluencerProfile,
  type InfluencerProfile,
} from "@/lib/influencers";
import { getInfluencerById } from "@/lib/mock-influencers";

function resolveMockProfile(id: string): InfluencerProfile | null {
  const mock = getInfluencerById(id);
  if (!mock) return null;

  return {
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
  };
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
        influencer = toInfluencerProfile(apiInfluencer);
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
