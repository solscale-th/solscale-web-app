import RequireAuth from "@/components/require-auth";
import DisputeContent from "@/components/dispute-content";

export default async function DisputePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <RequireAuth returnTo={`/my-jobs/${id}/dispute`}>
      <DisputeContent engagementId={id} />
    </RequireAuth>
  );
}
