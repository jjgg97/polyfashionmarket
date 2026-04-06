import {
  clusterApiUrl,
  Connection,
  Cluster,
} from '@solana/web3.js';

// Read from env or fall back to devnet
const network = (process.env.NEXT_PUBLIC_SOLANA_NETWORK as Cluster) || 'devnet';
const rpcEndpoint =
  process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT || clusterApiUrl(network);

/**
 * Singleton Solana connection.
 * Uses commitment "confirmed" for a good balance of speed and safety.
 */
export const connection = new Connection(rpcEndpoint, 'confirmed');

export const SOLANA_NETWORK = network;
export const SOLANA_EXPLORER_BASE =
  network === 'mainnet-beta'
    ? 'https://solscan.io/tx'
    : `https://solscan.io/tx?cluster=${network}`;

export function getTxUrl(signature: string): string {
  return `${SOLANA_EXPLORER_BASE}/${signature}`;
}
