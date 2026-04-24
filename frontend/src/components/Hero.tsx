export default function Hero() {
  return (
    <section id="hero" style={{ position: "relative", overflow: "hidden", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", paddingTop: 72 }}>
      {/* Subtle radial glow */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255,255,255,0.03) 0%, transparent 60%)", pointerEvents: "none" }} />

      {/* Grid Pattern */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none" }} />

      {/* Floating Orb */}
      <div className="animate-float" style={{ position: "absolute", top: "15%", right: "10%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.02) 0%, transparent 70%)", filter: "blur(60px)", pointerEvents: "none" }} />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 820, padding: "0 24px" }}>
        {/* Badge */}
        <div className="animate-fade-in-up" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 20px", borderRadius: 50, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", fontSize: 13, fontWeight: 500, color: "#999", marginBottom: 32, fontFamily: "var(--font-family-body)" }}>
          <span style={{ fontSize: 10 }}>✦</span>
          Powered by Stellar Network
        </div>

        {/* Heading */}
        <h1 className="animate-fade-in-up" style={{ fontSize: "clamp(36px, 5.5vw, 72px)", fontWeight: 700, lineHeight: 1.08, letterSpacing: "-2px", marginBottom: 24, animationDelay: "0.15s", opacity: 0, animationFillMode: "forwards", color: "#ffffff" }}>
          Revolutionize Your<br />Transactions With Secure Blockchain Solutions
        </h1>

        {/* Subtitle */}
        <p className="animate-fade-in-up" style={{ fontSize: "clamp(15px, 1.5vw, 17px)", lineHeight: 1.7, color: "#666", maxWidth: 580, margin: "0 auto 40px", animationDelay: "0.3s", opacity: 0, animationFillMode: "forwards" }}>
          Experience the future of digital finance with our secure, fast, and transparent blockchain technology. Send XLM, manage assets, and explore DeFi with confidence.
        </p>

        {/* CTA */}
        <div className="animate-fade-in-up" style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", animationDelay: "0.45s", opacity: 0, animationFillMode: "forwards" }}>
          <a href="#dashboard" className="btn-primary">Get Started</a>
          <a href="#features" className="btn-outline">Explore Features</a>
        </div>

        {/* Stats */}
        <div className="animate-fade-in-up" style={{ display: "flex", gap: 48, justifyContent: "center", marginTop: 72, flexWrap: "wrap", animationDelay: "0.6s", opacity: 0, animationFillMode: "forwards" }}>
          {[
            { value: "$2.5B+", label: "Total Volume" },
            { value: "150K+", label: "Active Users" },
            { value: "99.9%", label: "Uptime" },
            { value: "<3s", label: "Transaction Speed" },
          ].map((stat) => (
            <div key={stat.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#fff", fontFamily: "var(--font-family-heading)" }}>{stat.value}</div>
              <div style={{ fontSize: 13, color: "#555", marginTop: 4 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
