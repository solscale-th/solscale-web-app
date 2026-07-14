import RequireAuth from "@/components/require-auth";
import ProfileContent from "@/components/profile-content";

export default function ProfilePage() {
  return (
    <RequireAuth returnTo="/profile">
      <ProfileContent />
    </RequireAuth>
  );
}
