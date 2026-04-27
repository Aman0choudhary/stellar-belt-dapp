import {
  TransactionBuilder,
  BASE_FEE,
  Operation,
  Asset,
  Memo,
  Horizon,
  StrKey,
} from "@stellar/stellar-sdk";
import { parseWalletError } from "./errors";
import { signWithKit, NETWORK_PASSPHRASE } from "./walletsKit";

const horizonUrl =
  import.meta.env.VITE_HORIZON_URL || "https://horizon-testnet.stellar.org";
const server = new Horizon.Server(horizonUrl);
const networkPassphrase = NETWORK_PASSPHRASE;

interface HorizonResultCodes {
  transaction?: string;
  operations?: string[];
}

interface HorizonErrorPayload {
  detail?: string;
  extras?: {
    result_codes?: HorizonResultCodes;
  };
}

interface HorizonErrorLike {
  response?: {
    status?: number;
    data?: HorizonErrorPayload;
  };
}

export interface SendResult {
  success: boolean;
  hash?: string;
  error?: string;
}

function getHorizonError(error: unknown): HorizonErrorLike | null {
  if (typeof error === "object" && error !== null) {
    return error as HorizonErrorLike;
  }

  return null;
}

function isValidStellarAmount(amount: string): boolean {
  // Stellar amounts can have up to 7 decimal places.
  return /^(?:0|[1-9]\d*)(?:\.\d{1,7})?$/.test(amount) && Number(amount) > 0;
}

async function destinationAccountExists(address: string): Promise<boolean> {
  try {
    await server.loadAccount(address);
    return true;
  } catch (error: unknown) {
    const horizonError = getHorizonError(error);
    if (horizonError?.response?.status === 404) {
      return false;
    }
    throw error;
  }
}

function mapTransactionCode(code?: string): string | null {
  switch (code) {
    case "tx_bad_seq":
      return "Transaction sequence is outdated. Refresh and try again.";
    case "tx_insufficient_balance":
      return "Insufficient XLM balance to cover amount and fees.";
    case "tx_bad_auth":
    case "tx_bad_auth_extra":
      return "Transaction authorization failed. Reconnect wallet and sign again.";
    case "tx_too_early":
    case "tx_too_late":
      return "Transaction timing is invalid. Please try again.";
    default:
      return null;
  }
}

function mapOperationCode(code?: string): string | null {
  switch (code) {
    case "op_no_destination":
      return "Destination account does not exist. Send at least 1 XLM to create it, or fund it with Friendbot first.";
    case "op_underfunded":
      return "Your wallet balance is too low for this transfer.";
    case "op_low_reserve":
      return "Not enough reserve balance to perform this operation.";
    case "op_bad_auth":
      return "Operation authorization failed. Confirm the correct wallet is connected.";
    case "op_malformed":
      return "Invalid destination or amount format.";
    default:
      return null;
  }
}

function formatTransactionError(error: unknown): string {
  const walletError = parseWalletError(error);
  if (walletError.type !== "UNKNOWN") {
    return walletError.message;
  }

  const horizonError = getHorizonError(error);
  const payload = horizonError?.response?.data;
  const txCode = payload?.extras?.result_codes?.transaction;
  const opCode = payload?.extras?.result_codes?.operations?.[0];

  const txMessage = mapTransactionCode(txCode);
  if (txMessage) {
    return txMessage;
  }

  const opMessage = mapOperationCode(opCode);
  if (opMessage) {
    return opMessage;
  }

  if (payload?.detail) {
    return payload.detail;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Transaction failed.";
}

export async function sendXLM(
  fromPublicKey: string,
  toAddress: string,
  amount: string,
  memo?: string
): Promise<SendResult> {
  try {
    const destination = toAddress.trim();
    const transferAmount = amount.trim();
    const memoText = memo?.trim();

    if (!StrKey.isValidEd25519PublicKey(destination)) {
      return { success: false, error: "Recipient address is invalid." };
    }

    if (!isValidStellarAmount(transferAmount)) {
      return {
        success: false,
        error:
          "Amount is invalid. Use a positive number with up to 7 decimal places.",
      };
    }

    if (memoText && new TextEncoder().encode(memoText).length > 28) {
      return {
        success: false,
        error: "Memo is too long. Stellar text memos are limited to 28 bytes.",
      };
    }

    const destinationExists = await destinationAccountExists(destination);
    if (!destinationExists && Number(transferAmount) < 1) {
      return {
        success: false,
        error:
          "Destination account is not active yet. Send at least 1 XLM to create it.",
      };
    }

    const account = await server.loadAccount(fromPublicKey);

    const txBuilder = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase,
    })
      .setTimeout(180);

    if (destinationExists) {
      txBuilder.addOperation(
        Operation.payment({
          destination,
          asset: Asset.native(),
          amount: transferAmount,
        })
      );
    } else {
      txBuilder.addOperation(
        Operation.createAccount({
          destination,
          startingBalance: transferAmount,
        })
      );
    }

    if (memoText) txBuilder.addMemo(Memo.text(memoText));

    const tx = txBuilder.build();
    const xdr = tx.toXDR();

    const signedXdrString = await signWithKit(xdr, fromPublicKey);
    if (!signedXdrString) {
      throw new Error("Transaction signing failed.");
    }

    const signedTx = TransactionBuilder.fromXDR(signedXdrString, networkPassphrase);

    try {
      const submitResult = await server.submitTransaction(signedTx);
      return { success: true, hash: submitResult.hash };
    } catch (submitError: unknown) {
      // If we get tx_bad_seq, the account sequence was stale — retry once
      const hErr = getHorizonError(submitError);
      const txCode = hErr?.response?.data?.extras?.result_codes?.transaction;
      if (txCode === "tx_bad_seq") {
        // Rebuild with fresh sequence
        const freshAccount = await server.loadAccount(fromPublicKey);
        const retryBuilder = new TransactionBuilder(freshAccount, {
          fee: BASE_FEE,
          networkPassphrase,
        }).setTimeout(180);

        if (destinationExists) {
          retryBuilder.addOperation(
            Operation.payment({ destination, asset: Asset.native(), amount: transferAmount })
          );
        } else {
          retryBuilder.addOperation(
            Operation.createAccount({ destination, startingBalance: transferAmount })
          );
        }
        if (memoText) retryBuilder.addMemo(Memo.text(memoText));

        const retryTx = retryBuilder.build();
        const retryXdr = retryTx.toXDR();
        const retrySignedXdr = await signWithKit(retryXdr, fromPublicKey);
        const retrySigned = TransactionBuilder.fromXDR(retrySignedXdr, networkPassphrase);
        const retryResult = await server.submitTransaction(retrySigned);
        return { success: true, hash: retryResult.hash };
      }
      throw submitError;
    }
  } catch (error: unknown) {
    return { success: false, error: formatTransactionError(error) };
  }
}
