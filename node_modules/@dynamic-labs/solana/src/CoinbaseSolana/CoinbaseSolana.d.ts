import { InjectedWalletBase } from '../injected/InjectedWalletBase';
export declare class CoinbaseSolana extends InjectedWalletBase {
    name: string;
    overrideKey: string;
    getSigner<ICoinbaseSolanaSigner>(): Promise<ICoinbaseSolanaSigner | undefined>;
    signMessage(messageToSign: string): Promise<string | undefined>;
}
