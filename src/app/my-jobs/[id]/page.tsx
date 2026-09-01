import RequireAuth from "@/components/require-auth";
import MyJobRedirect from "@/components/my-job-redirect";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function MyJobDetailPage({ params }: Props) {
  const { id } = await params;
  return (
    <RequireAuth returnTo={`/my-jobs/${id}`}>
      <MyJobRedirect engagementId={id} />
    </RequireAuth>
  );
}
