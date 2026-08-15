import JobDetailGate from "@/components/job-detail-gate";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <JobDetailGate jobId={id} />;
}
