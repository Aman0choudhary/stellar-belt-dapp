import { useEffect, useState } from "react";
import { rpc, scValToNative, type xdr } from "@stellar/stellar-sdk";

export interface ContractEventItem {
  id: string;
  ledger: number;
  txHash: string;
  topic: string;
  actor: string;
  value: string;
  ledgerClosedAt: string;
}

const rpcUrl =
  import.meta.env.VITE_STELLAR_RPC_URL || "https://soroban-testnet.stellar.org";
const server = new rpc.Server(rpcUrl);

function scValToText(value: xdr.ScVal): string {
  try {
    const parsed = scValToNative(value);

    if (typeof parsed === "string" || typeof parsed === "number") {
      return String(parsed);
    }

    if (typeof parsed === "bigint") {
      return parsed.toString();
    }

    return JSON.stringify(parsed);
  } catch {
    return value.toXDR("base64");
  }
}

function mapEvent(event: rpc.Api.EventResponse): ContractEventItem {
  const topics = event.topic.map(scValToText);

  return {
    id: event.id,
    ledger: event.ledger,
    txHash: event.txHash,
    topic: topics[0] || "EVENT",
    actor: topics[1] || "",
    value: scValToText(event.value),
    ledgerClosedAt: event.ledgerClosedAt,
  };
}

function mergeEvents(
  previous: ContractEventItem[],
  incoming: ContractEventItem[]
): ContractEventItem[] {
  const merged = [...previous];

  for (const item of incoming) {
    if (!merged.find((existing) => existing.id === item.id)) {
      merged.push(item);
    }
  }

  return merged.slice(-20);
}

export function useContractEvents(contractId: string | null) {
  const [events, setEvents] = useState<ContractEventItem[]>([]);

  useEffect(() => {
    if (!contractId) {
      return;
    }

    let stopped = false;
    let cursor: string | null = null;
    let startLedger = 1;

    const poll = async () => {
      try {
        const request: rpc.Api.GetEventsRequest = cursor
          ? {
              cursor,
              filters: [{ type: "contract", contractIds: [contractId] }],
              limit: 10,
            }
          : {
              startLedger,
              filters: [{ type: "contract", contractIds: [contractId] }],
              limit: 10,
            };

        const response = await server.getEvents(request);
        cursor = response.cursor;

        if (stopped || response.events.length === 0) {
          return;
        }

        setEvents((previous) =>
          mergeEvents(previous, response.events.map(mapEvent))
        );
      } catch {
        // Polling errors are non-fatal; we'll retry on the next tick.
      }
    };

    const initialize = async () => {
      await Promise.resolve();

      if (!stopped) {
        setEvents([]);
      }

      try {
        const latestLedger = await server.getLatestLedger();
        startLedger = Math.max(1, latestLedger.sequence - 2500);
      } catch {
        startLedger = 1;
      }

      await poll();
    };

    void initialize();
    const timer = window.setInterval(() => {
      void poll();
    }, 3000);

    return () => {
      stopped = true;
      window.clearInterval(timer);
    };
  }, [contractId]);

  return contractId ? events : [];
}
