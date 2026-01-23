import { Commitment, Connection, ConnectionConfig } from '@solana/web3.js';
export declare const createSolanaConnection: (rpcUrl: string, commitmentOrConfig?: Commitment | ConnectionConfig) => Connection;
