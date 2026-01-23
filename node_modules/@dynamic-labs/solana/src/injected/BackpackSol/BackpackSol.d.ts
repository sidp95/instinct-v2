import { SolanaWalletConnectorOpts } from '@dynamic-labs/solana-core';
import { InjectedWalletBase } from '../InjectedWalletBase';
export declare class BackpackSol extends InjectedWalletBase {
    name: string;
    overrideKey: string;
    constructor(props: SolanaWalletConnectorOpts);
    getSigner<IBackpackSolanaSigner>(): Promise<IBackpackSolanaSigner | undefined>;
    signMessage(messageToSign: string): Promise<string | undefined>;
}
