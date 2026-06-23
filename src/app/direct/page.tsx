import RequireAuth from "@/components/require-auth";
import DirectListContent from "@/components/direct-list-content";

export default function DirectPage() {
  return (
    <RequireAuth returnTo="/direct">
      <DirectListContent />
    </RequireAuth>
  );
}
