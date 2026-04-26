import { describe, it, expect } from "vitest";
import { setCache, getCache, invalidate, invalidatePrefix } from "../lib/cache";

describe("Bountix Cache", () => {
  it("stores and retrieves a bounty list", () => {
    const bounties = [{ id: 1, title: "Test bounty" }];
    setCache("test:bounties", bounties);
    expect(getCache("test:bounties")).toEqual(bounties);
  });

  it("returns null for missing keys", () => {
    expect(getCache("test:nonexistent")).toBeNull();
  });

  it("returns null after TTL expires", async () => {
    setCache("test:expire", "short-lived", 50);
    await new Promise((r) => setTimeout(r, 60));
    expect(getCache("test:expire")).toBeNull();
  });

  it("invalidates cache manually after write", () => {
    setCache("test:balance", "1000");
    invalidate("test:balance");
    expect(getCache("test:balance")).toBeNull();
  });

  it("invalidates by prefix", () => {
    setCache("test:prefix:a", "a");
    setCache("test:prefix:b", "b");
    setCache("test:other", "c");
    invalidatePrefix("test:prefix:");
    expect(getCache("test:prefix:a")).toBeNull();
    expect(getCache("test:prefix:b")).toBeNull();
    expect(getCache("test:other")).toBe("c");
    // Clean up
    invalidate("test:other");
  });
});
