export type WalletSpendSource = {
  balance?: unknown;
  freezeAmount?: unknown;
  status?: string;
  adminBlocked?: boolean;
  isDeleted?: boolean;
};

export function walletLedgerBalance(wallet: WalletSpendSource | null | undefined) {
  return Math.max(0, Number(wallet?.balance || 0));
}

/** Cash a rider can actually spend: ledger minus freeze. Blocked wallets are ₹0. */
export function walletSpendable(wallet: WalletSpendSource | null | undefined) {
  if (!wallet || wallet.isDeleted || wallet.adminBlocked || wallet.status === "Blocked") {
    return 0;
  }
  return Math.max(0, walletLedgerBalance(wallet) - Number(wallet.freezeAmount || 0));
}

export function isWalletUsable(wallet: WalletSpendSource | null | undefined) {
  return Boolean(
    wallet &&
      !wallet.isDeleted &&
      !wallet.adminBlocked &&
      wallet.status === "Active"
  );
}
