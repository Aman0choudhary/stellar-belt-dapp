import { Horizon } from "@stellar/stellar-sdk";

const server = new Horizon.Server(import.meta.env.VITE_HORIZON_URL);

export async function getXLMBalance(publicKey: string): Promise<string> {
  const account = await server.loadAccount(publicKey);
  const xlmBalance = account.balances.find(
    (b) => b.asset_type === "native"
  );
  return xlmBalance ? xlmBalance.balance : "0";
}
