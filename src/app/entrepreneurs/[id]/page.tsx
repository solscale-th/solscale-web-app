import { notFound } from "next/navigation";
import EntrepreneurDetailContent from "@/components/entrepreneur-detail-content";
import {
  fetchEntrepreneurById,
  toEntrepreneurProfile,
  type EntrepreneurCampaign,
  type EntrepreneurProfile,
} from "@/lib/entrepreneurs";
import { fetchJobs, type ApiJob } from "@/lib/jobs";
import {
  getEntrepreneurById,
  getJobsByEntrepreneur,
} from "@/lib/mock-entrepreneurs";

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

function resolveMockProfile(id: string): {
  entrepreneur: EntrepreneurProfile;
  campaigns: EntrepreneurCampaign[];
} | null {
  const mock = getEntrepreneurById(id);
  if (!mock) return null;

  const jobs = getJobsByEntrepreneur(id);
  return {
    entrepreneur: {
      id: mock.id,
      companyName: mock.name,
      brandDescription: mock.about,
      email: null,
      logoUrl: null,
      avatarFallbackClass: mock.avatarBg,
    },
    campaigns: jobs.map((job) => ({
      id: job.id,
      title: job.title,
      description: job.description,
      platform: job.platform,
      budgetMin: job.budgetMin,
      budgetMax: job.budgetMax,
      postedDaysAgo: job.postedDaysAgo,
      promoted: job.promoted,
      location: job.location,
      duration: job.duration,
      thumbnailBg: job.thumbnailBg,
    })),
  };
}

export default async function EntrepreneurDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numericId = Number(id);

  if (Number.isInteger(numericId) && numericId > 0) {
    try {
      const apiEntrepreneur = await fetchEntrepreneurById(numericId);
      if (apiEntrepreneur) {
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
    } catch {
      // Fall through to mock data when the API is unavailable.
    }
  }

  const mock = resolveMockProfile(id);
  if (!mock) notFound();

  return (
    <EntrepreneurDetailContent
      entrepreneur={mock.entrepreneur}
      campaigns={mock.campaigns}
    />
  );
}
