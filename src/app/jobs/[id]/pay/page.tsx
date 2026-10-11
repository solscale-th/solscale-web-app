import { Suspense } from "react";
import JobCheckoutContent from "@/components/job-checkout-content";
import RequireAuth from "@/components/require-auth";

export default async function JobPayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense>
      <RequireAuth returnTo={`/jobs/${id}/pay`}>
        <JobCheckoutContent jobId={id} />
      </RequireAuth>
    </Suspense>
  );
}
