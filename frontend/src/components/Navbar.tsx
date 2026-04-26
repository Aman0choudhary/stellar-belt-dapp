import { useState, useEffect } from "react";

interface NavbarProps {
  publicKey: string | null;
  isConnecting: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

export default function Navbar({ publicKey, isConnecting, onConnect, onDisconnect }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const truncateAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const navLinks = [
    { label: "Home", href: "#hero" },
    { label: "Features", href: "#features" },
    { label: "Dashboard", href: "#dashboard" },
    { label: "Pools", href: "#pools" },
    { label: "FAQ", href: "#faq" },
    { label: "My Dashboard", href: "/my-dashboard" },
  ];

  return (
    <nav id="navbar" style={{
      background: scrolled ? "rgba(5,5,5,0.9)" : "rgba(5,5,5,0.4)",
      backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
      borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
      transition: "all 0.3s ease",
    }} className="fixed top-0 left-0 right-0 z-50">
      <div style={{
        maxWidth: 1400,
        margin: "0 auto",
        padding: "0 24px",
        height: 72,
        display: "grid",
        gridTemplateColumns: "1fr auto 1fr",
        alignItems: "center",
      }}>
        {/* Left — Logo */}
        <div style={{ justifySelf: "start" }}>
          <a href="#hero" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "#050505", fontFamily: "var(--font-family-heading)" }}>S</div>
            <span style={{ fontSize: 20, fontWeight: 700, color: "#fff", fontFamily: "var(--font-family-heading)", letterSpacing: "-0.5px" }}>
              Stellar<span style={{ opacity: 0.4 }}>.</span>
            </span>
          </a>
        </div>

        {/* Center — Nav Links */}
        <div className="hidden md:flex" style={{ display: "flex", alignItems: "center", gap: 4, justifySelf: "center" }}>
          {navLinks.map((link) => (
            <a key={link.label} href={link.href} style={{ padding: "8px 18px", fontSize: 14, fontWeight: 500, color: "#999", borderRadius: 8, transition: "all 0.2s ease" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "#999"; e.currentTarget.style.background = "transparent"; }}>
              {link.label}
            </a>
          ))}
        </div>

        {/* Right — Wallet Button (flush right) */}
        <div style={{ justifySelf: "end", display: "flex", alignItems: "center", gap: 12 }}>
          {publicKey ? (
            <>
              <span className="hidden sm:block" style={{ fontSize: 13, fontWeight: 500, color: "var(--color-success)", fontFamily: "monospace", padding: "6px 12px", borderRadius: 50, background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)" }}>
                ● {truncateAddress(publicKey)}
              </span>
              <button onClick={onDisconnect} style={{ padding: "10px 20px", fontSize: 14, fontWeight: 600, color: "#fff", borderRadius: 50, border: "1px solid rgba(255,255,255,0.16)", background: "transparent", cursor: "pointer", transition: "all 0.2s ease", fontFamily: "var(--font-family-body)" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#f87171"; e.currentTarget.style.color = "#f87171"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.16)"; e.currentTarget.style.color = "#fff"; }}>
                Disconnect
              </button>
            </>
          ) : (
            <button onClick={onConnect} disabled={isConnecting} className="btn-primary" style={{ padding: "10px 24px", fontSize: 14, opacity: isConnecting ? 0.6 : 1 }}>
              {isConnecting ? "Connecting..." : "Create Account"}
            </button>
          )}
          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ background: "none", border: "none", color: "#fff", fontSize: 24, cursor: "pointer", padding: 4 }} aria-label="Toggle mobile menu">
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden" style={{ background: "rgba(5,5,5,0.95)", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "16px 24px" }}>
          {navLinks.map((link) => (
            <a key={link.label} href={link.href} onClick={() => setMobileMenuOpen(false)} style={{ display: "block", padding: "12px 0", fontSize: 15, fontWeight: 500, color: "#999", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              {link.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}
