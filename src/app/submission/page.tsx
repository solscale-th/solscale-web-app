import RequireAuth from "@/components/require-auth";
import SubmissionListContent from "@/components/submission-list-content";

export default function SubmissionPage() {
  return (
    <RequireAuth returnTo="/submission">
      <SubmissionListContent />
    </RequireAuth>
  );
}
