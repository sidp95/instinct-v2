import { Transaction, VersionedTransaction } from '@solana/web3.js';
import { SolanaWalletConnector, type ISolana } from '@dynamic-labs/solana-core';
import { IPhantomRedirectConnector } from '@dynamic-labs/wallet-connector-core';
import { Method } from '../types';
export declare class PhantomRedirect extends SolanaWalletConnector implements IPhantomRedirectConnector {
    name: string;
    overrideKey: string;
    constructor(props: any);
    getMethod(): 'signMessage' | 'signAndSendTransaction' | undefined;
    /**
     * Sets up a Promise/listener pattern for native mobile redirects.
     * Returns undefined if not on native mobile.
     */
    private setupNativeMobileListener;
    /**
     * Encrypts payload, builds Phantom redirect URL, stores method, and opens URL.
     */
    private openPhantomUrl;
    getAddress(): Promise<string | undefined>;
    connect(): Promise<void>;
    getSession(): Promise<string>;
    signMessage(messageToSign: string): Promise<string | undefined>;
    extractSignature(): {
        signature: string;
        message: string;
    };
    extractTransactions(): Transaction[];
    extractTransaction(): Transaction | VersionedTransaction;
    /**
     * Extracts the signed transaction and sends it to the network.
     * Used for signAndSendTransaction since Phantom redirect doesn't support it natively.
     * @returns The transaction signature
     */
    extractAndSendTransaction(): Promise<string>;
    consumeMethod(): Method | undefined;
    consumeRequestId(): string | undefined;
    getSigner(): Promise<ISolana | undefined>;
    getConnectedAccounts(): Promise<string[]>;
    endSession(): Promise<void>;
    /**
     * Helper method to get inputs from query params and localstorage
     *
     * The second argument is used to read values from the query string
     *   e.g. ['data', 'nonce'] -> params.get('data') and params.get('nonce')
     *
     * The third argument is used to read values from local storage
     *   e.g. ['address', 'message'] -> storage.address.get() and storage.message.get()
     *
     * Throws an error if any of the inputs are unable to be found in their respective locations
     */
    private getInputsOrThrow;
}
