import { notFound } from "next/navigation";
import InfluencerDetailContent from "@/components/influencer-detail-content";
import RequireAuth from "@/components/require-auth";
import { fetchInfluencerById, toInfluencerProfile } from "@/lib/influencers";

export default async function InfluencerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numericId = Number(id);

  if (!Number.isInteger(numericId) || numericId <= 0) notFound();

  const apiInfluencer = await fetchInfluencerById(numericId);
  if (!apiInfluencer) notFound();

  return (
    <RequireAuth returnTo={`/influencers/${id}`}>
      <InfluencerDetailContent influencer={toInfluencerProfile(apiInfluencer)} />
    </RequireAuth>
  );
}
