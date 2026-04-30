/**
 * Gasless Transaction Fee Bump — Vercel Serverless Function (Reference)
 * 
 * This file documents how Bountix implements gasless transactions
 * via Stellar fee-bump transactions. A sponsor keypair (stored securely
 * in Vercel environment variables) wraps the user's inner transaction
 * so new hunters don't need XLM for gas fees.
 * 
 * To deploy as a live Vercel function:
 * 1. Move this file to `api/sponsor.ts` at the project root
 * 2. Run `npm install @stellar/stellar-sdk` at the root level
 * 3. Set SPONSOR_SECRET and STELLAR_RPC_URL in Vercel env vars
 * 4. Change runtime from "edge" to "nodejs" (SDK requires Node)
 */

// import { TransactionBuilder, Networks, Keypair } from "@stellar/stellar-sdk";
// 
// export default async function handler(req: Request) {
//   if (req.method !== "POST") {
//     return new Response("Method Not Allowed", { status: 405 });
//   }
//
//   const { innerTxXDR } = await req.json();
//   const sponsorKeypair = Keypair.fromSecret(process.env.SPONSOR_SECRET!);
//   const innerTx = TransactionBuilder.fromXDR(innerTxXDR, Networks.TESTNET);
//
//   const feeBump = TransactionBuilder.buildFeeBumpTransaction(
//     sponsorKeypair,
//     "200",
//     innerTx as any,
//     Networks.TESTNET
//   );
//   feeBump.sign(sponsorKeypair);
//
//   const { rpc } = await import("@stellar/stellar-sdk");
//   const server = new rpc.Server(process.env.STELLAR_RPC_URL!);
//   const result = await server.sendTransaction(feeBump);
//   return Response.json({ status: "success", hash: result.hash });
// }

export {};
