import { vi } from "vitest";
import "@testing-library/jest-dom";

vi.mock("@stellar/freighter-api", () => ({
	getAddress: vi.fn().mockResolvedValue(""),
	getPublicKey: vi.fn().mockResolvedValue(""),
	isConnected: vi.fn().mockResolvedValue(false),
	isAllowed: vi.fn().mockResolvedValue(false),
	setAllowed: vi.fn().mockResolvedValue(true),
	requestAccess: vi.fn().mockResolvedValue(true),
	signTransaction: vi.fn().mockResolvedValue(""),
	signAuthEntry: vi.fn().mockResolvedValue(""),
	getNetwork: vi.fn().mockResolvedValue("TESTNET"),
	getNetworkDetails: vi.fn().mockResolvedValue({
		networkPassphrase: "Test SDF Network ; September 2015",
	}),
}));
