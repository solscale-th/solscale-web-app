"use client";

import { useSearchParams } from "next/navigation";
import RequireAuth from "@/components/require-auth";

export default function InviteReturn({ children }: { children: React.ReactNode }) {
  const params = useSearchParams();
  const query = params.toString();
  const returnTo = query ? `/invites/new?${query}` : "/invites/new";

  return <RequireAuth returnTo={returnTo}>{children}</RequireAuth>;
}
