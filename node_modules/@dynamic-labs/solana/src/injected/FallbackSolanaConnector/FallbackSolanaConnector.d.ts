import { InjectedWalletBase } from '../InjectedWalletBase';
export declare class FallbackSolanaConnector extends InjectedWalletBase {
    name: string;
    overrideKey: string;
    isAvailable: boolean;
    isInstalledOnBrowser(): boolean;
}
