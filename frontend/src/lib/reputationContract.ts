import {
  Address,
  BASE_FEE,
  Contract,
  TransactionBuilder,
  nativeToScVal,
  rpc,
  scValToNative,
} from "@stellar/stellar-sdk";
import { NETWORK_PASSPHRASE } from "./walletsKit";

const RPC_URL =
  import.meta.env.VITE_STELLAR_RPC_URL || "https://soroban-testnet.stellar.org";
const REPUTATION_CONTRACT_ID = import.meta.env.VITE_REPUTATION_CONTRACT_ID;
const READONLY_SOURCE =
  import.meta.env.VITE_READONLY_SOURCE ||
  "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN";

const server = new rpc.Server(RPC_URL);

let signerFn: ((xdr: string, address?: string) => Promise<string>) | null = null;

export function configureReputationSigner(
  fn: (xdr: string, address?: string) => Promise<string>
): void {
  signerFn = fn;
}

function getContractId(): string {
  if (!REPUTATION_CONTRACT_ID) {
    throw new Error(
      "Reputation contract is not configured. Set VITE_REPUTATION_CONTRACT_ID in frontend/.env."
    );
  }
  return REPUTATION_CONTRACT_ID;
}

function getSigner(): (xdr: string, address?: string) => Promise<string> {
  if (!signerFn) {
    throw new Error("Wallet signer is not configured.");
  }
  return signerFn;
}

/**
 * Read a hunter's reputation score (read-only, no wallet needed).
 */
export async function getScore(hunterAddress: string): Promise<number> {
  try {
    const account = await server.getAccount(READONLY_SOURCE);
    const contract = new Contract(getContractId());

    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        contract.call("get_score", new Address(hunterAddress).toScVal())
      )
      .setTimeout(30)
      .build();

    const sim = (await server.simulateTransaction(
      tx
    )) as rpc.Api.SimulateTransactionSuccessResponse;

    if (!sim.result) return 0;

    const native = scValToNative(sim.result.retval);
    return typeof native === "number" ? native : Number(native);
  } catch {
    console.warn("[Bountix] Failed to fetch reputation score for", hunterAddress);
    return 0;
  }
}

/**
 * Award reputation points to a hunter (admin-only call).
 */
export async function awardPoints(
  publicKey: string,
  hunterAddress: string,
  points: number
): Promise<{ hash: string }> {
  const contract = new Contract(getContractId());
  const account = await server.getAccount(publicKey);

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      contract.call(
        "award_points",
        new Address(publicKey).toScVal(),
        new Address(hunterAddress).toScVal(),
        nativeToScVal(points, { type: "u32" })
      )
    )
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
