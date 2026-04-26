import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import BountyCard from "../components/BountyCard";
import type { BountyItem } from "../lib/bountyContract";

const baseBounty: BountyItem = {
  id: 1,
  title: "Write a tweet about Bountix",
  description: "Tag @StellarOrg and share your experience",
  rewardStroops: "200000000",
  rewardXlm: 20,
  status: "OPEN",
  poster: "GABC1234567890ABCDEFGHIJ",
  hunter: null,
  proofLink: "",
  deadline: Math.floor(Date.now() / 1000) + 86400 * 7,
  createdAt: Math.floor(Date.now() / 1000),
};

describe("BountyCard", () => {
  const noopAsync = vi.fn(async () => {});
  const noopBounty = vi.fn();

  function renderCard(overrides?: Partial<BountyItem>, pk: string | null = null) {
    return render(
      <BountyCard
        bounty={{ ...baseBounty, ...overrides }}
        publicKey={pk}
        busy={false}
        onClaim={noopAsync}
        onOpenProof={noopBounty}
        onApprove={noopAsync}
        onReject={noopAsync}
        onCancel={noopAsync}
      />
    );
  }

  it("renders bounty title and reward", () => {
    renderCard();
    expect(screen.getByText("Write a tweet about Bountix")).toBeInTheDocument();
    expect(screen.getByText(/20\.0 XLM/)).toBeInTheDocument();
  });

  it("renders the Open status badge", () => {
    renderCard();
    expect(screen.getByText("Open")).toBeInTheDocument();
  });

  it("shows Claim button when bounty is open and user is not poster", () => {
    renderCard({}, "GXYZ_DIFFERENT_WALLET_456");
    expect(screen.getByText("Claim Bounty")).toBeInTheDocument();
  });

  it("does NOT show Claim button to the poster", () => {
    renderCard({}, "GABC1234567890ABCDEFGHIJ");
    expect(screen.queryByText("Claim Bounty")).not.toBeInTheDocument();
  });

  it("shows Cancel button to the poster on OPEN bounty", () => {
    renderCard({}, "GABC1234567890ABCDEFGHIJ");
    expect(screen.getByText("Cancel Bounty")).toBeInTheDocument();
  });

  it("calls onClaim when Claim button clicked", () => {
    renderCard({}, "GXYZ_DIFFERENT_WALLET_456");
    fireEvent.click(screen.getByText("Claim Bounty"));
    expect(noopAsync).toHaveBeenCalled();
  });

  it("shows Submit Proof for hunter on CLAIMED bounty", () => {
    renderCard(
      { status: "CLAIMED", hunter: "GHUNTER_WALLET_789" },
      "GHUNTER_WALLET_789"
    );
    expect(screen.getByText("Submit Proof")).toBeInTheDocument();
  });

  it("shows Approve & Reject for poster on SUBMITTED bounty", () => {
    renderCard(
      { status: "SUBMITTED", hunter: "GHUNTER_WALLET_789" },
      "GABC1234567890ABCDEFGHIJ"
    );
    expect(screen.getByText(/Approve/)).toBeInTheDocument();
    expect(screen.getByText(/Reject/)).toBeInTheDocument();
  });
});
