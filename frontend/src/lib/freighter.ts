import {
  isConnected,
  isAllowed,
  setAllowed,
  getNetworkDetails,
  getAddress,
  signTransaction,
} from "@stellar/freighter-api";

export async function connectFreighter(): Promise<string> {
  const { isConnected: connected, error: connectedError } = await isConnected();
  if (connectedError) throw new Error(connectedError.message ?? "Could not detect Freighter wallet.");
  if (!connected) throw new Error("Freighter wallet not installed.");

  const { isAllowed: allowed, error: allowedError } = await isAllowed();
  if (allowedError) throw new Error(allowedError.message ?? "Could not check wallet permission.");
  if (!allowed) {
    const { isAllowed: granted, error: setAllowedError } = await setAllowed();
    if (setAllowedError) {
      throw new Error(setAllowedError.message ?? "Wallet connection was rejected.");
    }
    if (!granted) throw new Error("Wallet connection was not approved.");
  }

  const { address, error: addressError } = await getAddress();
  if (addressError) throw new Error(addressError.message ?? "Could not get public key from Freighter.");
  if (!address) throw new Error("Could not get public key from Freighter.");

  const { network, error: networkError } = await getNetworkDetails();
  if (networkError) throw new Error(networkError.message ?? "Could not read Freighter network.");

  if (network.toUpperCase() !== "TESTNET") {
    throw new Error("Please switch Freighter to Testnet.");
  }

  return address;
}

export async function disconnectFreighter(): Promise<void> {
  // Freighter has no disconnect API — clear local state only
}

export { signTransaction };
