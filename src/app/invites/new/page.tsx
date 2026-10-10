import { Suspense } from "react";
import SendInviteContent from "@/components/send-invite-content";
import InviteReturn from "@/components/invite-return";

export default function NewInvitePage() {
  return (
    <Suspense>
      <InviteReturn>
        <SendInviteContent />
      </InviteReturn>
    </Suspense>
  );
}
