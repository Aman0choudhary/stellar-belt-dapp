import {
  isConnected,
  isAllowed,
  setAllowed,
  getNetworkDetails,
  signTransaction,
} from "@stellar/freighter-api";

// Freighter types
interface FreighterWindow {
  freighter?: {
    publicKey?: () => Promise<string>;
    getPublicKey?: () => Promise<string>;
  };
}

declare let window: FreighterWindow;

async function getFreighterPublicKey(): Promise<string> {
  // Try using window.freighter first
  if (window.freighter) {
    if (window.freighter.getPublicKey) {
      return await window.freighter.getPublicKey();
    }
    if (window.freighter.publicKey) {
      return await window.freighter.publicKey();
    }
  }
  throw new Error("Could not get public key from Freighter");
}

export async function connectFreighter(): Promise<string> {
  const connected = await isConnected();
  if (!connected) throw new Error("Freighter wallet not installed.");

  const allowed = await isAllowed();
  if (!allowed) await setAllowed();

  const pubKey = await getFreighterPublicKey();
  const networkDetails = await getNetworkDetails();

  if (networkDetails.network !== "testnet") throw new Error("Please switch Freighter to Testnet.");
  
  return pubKey;
}

export async function disconnectFreighter(): Promise<void> {
  // Freighter has no disconnect API — clear local state only
}

export { signTransaction };
