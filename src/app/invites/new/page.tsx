import { Suspense } from "react";
import RequireAuth from "@/components/require-auth";
import SendInviteContent from "@/components/send-invite-content";

export default function NewInvitePage() {
  return (
    <RequireAuth returnTo="/invites/new">
      <Suspense>
        <SendInviteContent />
      </Suspense>
    </RequireAuth>
  );
}
