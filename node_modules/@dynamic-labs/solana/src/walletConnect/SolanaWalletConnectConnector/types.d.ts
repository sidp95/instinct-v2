export type SolanaSessionRequest<T extends AvailableSolanaSessionRequests> = {
    method: T;
    params: SolanaSessionRequestParamMap[T];
};
export type AvailableSolanaSessionRequests = keyof SolanaSessionRequestParamMap;
export type SolanaSessionRequestParamMap = {
    solana_signAllTransactions: {
        transactions: string[];
    };
    solana_signAndSendTransaction: {
        sendOptions?: {
            maxRetries?: number;
            minContextSlot?: number;
            preflightCommitment?: 'processed' | 'confirmed' | 'finalized' | 'recent' | 'single' | 'singleGossip' | 'root' | 'max';
            skipPreflight?: boolean;
        };
        transaction: string;
    };
    solana_signMessage: {
        message: string;
        pubkey: string;
    };
    solana_signTransaction: {
        transaction: string;
    };
};
export type SolanaSessionRequestResultMap = {
    solana_signAllTransactions: {
        transactions: string[];
    };
    solana_signAndSendTransaction: {
        signature: string;
    };
    solana_signMessage: {
        signature: string;
    };
    solana_signTransaction: {
        transaction?: string;
        signature: string;
    };
};
