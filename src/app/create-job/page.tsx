import RequireAuth from "@/components/require-auth";
import CreateJobContent from "@/components/create-job-content";

export default function CreateJobPage() {
  return (
    <RequireAuth returnTo="/create-job">
      <CreateJobContent />
    </RequireAuth>
  );
}
