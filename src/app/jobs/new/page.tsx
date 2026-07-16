import RequireAuth from "@/components/require-auth";
import PostJobContent from "@/components/post-job-content";

export default function PostJobPage() {
  return (
    <RequireAuth returnTo="/jobs/new">
      <PostJobContent />
    </RequireAuth>
  );
}
