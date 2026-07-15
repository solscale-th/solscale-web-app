import { notFound } from "next/navigation";
import EntrepreneurDetailContent from "@/components/entrepreneur-detail-content";
import {
  getEntrepreneurById,
  getJobsByEntrepreneur,
} from "@/lib/mock-entrepreneurs";

export default async function EntrepreneurDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const entrepreneur = getEntrepreneurById(id);
  if (!entrepreneur) notFound();

  const jobs = getJobsByEntrepreneur(id);

  return <EntrepreneurDetailContent entrepreneur={entrepreneur} jobs={jobs} />;
}
