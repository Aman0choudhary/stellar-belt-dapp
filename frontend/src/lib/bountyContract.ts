import {
  Account,
  Address,
  BASE_FEE,
  Contract,
  Networks,
  TransactionBuilder,
  nativeToScVal,
  rpc,
  scValToNative,
  type xdr,
} from "@stellar/stellar-sdk";

export type BountyStatus =
  | "OPEN"
  | "CLAIMED"
  | "SUBMITTED"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED"
  | "EXPIRED";

export interface BountyItem {
  id: number;
  poster: string;
  hunter: string | null;
  title: string;
  description: string;
  rewardStroops: string;
  rewardXlm: number;
  proofLink: string;
  deadline: number;
  status: BountyStatus;
  createdAt: number;
}

export interface BountyTxResult {
  hash: string;
}

export interface PostBountyInput {
  title: string;
  description: string;
  rewardXlm: number;
  deadlineDays: number;
}

const RPC_URL =
  import.meta.env.VITE_STELLAR_RPC_URL || "https://soroban-testnet.stellar.org";
const NETWORK_PASSPHRASE =
  import.meta.env.VITE_STELLAR_NETWORK_PASSPHRASE || Networks.TESTNET;
const BOUNTY_CONTRACT_ID = import.meta.env.VITE_BOUNTY_CONTRACT_ID;
const READONLY_SOURCE =
  import.meta.env.VITE_READONLY_SOURCE ||
  "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN";

const server = new rpc.Server(RPC_URL);

let signerFn: ((xdr: string, address?: string) => Promise<string>) | null = null;

export function configureBountySigner(
  fn: (xdr: string, address?: string) => Promise<string>
): void {
  signerFn = fn;
}

function getContractId(): string {
  if (!BOUNTY_CONTRACT_ID) {
    throw new Error(
      "Bounty contract is not configured. Set VITE_BOUNTY_CONTRACT_ID in frontend/.env."
    );
  }

  return BOUNTY_CONTRACT_ID;
}

function getSigner(): (xdr: string, address?: string) => Promise<string> {
  if (!signerFn) {
    throw new Error("Wallet signer is not configured.");
  }

  return signerFn;
}

function toSafeNumber(value: unknown): number {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "bigint") {
    return Number(value);
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

// Safely extract a Stellar StrKey string from a value that may be a
// plain string OR a Stellar SDK Address object (which has .toString())
function toAddressString(value: unknown): string {
  if (typeof value === "string") {
    return value.trim();
  }
  // Stellar SDK Address objects expose toString() → StrKey
  if (value && typeof (value as { toString?: unknown }).toString === "function") {
    return (value as { toString(): string }).toString().trim();
  }
  return String(value ?? "").trim();
}

function toStroopsString(value: unknown): string {
  if (typeof value === "bigint") {
    return value.toString();
  }

  if (typeof value === "number") {
    return Math.trunc(value).toString();
  }

  if (typeof value === "string") {
    return value;
  }

  return "0";
}

function normalizeStatus(value: unknown): BountyStatus {
  // Extract a plain string from whatever scValToNative gives us.
  // Soroban enums can arrive as: "Claimed", {Claimed:[]}, ["Claimed"],
  // or even a Map/class with a toString(). Handle all cases.
  let raw = "";

  if (typeof value === "string") {
    raw = value;
  } else if (Array.isArray(value)) {
    // e.g. ["Claimed"] or ["Claimed", []]
    raw = String(value[0] ?? "");
  } else if (value && typeof value === "object") {
    const keys = Object.keys(value);
    if (keys.length > 0) {
      raw = keys[0];
    } else if (typeof (value as { toString?: unknown }).toString === "function") {
      raw = (value as { toString(): string }).toString();
    }
  }

  const upper = raw.trim().toUpperCase();

  const MAP: Record<string, BountyStatus> = {
    OPEN: "OPEN",
    CLAIMED: "CLAIMED",
    SUBMITTED: "SUBMITTED",
    APPROVED: "APPROVED",
    REJECTED: "REJECTED",
    CANCELLED: "CANCELLED",
    EXPIRED: "EXPIRED",
  };

  const result = MAP[upper];
  if (result) return result;

  // Log unexpected values so we can debug in the browser console
  console.warn("[Bountix] Unknown bounty status value:", value, "→ raw:", raw);
  return "OPEN";
}

function toRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return {};
}

function pick(
  source: Record<string, unknown>,
  ...keys: string[]
): unknown {
  for (const key of keys) {
    if (key in source) {
      return source[key];
    }
  }

  return undefined;
}

function parseBountyNative(raw: unknown): BountyItem | null {
  if (Array.isArray(raw)) {
    const [
      id,
      poster,
      hunter,
      title,
      description,
      reward,
      proofLink,
      deadline,
      status,
      createdAt,
    ] = raw;

    const rewardStroops = toStroopsString(reward);
    return {
      id: toSafeNumber(id),
      poster: toAddressString(poster),
      hunter: hunter ? toAddressString(hunter) : null,
      title: String(title ?? "Untitled bounty"),
      description: String(description ?? ""),
      rewardStroops,
      rewardXlm: Number(rewardStroops) / 10_000_000,
      proofLink: String(proofLink ?? ""),
      deadline: toSafeNumber(deadline),
      status: normalizeStatus(status),
      createdAt: toSafeNumber(createdAt),
    };
  }

  const data = toRecord(raw);
  if (Object.keys(data).length === 0) {
    return null;
  }

  const rewardStroops = toStroopsString(pick(data, "reward", "reward_stroops"));

  return {
    id: toSafeNumber(pick(data, "id")),
    poster: toAddressString(pick(data, "poster")),
    hunter: pick(data, "hunter") ? toAddressString(pick(data, "hunter")) : null,
    title: String(pick(data, "title") ?? "Untitled bounty"),
    description: String(pick(data, "description") ?? ""),
    rewardStroops,
    rewardXlm: Number(rewardStroops) / 10_000_000,
    proofLink: String(pick(data, "proof_link", "proofLink") ?? ""),
    deadline: toSafeNumber(pick(data, "deadline")),
    status: normalizeStatus(pick(data, "status")),
    createdAt: toSafeNumber(pick(data, "created_at", "createdAt")),
  };
}

async function buildAndSend(
  publicKey: string,
  method: string,
  args: xdr.ScVal[]
): Promise<BountyTxResult> {
  const contract = new Contract(getContractId());
  const account = await server.getAccount(publicKey);

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
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

export async function postBounty(
  publicKey: string,
  input: PostBountyInput
): Promise<BountyTxResult> {
  const rewardStroops = BigInt(Math.floor(input.rewardXlm * 10_000_000));

  return buildAndSend(publicKey, "post_bounty", [
    new Address(publicKey).toScVal(),
    nativeToScVal(input.title, { type: "string" }),
    nativeToScVal(input.description, { type: "string" }),
    nativeToScVal(rewardStroops, { type: "i128" }),
    nativeToScVal(input.deadlineDays, { type: "u64" }),
  ]);
}

export async function claimBounty(
  publicKey: string,
  bountyId: number
): Promise<BountyTxResult> {
  return buildAndSend(publicKey, "claim_bounty", [
    new Address(publicKey).toScVal(),
    nativeToScVal(bountyId, { type: "u64" }),
  ]);
}

export async function submitProof(
  publicKey: string,
  bountyId: number,
  proofLink: string
): Promise<BountyTxResult> {
  return buildAndSend(publicKey, "submit_proof", [
    new Address(publicKey).toScVal(),
    nativeToScVal(bountyId, { type: "u64" }),
    nativeToScVal(proofLink, { type: "string" }),
  ]);
}

export async function approveBounty(
  publicKey: string,
  bountyId: number
): Promise<BountyTxResult> {
  return buildAndSend(publicKey, "approve_bounty", [
    new Address(publicKey).toScVal(),
    nativeToScVal(bountyId, { type: "u64" }),
  ]);
}

export async function rejectBounty(
  publicKey: string,
  bountyId: number
): Promise<BountyTxResult> {
  return buildAndSend(publicKey, "reject_bounty", [
    new Address(publicKey).toScVal(),
    nativeToScVal(bountyId, { type: "u64" }),
  ]);
}

export async function cancelBounty(
  publicKey: string,
  bountyId: number
): Promise<BountyTxResult> {
  return buildAndSend(publicKey, "cancel_bounty", [
    new Address(publicKey).toScVal(),
    nativeToScVal(bountyId, { type: "u64" }),
  ]);
}

export async function getAllBounties(
  sourcePublicKey?: string
): Promise<BountyItem[]> {
  const contract = new Contract(getContractId());

  const source = sourcePublicKey || READONLY_SOURCE;
  const account = sourcePublicKey
    ? await server.getAccount(source)
    : new Account(source, "1");

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call("get_all_bounties"))
    .setTimeout(30)
    .build();

  const simulation = await server.simulateTransaction(tx);
  if (rpc.Api.isSimulationError(simulation)) {
    throw new Error(simulation.error);
  }

  const retval = simulation.result?.retval;
  if (!retval) {
    return [];
  }

  const parsed = scValToNative(retval) as unknown;
  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed
    .map(parseBountyNative)
    .filter((item): item is BountyItem => item !== null)
    .sort((a, b) => b.id - a.id);
}

export function getBountyContractId(): string | null {
  return BOUNTY_CONTRACT_ID || null;
}
