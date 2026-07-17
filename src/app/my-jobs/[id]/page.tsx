import RequireAuth from "@/components/require-auth";
import MyJobDetailContent from "@/components/my-job-detail-content";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function MyJobDetailPage({ params }: Props) {
  const { id } = await params;
  return (
    <RequireAuth returnTo={`/my-jobs/${id}`}>
      <MyJobDetailContent key={id} engagementId={id} />
    </RequireAuth>
  );
}
