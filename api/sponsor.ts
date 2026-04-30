import { TransactionBuilder, Networks, Keypair } from "@stellar/stellar-sdk";

export const config = {
  runtime: "edge",
};

export default async function handler(req: Request) {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const { innerTxXDR } = await req.json();

    // SPONSOR_SECRET is set in Vercel environment variables securely
    const sponsorSecret = process.env.SPONSOR_SECRET;
    if (!sponsorSecret) {
      return new Response("Sponsor secret not configured", { status: 500 });
    }

    const sponsorKeypair = Keypair.fromSecret(sponsorSecret);
    const innerTx = TransactionBuilder.fromXDR(innerTxXDR, Networks.TESTNET);

    const feeBump = TransactionBuilder.buildFeeBumpTransaction(
      sponsorKeypair,
      "200", // fee rate
      innerTx as any,
      Networks.TESTNET
    );
    
    // Sponsor pays the fee
    feeBump.sign(sponsorKeypair);

    // Dynamic import to avoid edge runtime issues with node modules
    const { rpc } = await import("@stellar/stellar-sdk");
    const server = new rpc.Server(process.env.STELLAR_RPC_URL || "https://soroban-testnet.stellar.org");
    
    const result = await server.sendTransaction(feeBump);
    
    return Response.json({ status: "success", hash: result.hash });
  } catch (err: any) {
    return Response.json({ status: "error", message: err.message }, { status: 500 });
  }
}
