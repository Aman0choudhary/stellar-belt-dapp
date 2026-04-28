import {
  Address,
  BASE_FEE,
  Contract,
  TransactionBuilder,
  nativeToScVal,
  rpc,
  scValToNative,
  type xdr,
} from "@stellar/stellar-sdk";
import { NETWORK_PASSPHRASE } from "./walletsKit";

const RPC_URL =
  import.meta.env.VITE_STELLAR_RPC_URL || "https://soroban-testnet.stellar.org";
const DISPUTE_CONTRACT_ID = import.meta.env.VITE_DISPUTE_CONTRACT_ID;
const READONLY_SOURCE =
  import.meta.env.VITE_READONLY_SOURCE ||
  "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN";

const server = new rpc.Server(RPC_URL);

let signerFn: ((xdr: string, address?: string) => Promise<string>) | null = null;

export function configureDisputeSigner(
  fn: (xdr: string, address?: string) => Promise<string>
): void {
  signerFn = fn;
}

function getContractId(): string {
  if (!DISPUTE_CONTRACT_ID) {
    throw new Error(
      "Dispute contract is not configured. Set VITE_DISPUTE_CONTRACT_ID in frontend/.env."
    );
  }
  return DISPUTE_CONTRACT_ID;
}

function getSigner(): (xdr: string, address?: string) => Promise<string> {
  if (!signerFn) {
    throw new Error("Wallet signer is not configured.");
  }
  return signerFn;
}

export interface DisputeData {
  bountyId: number;
  hunter: string;
  poster: string;
  votesApprove: number;
  votesReject: number;
  voters: string[];
  resolved: boolean;
  outcome: boolean; // true = hunter wins
}

function toSafeNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "bigint") return Number(value);
  if (typeof value === "string") return Number(value) || 0;
  return 0;
}

function toAddressString(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (value && typeof (value as { toString?: unknown }).toString === "function") {
    return (value as { toString(): string }).toString().trim();
  }
  return String(value ?? "").trim();
}

function parseDisputeNative(raw: unknown): DisputeData | null {
  if (!raw || typeof raw !== "object") return null;

  const data = raw as Record<string, unknown>;

  return {
    bountyId: toSafeNumber(data.bounty_id ?? data.bountyId),
    hunter: toAddressString(data.hunter),
    poster: toAddressString(data.poster),
    votesApprove: toSafeNumber(data.votes_approve ?? data.votesApprove),
    votesReject: toSafeNumber(data.votes_reject ?? data.votesReject),
    voters: Array.isArray(data.voters)
      ? data.voters.map(toAddressString)
      : [],
    resolved: Boolean(data.resolved),
    outcome: Boolean(data.outcome),
  };
}

async function buildAndSend(
  publicKey: string,
  method: string,
  args: xdr.ScVal[]
): Promise<{ hash: string }> {
  const contract = new Contract(getContractId());
  const account = await server.getAccount(publicKey);

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(180)
    .build();

  const prepared = await server.prepareTransaction(tx);
  const signedXdr = await getSigner()(prepared.toXDR(), publicKey);

  const sent = await server.sendTransaction(
    TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE)
  );

  if (sent.status === "ERROR") {
    throw new Error("Transaction rejected by RPC.");
  }

  const finalTx = await server.pollTransaction(sent.hash, { attempts: 25 });
  if (finalTx.status === rpc.Api.GetTransactionStatus.FAILED) {
    throw new Error("Transaction failed on-chain.");
  }

  return { hash: sent.hash };
}

/**
 * Hunter raises a dispute for a bounty.
 */
export async function raiseDispute(
  publicKey: string,
  posterAddress: string,
  bountyId: number
): Promise<{ hash: string }> {
  return buildAndSend(publicKey, "raise_dispute", [
    new Address(publicKey).toScVal(),
    new Address(posterAddress).toScVal(),
    nativeToScVal(bountyId, { type: "u64" }),
  ]);
}

/**
 * Validator votes on a dispute.
 */
export async function voteOnDispute(
  publicKey: string,
  bountyId: number,
  approve: boolean
): Promise<{ hash: string }> {
  return buildAndSend(publicKey, "vote", [
    new Address(publicKey).toScVal(),
    nativeToScVal(bountyId, { type: "u64" }),
    nativeToScVal(approve, { type: "bool" }),
  ]);
}

/**
 * Check if a dispute exists for a bounty (read-only).
 */
export async function hasDispute(bountyId: number): Promise<boolean> {
  try {
    const account = await server.getAccount(READONLY_SOURCE);
    const contract = new Contract(getContractId());

    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        contract.call("has_dispute", nativeToScVal(bountyId, { type: "u64" }))
      )
      .setTimeout(30)
      .build();

    const sim = (await server.simulateTransaction(
      tx
    )) as rpc.Api.SimulateTransactionSuccessResponse;

    if (!sim.result) return false;
    return Boolean(scValToNative(sim.result.retval));
  } catch {
    return false;
  }
}

/**
 * Get dispute details for a bounty (read-only).
 */
export async function getDispute(bountyId: number): Promise<DisputeData | null> {
  try {
    const account = await server.getAccount(READONLY_SOURCE);
    const contract = new Contract(getContractId());

    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        contract.call("get_dispute", nativeToScVal(bountyId, { type: "u64" }))
      )
      .setTimeout(30)
      .build();

    const sim = (await server.simulateTransaction(
      tx
    )) as rpc.Api.SimulateTransactionSuccessResponse;

    if (!sim.result) return null;
    const native = scValToNative(sim.result.retval);
    return parseDisputeNative(native);
  } catch {
    return null;
  }
}
