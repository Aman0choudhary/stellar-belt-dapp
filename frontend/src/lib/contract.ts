import {
  BASE_FEE,
  Contract,
  Networks,
  TransactionBuilder,
  rpc,
  scValToNative,
} from "@stellar/stellar-sdk";
import { parseWalletError } from "./errors";
import { signWithKit } from "./walletsKit";

const rpcUrl =
  import.meta.env.VITE_STELLAR_RPC_URL || "https://soroban-testnet.stellar.org";
const networkPassphrase =
  import.meta.env.VITE_STELLAR_NETWORK_PASSPHRASE || Networks.TESTNET;
const counterContractId = import.meta.env.VITE_COUNTER_CONTRACT_ID;

const server = new rpc.Server(rpcUrl);

export interface IncrementCounterResult {
  count: number;
  hash: string;
}

function getRequiredContractId(): string {
  if (!counterContractId) {
    throw new Error(
      "Counter contract is not configured. Add VITE_COUNTER_CONTRACT_ID in your .env file."
    );
  }

  return counterContractId;
}

function toNumber(value: unknown): number {
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

function getContractErrorMessage(error: unknown): string {
  const walletError = parseWalletError(error);
  if (walletError.type !== "UNKNOWN") {
    return walletError.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Contract request failed.";
}

async function buildPreparedTx(
  publicKey: string,
  methodName: "increment" | "get_count"
) {
  const account = await server.getAccount(publicKey);
  const contract = new Contract(getRequiredContractId());

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase,
  })
    .addOperation(contract.call(methodName))
    .setTimeout(30)
    .build();

  return server.prepareTransaction(tx);
}

export async function readCount(publicKey: string): Promise<number> {
  try {
    const preparedTx = await buildPreparedTx(publicKey, "get_count");
    const simulation = await server.simulateTransaction(preparedTx);

    if (rpc.Api.isSimulationError(simulation)) {
      throw new Error(simulation.error);
    }

    const returnValue = simulation.result?.retval;
    return returnValue ? toNumber(scValToNative(returnValue)) : 0;
  } catch (error: unknown) {
    throw new Error(getContractErrorMessage(error));
  }
}

export async function invokeIncrement(
  publicKey: string
): Promise<IncrementCounterResult> {
  try {
    const preparedTx = await buildPreparedTx(publicKey, "increment");
    const signedXdr = await signWithKit(preparedTx.toXDR(), publicKey);

    const signedTx = TransactionBuilder.fromXDR(signedXdr, networkPassphrase);
    const submitted = await server.sendTransaction(signedTx);

    if (submitted.status === "ERROR") {
      throw new Error(
        "RPC rejected the transaction before submission. Please try again."
      );
    }

    const finalTx = await server.pollTransaction(submitted.hash, {
      attempts: 25,
    });

    if (finalTx.status !== rpc.Api.GetTransactionStatus.SUCCESS) {
      if (finalTx.status === rpc.Api.GetTransactionStatus.FAILED) {
        throw new Error("Counter transaction failed on-chain.");
      }

      throw new Error(
        "Transaction is still pending confirmation. Check the tx hash on Stellar Expert."
      );
    }

    const count = finalTx.returnValue
      ? toNumber(scValToNative(finalTx.returnValue))
      : 0;

    return { count, hash: submitted.hash };
  } catch (error: unknown) {
    throw new Error(getContractErrorMessage(error));
  }
}

export function getCounterContractId(): string | null {
  return counterContractId || null;
}
