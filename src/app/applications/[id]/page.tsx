import RequireAuth from "@/components/require-auth";
import ApplicationReviewContent from "@/components/application-review-content";

export default async function ApplicationReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <RequireAuth returnTo={`/applications/${id}`}>
      <ApplicationReviewContent applicationId={id} />
    </RequireAuth>
  );
}
