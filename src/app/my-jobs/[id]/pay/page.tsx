import RequireAuth from "@/components/require-auth";
import ReleasePaymentContent from "@/components/release-payment-content";

export default async function ReleasePaymentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <RequireAuth returnTo={`/my-jobs/${id}/pay`}>
      <ReleasePaymentContent engagementId={id} />
    </RequireAuth>
  );
}
