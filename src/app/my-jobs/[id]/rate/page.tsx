import RequireAuth from "@/components/require-auth";
import RatingContent from "@/components/rating-content";

export default async function RatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <RequireAuth returnTo={`/my-jobs/${id}/rate`}>
      <RatingContent engagementId={id} />
    </RequireAuth>
  );
}
