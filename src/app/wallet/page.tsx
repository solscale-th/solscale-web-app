import RequireAuth from "@/components/require-auth";
import WalletContent from "@/components/wallet-content";

export default function WalletPage() {
  return (
    <RequireAuth returnTo="/wallet">
      <WalletContent />
    </RequireAuth>
  );
}
