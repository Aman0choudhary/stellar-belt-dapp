export type WalletError =
  | { type: "WALLET_NOT_FOUND"; message: string }
  | { type: "USER_REJECTED"; message: string }
  | { type: "INSUFFICIENT_BALANCE"; message: string }
  | { type: "UNKNOWN"; message: string };

export type AppError =
  | WalletError
  | { type: "CONFIGURATION"; message: string }
  | { type: "NETWORK"; message: string };

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    const withMessage = error as { message?: unknown };
    if (typeof withMessage.message === "string") {
      return withMessage.message;
    }
  }

  return "Unknown wallet error.";
}

export function parseWalletError(error: unknown): WalletError {
  const message = getErrorMessage(error);
  const lower = message.toLowerCase();

  if (
    lower.includes("not installed") ||
    lower.includes("not found") ||
    lower.includes("no wallet") ||
    lower.includes("is not connected")
  ) {
    return {
      type: "WALLET_NOT_FOUND",
      message: "Wallet not found. Install or enable Freighter, xBull, or LOBSTR.",
    };
  }

  if (
    lower.includes("rejected") ||
    lower.includes("declined") ||
    lower.includes("cancel") ||
    lower.includes("closed the modal")
  ) {
    return {
      type: "USER_REJECTED",
      message: "The request was rejected in your wallet.",
    };
  }

  if (lower.includes("insufficient") || lower.includes("underfunded") || lower.includes("balance")) {
    return {
      type: "INSUFFICIENT_BALANCE",
      message: "Insufficient XLM balance to complete this action.",
    };
  }

  return { type: "UNKNOWN", message };
}

export function parseError(error: unknown): AppError {
  const walletError = parseWalletError(error);
  if (walletError.type !== "UNKNOWN") {
    return walletError;
  }

  const message = getErrorMessage(error);
  const lower = message.toLowerCase();

  if (
    lower.includes("not configured") ||
    lower.includes("missing") ||
    lower.includes("env")
  ) {
    return {
      type: "CONFIGURATION",
      message,
    };
  }

  if (
    lower.includes("rpc") ||
    lower.includes("network") ||
    lower.includes("fetch") ||
    lower.includes("timed out") ||
    lower.includes("failed on-chain")
  ) {
    return {
      type: "NETWORK",
      message,
    };
  }

  return { type: "UNKNOWN", message };
}
