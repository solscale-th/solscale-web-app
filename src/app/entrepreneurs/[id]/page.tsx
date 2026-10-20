import { notFound } from "next/navigation";
import EntrepreneurDetailContent from "@/components/entrepreneur-detail-content";
import {
  fetchEntrepreneurById,
  toEntrepreneurProfile,
  type EntrepreneurCampaign,
} from "@/lib/entrepreneurs";
import { fetchJobs, type ApiJob } from "@/lib/jobs";

function daysAgoFromIso(iso?: string | null): number {
  if (!iso) return 0;
  const ms = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(ms) || ms < 0) return 0;
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function mapApiJobToCampaign(job: ApiJob): EntrepreneurCampaign {
  return {
    id: String(job.id),
    title: job.title,
    description: job.description,
    platform: job.platform,
    budgetMin: job.budgetMin,
    budgetMax: job.budgetMax,
    createdAt: job.createdAt,
    postedDaysAgo: daysAgoFromIso(job.createdAt),
    promoted: job.promoted,
    location: job.location,
    duration: job.duration,
  };
}

export default async function EntrepreneurDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) notFound();

  const apiEntrepreneur = await fetchEntrepreneurById(numericId).catch(() => null);
  if (!apiEntrepreneur) notFound();

  const allJobs = await fetchJobs().catch(() => [] as ApiJob[]);
  const campaigns = allJobs
    .filter((job) => job.entrepreneurId === apiEntrepreneur.id)
    .filter((job) => job.status.toLowerCase() !== "closed")
    .map(mapApiJobToCampaign);

  return (
    <EntrepreneurDetailContent
      entrepreneur={toEntrepreneurProfile(apiEntrepreneur)}
      campaigns={campaigns}
    />
  );
}
