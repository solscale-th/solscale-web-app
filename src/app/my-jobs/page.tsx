import RequireAuth from "@/components/require-auth";
import MyJobsListContent from "@/components/my-jobs-list-content";

export default function MyJobsPage() {
  return (
    <RequireAuth returnTo="/my-jobs">
      <MyJobsListContent />
    </RequireAuth>
  );
}
