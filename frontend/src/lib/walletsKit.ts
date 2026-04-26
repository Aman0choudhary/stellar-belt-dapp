import {
  Networks as WalletKitNetworks,
  StellarWalletsKit,
} from "@creit.tech/stellar-wallets-kit";
import { defaultModules } from "@creit.tech/stellar-wallets-kit/modules/utils";

export interface WalletConnection {
  address: string;
  walletId: string;
  walletName: string;
}

const SUPPORTED_WALLET_IDS = new Set(["freighter", "xbull", "lobstr"]);
const networkPassphrase =
  import.meta.env.VITE_STELLAR_NETWORK_PASSPHRASE || WalletKitNetworks.TESTNET;

let isKitInitialized = false;

function toWalletKitNetwork(passphrase: string): string {
  switch (passphrase) {
    case WalletKitNetworks.PUBLIC:
      return WalletKitNetworks.PUBLIC;
    case WalletKitNetworks.FUTURENET:
      return WalletKitNetworks.FUTURENET;
    case WalletKitNetworks.SANDBOX:
      return WalletKitNetworks.SANDBOX;
    case WalletKitNetworks.STANDALONE:
      return WalletKitNetworks.STANDALONE;
    default:
      return WalletKitNetworks.TESTNET;
  }
}

function ensureKitInitialized(): void {
  if (isKitInitialized) {
    return;
  }

  StellarWalletsKit.init({
    modules: defaultModules({
      filterBy: (module) => SUPPORTED_WALLET_IDS.has(module.productId),
    }),
    network: toWalletKitNetwork(networkPassphrase),
    authModal: {
      showInstallLabel: true,
      hideUnsupportedWallets: false,
    },
  });

  isKitInitialized = true;
}

function getSelectedWalletMeta(): { walletId: string; walletName: string } {
  try {
    const selected = StellarWalletsKit.selectedModule;
    return {
      walletId: selected?.productId || "unknown",
      walletName: selected?.productName || "Unknown Wallet",
    };
  } catch {
    return {
      walletId: "unknown",
      walletName: "Unknown Wallet",
    };
  }
}

export async function openWalletModal(): Promise<WalletConnection> {
  ensureKitInitialized();

  const { address } = await StellarWalletsKit.authModal();
  const { walletId, walletName } = getSelectedWalletMeta();

  return { address, walletId, walletName };
}

export async function getConnectedAddress(): Promise<string | null> {
  ensureKitInitialized();

  try {
    const { address } = await StellarWalletsKit.getAddress();
    return address || null;
  } catch {
    return null;
  }
}

export async function signWithKit(
  xdr: string,
  address?: string
): Promise<string> {
  ensureKitInitialized();

  const { signedTxXdr } = await StellarWalletsKit.signTransaction(xdr, {
    address,
    networkPassphrase,
  });

  if (!signedTxXdr) {
    throw new Error("Wallet did not return a signed transaction.");
  }

  return signedTxXdr;
}

export async function disconnectWallet(): Promise<void> {
  ensureKitInitialized();
  await StellarWalletsKit.disconnect();
}
