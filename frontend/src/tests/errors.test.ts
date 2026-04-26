import { describe, it, expect } from "vitest";
import { parseWalletError, parseError } from "../lib/errors";

describe("Bountix Error Parser — parseWalletError", () => {
  it("identifies wallet not found error", () => {
    expect(parseWalletError(new Error("wallet not found"))).toMatchObject({
      type: "WALLET_NOT_FOUND",
    });
  });

  it("identifies wallet not installed error", () => {
    expect(parseWalletError(new Error("Extension not installed"))).toMatchObject({
      type: "WALLET_NOT_FOUND",
    });
  });

  it("identifies user rejected error", () => {
    expect(
      parseWalletError(new Error("user rejected the request"))
    ).toMatchObject({ type: "USER_REJECTED" });
  });

  it("identifies user declined error", () => {
    expect(parseWalletError(new Error("Transaction declined"))).toMatchObject({
      type: "USER_REJECTED",
    });
  });

  it("identifies insufficient balance error", () => {
    expect(
      parseWalletError(new Error("insufficient balance for fee"))
    ).toMatchObject({ type: "INSUFFICIENT_BALANCE" });
  });

  it("returns UNKNOWN for unrecognized errors", () => {
    expect(parseWalletError(new Error("some random error"))).toMatchObject({
      type: "UNKNOWN",
    });
  });
});

describe("Bountix Error Parser — parseError (extended)", () => {
  it("identifies network errors", () => {
    expect(parseError(new Error("RPC call timed out"))).toMatchObject({
      type: "NETWORK",
    });
  });

  it("identifies configuration errors", () => {
    expect(parseError(new Error("Contract not configured"))).toMatchObject({
      type: "CONFIGURATION",
    });
  });

  it("falls back to UNKNOWN for truly unknown errors", () => {
    expect(parseError(new Error("¯\\_(ツ)_/¯"))).toMatchObject({
      type: "UNKNOWN",
    });
  });

  it("handles non-Error inputs gracefully", () => {
    expect(parseError("plain string error")).toMatchObject({ type: "UNKNOWN" });
    expect(parseError({ message: "object error" })).toMatchObject({
      type: "UNKNOWN",
    });
    expect(parseError(null)).toMatchObject({ type: "UNKNOWN" });
  });
});
