import { useCallback, useEffect, useState } from "react";
import { parseWalletError } from "../lib/errors";
import {
  disconnectWallet,
  getConnectedAddress,
  openWalletModal,
} from "../lib/walletsKit";

export function useWallet() {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [walletId, setWalletId] = useState<string | null>(null);
  const [walletName, setWalletName] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    getConnectedAddress().then((address) => {
      if (!isCancelled && address) {
        setPublicKey(address);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, []);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    try {
      const connection = await openWalletModal();
      setPublicKey(connection.address);
      setWalletId(connection.walletId);
      setWalletName(connection.walletName);
    } catch (error: unknown) {
      setError(parseWalletError(error).message);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    void disconnectWallet().catch(() => undefined);
    setPublicKey(null);
    setWalletId(null);
    setWalletName(null);
    setError(null);
  }, []);

  return {
    publicKey,
    walletId,
    walletName,
    isConnecting,
    error,
    connect,
    disconnect,
  };
}
