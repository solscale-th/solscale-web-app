import RequireAuth from "@/components/require-auth";
import WithdrawContent from "@/components/withdraw-content";

export default function WithdrawPage() {
  return (
    <RequireAuth returnTo="/wallet/withdraw">
      <WithdrawContent />
    </RequireAuth>
  );
}
