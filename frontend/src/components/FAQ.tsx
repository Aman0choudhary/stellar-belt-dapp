import { useState } from "react";
import { useScrollReveal } from "../hooks/useScrollReveal";

const faqs = [
  {
    q: "How do disputes work in Bountix Level 4?",
    a: "If proof is submitted and the poster does not respond, the hunter can raise a dispute. Three validators vote, and a 2-of-3 majority resolves the outcome.",
  },
  {
    q: "What is the BNTX reputation score?",
    a: "BNTX is a non-transferable reputation score. Hunters earn points on approved bounties, which helps signal trust and consistency.",
  },
  {
    q: "Who can vote on disputes?",
    a: "Only pre-approved validator addresses can vote. Validators cannot vote twice on the same dispute, and once resolved the dispute is final.",
  },
  {
    q: "Can a poster cancel a bounty after someone claims it?",
    a: "No. A poster can cancel only while the bounty is still OPEN. Once claimed, they must wait for submission and then approve or reject.",
  },
  {
    q: "Do I need real money to test Bountix?",
    a: "No. Bountix runs on Stellar Testnet. You can fund any test wallet with free XLM from Friendbot.",
  },
  {
    q: "Why did you disable scroll animations?",
    a: "Animations are temporarily disabled to stabilize rendering while we finish UI QA for Level 4 submission. They can be safely re-enabled later.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [headerRef] = useScrollReveal(0.3);
  const [listRef] = useScrollReveal(0.1);

  return (
    <section id="faq" className="section-padding" style={{ position: "relative" }}>
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          width: 600,
          height: 600,
          background: "radial-gradient(circle, rgba(255,255,255,0.01) 0%, transparent 60%)",
          pointerEvents: "none",
        }}
      />
      <div style={{ maxWidth: 900, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div ref={headerRef} className="scroll-reveal scroll-reveal--up" style={{ textAlign: "center", marginBottom: 56 }}>
          <h2
            style={{
              fontSize: "clamp(28px, 3.5vw, 44px)",
              fontWeight: 700,
              letterSpacing: "-1px",
              marginBottom: 16,
              color: "#fff",
            }}
          >
            Level 4 Questions, Answered.
          </h2>
          <p style={{ fontSize: 16, color: "#666", maxWidth: 560, margin: "0 auto" }}>
            Common questions about dispute flow, reputation, and testnet usage in Bountix.
          </p>
        </div>

        <div ref={listRef} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={faq.q}
                className={`scroll-reveal scroll-reveal--delay-${Math.min(i + 1, 5)}`}
                style={{
                  borderRadius: 16,
                  border: "1px solid rgba(255,255,255,0.06)",
                  background: isOpen ? "rgba(255,255,255,0.02)" : "transparent",
                  overflow: "hidden",
                }}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "20px 24px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#fff",
                    fontSize: 16,
                    fontWeight: 600,
                    fontFamily: "var(--font-family-heading)",
                    textAlign: "left",
                  }}
                >
                  {faq.q}
                  <span
                    style={{
                      fontSize: 20,
                      transition: "transform 0.3s ease",
                      transform: isOpen ? "rotate(45deg)" : "rotate(0)",
                      color: "#999",
                      flexShrink: 0,
                      marginLeft: 16,
                    }}
                  >
                    +
                  </span>
                </button>
                <div
                  style={{
                    maxHeight: isOpen ? 220 : 0,
                    overflow: "hidden",
                    transition: "max-height 0.4s ease, padding 0.3s ease",
                    padding: isOpen ? "0 24px 20px" : "0 24px 0",
                  }}
                >
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
