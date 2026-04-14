import {
  Networks,
  TransactionBuilder,
  BASE_FEE,
  Operation,
  Asset,
  Memo,
  Horizon,
} from "@stellar/stellar-sdk";
import { signTransaction } from "@stellar/freighter-api";

const server = new Horizon.Server(import.meta.env.VITE_HORIZON_URL);

export interface SendResult {
  success: boolean;
  hash?: string;
  error?: string;
}

export async function sendXLM(
  fromPublicKey: string,
  toAddress: string,
  amount: string,
  memo?: string
): Promise<SendResult> {
  try {
    const account = await server.loadAccount(fromPublicKey);

    const txBuilder = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.payment({
          destination: toAddress,
          asset: Asset.native(),
          amount,
        })
      )
      .setTimeout(30);

    if (memo) txBuilder.addMemo(Memo.text(memo));

    const tx = txBuilder.build();
    const xdr = tx.toXDR();

    const result = await signTransaction(xdr, {
      networkPassphrase: Networks.TESTNET,
    });

    const signedXdrString = typeof result === 'string' ? result : result.signedTxXdr;
    const signedTx = TransactionBuilder.fromXDR(signedXdrString, Networks.TESTNET);
    const submitResult = await server.submitTransaction(signedTx);

    return { success: true, hash: submitResult.hash };
  } catch (e: any) {
    return { success: false, error: e.message ?? "Transaction failed" };
  }
}
