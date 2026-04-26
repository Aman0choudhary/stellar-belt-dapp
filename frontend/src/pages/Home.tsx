import { useState } from "react";
import { useWallet } from "../hooks/useWallet";
import { useBalance } from "../hooks/useBalance";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Partners from "../components/Partners";
import Features from "../components/Features";
import Dashboard from "../components/Dashboard";
import PoolsTable from "../components/PoolsTable";
import FAQ from "../components/FAQ";
import Footer from "../components/Footer";

export default function Home() {
  const { publicKey, walletName, isConnecting, error, connect, disconnect } = useWallet();
  const { balance, loading } = useBalance(publicKey);
  const [refreshCounter, setRefreshCounter] = useState(0);

  const handleTxSuccess = () => {
    setRefreshCounter((prev) => prev + 1);
  };

  return (
    <>
      <Navbar
        publicKey={publicKey}
        isConnecting={isConnecting}
        onConnect={connect}
        onDisconnect={disconnect}
      />
      <main>
        <Hero />
        <Partners />
        <Features />
        <Dashboard
          publicKey={publicKey}
          walletName={walletName}
          isConnecting={isConnecting}
          error={error}
          balance={balance}
          balanceLoading={loading}
          onConnect={connect}
          onDisconnect={disconnect}
          onTxSuccess={handleTxSuccess}
          refreshCounter={refreshCounter}
        />
        <PoolsTable />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
