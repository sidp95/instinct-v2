import { ExtensionLocator, ISolana } from '@dynamic-labs/solana-core';
import { ProviderCondition, WalletConnector } from '@dynamic-labs/wallet-connector-core';
import { InjectedWalletBase } from '../injected/InjectedWalletBase';
export declare class SolProviderHelper {
    private walletBookWallet;
    private connector;
    constructor(connector: InjectedWalletBase);
    getInjectedConfig(): {
        chain: string;
        extensionLocators: {
            flag: string;
            value: boolean;
        }[];
        providerInterface?: string | undefined;
        walletStandard?: {
            features: string[];
            name: string;
            providerId?: string | undefined;
        } | undefined;
        walletStandardLocators?: {
            locator: string;
            name: string;
        }[] | undefined;
        windowLocations?: string[] | undefined;
    } | undefined;
    getInstalledProvider(): ISolana | undefined;
    installedProviders(): import("@dynamic-labs/solana-core").ISolanaSigner[];
    installedProviderLookup(extensionLocators: Array<ProviderCondition<ExtensionLocator>>): ISolana | undefined;
    findProvider(): ISolana | undefined;
    isInstalledHelper(): boolean;
    getAddress(): Promise<string | undefined>;
    connect(): Promise<ISolana | undefined>;
    signMessage(messageToSign: string): Promise<string | undefined>;
    handleAccountChange(walletConnector: WalletConnector, web3Provider: ISolana, address: string): Promise<void>;
    _setupEventListeners(): void;
    _teardownEventListeners(): void;
    getConnectedAccounts(): Promise<string[]>;
}
