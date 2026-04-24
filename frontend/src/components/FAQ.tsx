import { useState } from "react";
import { useScrollReveal } from "../hooks/useScrollReveal";

const faqs = [
  { q: "What is Stellar Wallet?", a: "Stellar Wallet is a secure, modern Web3 application built on the Stellar blockchain. It allows you to connect your Freighter wallet, view your XLM balance, and send transactions — all through an intuitive interface." },
  { q: "How do I start using Stellar Wallet?", a: 'Install the Freighter browser extension, switch to Testnet, and click "Connect Wallet" on our platform. You can get free test XLM from Stellar Friendbot to start experimenting.' },
  { q: "Is my wallet data secure?", a: "Absolutely. We never store your private keys. All transactions are signed locally through the Freighter wallet extension, ensuring your assets remain under your full control." },
  { q: "What networks are supported?", a: "Currently, we support the Stellar Testnet for development and experimentation. Mainnet support is planned for future releases with full production-grade security." },
  { q: "Can I manage multiple assets?", a: "Yes! While the current version focuses on XLM, our roadmap includes multi-asset support for all Stellar-based tokens, including Soroban smart contract tokens." },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [headerRef, headerVis] = useScrollReveal(0.3);
  const [listRef, listVis] = useScrollReveal(0.1);

  return (
    <section id="faq" className="section-padding" style={{ position: "relative" }}>
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 600, height: 600, background: "radial-gradient(circle, rgba(255,255,255,0.01) 0%, transparent 60%)", pointerEvents: "none" }} />
      <div style={{ maxWidth: 900, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div ref={headerRef} style={{ textAlign: "center", marginBottom: 56, opacity: headerVis ? 1 : 0, transform: headerVis ? "translateY(0)" : "translateY(30px)", transition: "all 0.7s ease" }}>
          <h2 style={{ fontSize: "clamp(28px, 3.5vw, 44px)", fontWeight: 700, letterSpacing: "-1px", marginBottom: 16, color: "#fff" }}>
            Have a Questions? We've Got Your Answers.
          </h2>
          <p style={{ fontSize: 16, color: "#666", maxWidth: 500, margin: "0 auto" }}>Everything you need to know about getting started with Stellar Wallet.</p>
        </div>
        <div ref={listRef} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={i} style={{
                borderRadius: 16, border: "1px solid rgba(255,255,255,0.06)",
                background: isOpen ? "rgba(255,255,255,0.02)" : "transparent",
                transition: "all 0.3s ease", overflow: "hidden",
                opacity: listVis ? 1 : 0, transform: listVis ? "translateY(0)" : "translateY(25px)",
                transitionDelay: listVis ? `${i * 0.1}s` : "0s",
              }}>
                <button onClick={() => setOpenIndex(isOpen ? null : i)} style={{
                  width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "20px 24px", background: "none", border: "none", cursor: "pointer",
                  color: "#fff", fontSize: 16, fontWeight: 600, fontFamily: "var(--font-family-heading)", textAlign: "left",
                }}>
                  {faq.q}
                  <span style={{ fontSize: 20, transition: "transform 0.3s ease", transform: isOpen ? "rotate(45deg)" : "rotate(0)", color: "#999", flexShrink: 0, marginLeft: 16 }}>+</span>
                </button>
                <div style={{ maxHeight: isOpen ? 200 : 0, overflow: "hidden", transition: "max-height 0.4s ease, padding 0.3s ease", padding: isOpen ? "0 24px 20px" : "0 24px 0" }}>
                  <p style={{ fontSize: 14, lineHeight: 1.7, color: "#666" }}>{faq.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
