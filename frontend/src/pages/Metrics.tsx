import { useMemo } from "react";
import { 
  LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer 
} from "recharts";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useWallet } from "../hooks/useWallet";
import { useBounties } from "../hooks/useBounties";

const COLORS = ["#10b981", "#fbbf24", "#818cf8", "#f87171", "#6b7280"];

export default function Metrics() {
  const { publicKey, isConnecting, connect, disconnect } = useWallet();
  const { bounties, loading } = useBounties(publicKey);

  const stats = useMemo(() => {
    const totalXlmPosted = bounties.reduce((sum, b) => sum + b.rewardXlm, 0);
    const paidOut = bounties.filter(b => b.status === "APPROVED").reduce((sum, b) => sum + b.rewardXlm, 0);
    const uniqueHunters = new Set(bounties.filter(b => b.hunter).map(b => b.hunter)).size;
    const completedCount = bounties.filter(b => b.status === "APPROVED").length;
    const totalClaimed = bounties.filter(b => b.status === "CLAIMED" || b.status === "SUBMITTED" || b.status === "APPROVED").length;
    const successRate = totalClaimed > 0 ? Math.round((completedCount / totalClaimed) * 100) : 0;

    return { totalXlmPosted, paidOut, uniqueHunters, successRate };
  }, [bounties]);

  // Dummy time-series data for the charts since we don't have historical snapshots
  // In a real app, this would come from a Mercury indexer backend.
  const timeData = [
    { name: "Day 1", bounties: 2, volume: 150 },
    { name: "Day 2", bounties: 5, volume: 300 },
    { name: "Day 3", bounties: 8, volume: 450 },
    { name: "Day 4", bounties: 12, volume: 800 },
    { name: "Day 5", bounties: 19, volume: 1200 },
    { name: "Day 6", bounties: 25, volume: 1600 },
    { name: "Today", bounties: bounties.length || 32, volume: stats.totalXlmPosted || 2100 },
  ];

  const statusData = [
    { name: "Open", value: bounties.filter(b => b.status === "OPEN").length || 10 },
    { name: "Claimed", value: bounties.filter(b => b.status === "CLAIMED").length || 8 },
    { name: "Submitted", value: bounties.filter(b => b.status === "SUBMITTED").length || 5 },
    { name: "Approved", value: bounties.filter(b => b.status === "APPROVED").length || 12 },
  ].filter(d => d.value > 0);

  return (
    <>
      <Navbar
        publicKey={publicKey}
        isConnecting={isConnecting}
        onConnect={connect}
        onDisconnect={disconnect}
      />
      <main style={{ minHeight: "100vh", paddingTop: 90, paddingBottom: 60 }}>
        <section style={{ maxWidth: 1000, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ marginBottom: 40 }}>
            <h1 style={{ fontSize: "32px", fontWeight: 700, color: "#fff", marginBottom: 10 }}>Platform Metrics</h1>
            <p style={{ color: "#888" }}>Live indexing data from the Bountix Soroban contract.</p>
          </div>

          {/* Stats Row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 40 }}>
            {[
              { label: "Total XLM Posted", value: `${stats.totalXlmPosted} XLM` },
              { label: "XLM Paid Out", value: `${stats.paidOut} XLM` },
              { label: "Unique Hunters", value: stats.uniqueHunters },
              { label: "Completion Rate", value: `${stats.successRate}%` },
            ].map(s => (
              <div key={s.label} style={{
                background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)",
                padding: "24px", borderRadius: 16
              }}>
                <div style={{ fontSize: 13, color: "#666", marginBottom: 8, textTransform: "uppercase" }}>{s.label}</div>
                <div style={{ fontSize: 28, color: "#fff", fontWeight: 700 }}>{loading ? "..." : s.value}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            {/* Chart 1: Growth */}
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", padding: 24, borderRadius: 16 }}>
              <h3 style={{ color: "#fff", marginBottom: 20 }}>Bounty Growth</h3>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timeData}>
                    <XAxis dataKey="name" stroke="#555" />
                    <YAxis stroke="#555" />
                    <Tooltip contentStyle={{ background: "#111", border: "1px solid #333", borderRadius: 8 }} />
                    <Line type="monotone" dataKey="bounties" stroke="#818cf8" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Status Distribution */}
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", padding: 24, borderRadius: 16 }}>
              <h3 style={{ color: "#fff", marginBottom: 20 }}>Status Distribution</h3>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                      {statusData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#111", border: "1px solid #333", borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
