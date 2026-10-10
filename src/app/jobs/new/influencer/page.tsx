import RequireAuth from "@/components/require-auth";
import PickInfluencerContent from "@/components/pick-influencer-content";

export default function PickInfluencerPage() {
  return (
    <RequireAuth returnTo="/jobs/new/influencer">
      <PickInfluencerContent />
    </RequireAuth>
  );
}
