import { Suspense } from "react";
import RequireAuth from "@/components/require-auth";
import DepositContent from "@/components/deposit-content";

export default function DepositPage() {
  return (
    <RequireAuth returnTo="/wallet/deposit">
      <Suspense>
        <DepositContent />
      </Suspense>
    </RequireAuth>
  );
}
