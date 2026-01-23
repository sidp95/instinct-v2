import { SolanaWalletConnectorOpts } from '@dynamic-labs/solana-core';
import { InjectedWalletBase } from '../injected/InjectedWalletBase';
export declare class Solflare extends InjectedWalletBase {
    name: string;
    overrideKey: string;
    constructor(props: SolanaWalletConnectorOpts);
    getMobileOrInstalledWallet(): InjectedWalletBase;
    getAddress(): Promise<string | undefined>;
    signMessage(messageToSign: string): Promise<string | undefined>;
}
