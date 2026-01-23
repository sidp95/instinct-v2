import { Commitment, ConfirmOptions, Connection, ConnectionConfig, SendOptions, Signer, Transaction, VersionedTransaction } from '@solana/web3.js';
import { TurnkeyWalletConnectorBase, TurnkeyWalletConnectorNameAndKey } from '@dynamic-labs/embedded-wallet';
import { JwtVerifiedCredential } from '@dynamic-labs/sdk-api-core';
import { IChainRpcProviders, SolanaWallet, SwitchNetworkOps } from '@dynamic-labs/solana-core';
import { GenericNetwork, IUITransaction, WalletUiUtils } from '@dynamic-labs/types';
import { WalletBookSchema } from '@dynamic-labs/wallet-book';
import { Chain, InternalWalletConnector, ISendBalanceWalletConnector } from '@dynamic-labs/wallet-connector-core';
import { TurnkeySolanaSigner } from './TurnkeySolanaSigner';
type SendTransactionOptions = ConfirmOptions & {
    signers?: Signer[];
};
export type TurnkeySolanaConnectorProps = {
    walletUiUtils: WalletUiUtils<InternalWalletConnector>;
    walletBook: WalletBookSchema;
    solNetworks: GenericNetwork[];
    appName?: string;
    chainRpcProviders: IChainRpcProviders;
    connectionConfig?: ConnectionConfig;
};
export declare class TurnkeySolanaWalletConnector extends TurnkeyWalletConnectorBase implements ISendBalanceWalletConnector {
    ChainWallet: typeof SolanaWallet;
    connectedChain: Chain;
    supportedChains: Chain[];
    solNetworks: GenericNetwork[];
    verifiedCredentialChain: string;
    private walletUiUtils;
    private _turnkeyAccount;
    private connectionConfig;
    constructor(nameAndKey: TurnkeyWalletConnectorNameAndKey, props: TurnkeySolanaConnectorProps);
    getRpcUrl(): string;
    getConnection(commitmentOrConfig?: Commitment | ConnectionConfig): Connection;
    getWalletClient(): Connection;
    getNetworkId(): string;
    setNetworkId(networkId: string | null): void;
    getSelectedNetwork(): GenericNetwork | undefined;
    /**
     * @param returnDynamicNetworkId - If true, the dynamic network ID will be returned instead of the network cluster
     * @returns The network cluster (e.g. 'mainnet', 'testnet', 'devnet') or dynamic network (used for switching networks)
     */
    getNetwork(returnDynamicNetworkId?: boolean): Promise<string>;
    switchNetwork({ networkChainId, }: SwitchNetworkOps): Promise<void>;
    getPublicClient(): Promise<Connection | undefined>;
    supportsNetworkSwitching(): boolean;
    setVerifiedCredentials(verifiedCredentials: JwtVerifiedCredential[]): void;
    validateActiveWallet(expectedAddress: string): Promise<void>;
    getAccount(): string | undefined;
    endSession(): Promise<void>;
    private refreshTurnkeyAccount;
    private createTurnkeyAccount;
    private getTurnkeyAccount;
    getSigner(): Promise<TurnkeySolanaSigner | undefined>;
    getBalance(address: string): Promise<string | undefined>;
    signUint8ArrayMessage(encodedMessage: Uint8Array): Promise<Uint8Array>;
    getEnvId: () => any;
    signMessage(messageToSign: string): Promise<string | undefined>;
    internalSignTransaction<T extends Transaction | VersionedTransaction>(transaction: T): Promise<T>;
    signTransaction<T extends Transaction | VersionedTransaction>(transaction: T): Promise<T>;
    createUiTransaction(from: string): Promise<IUITransaction>;
    internalSignAllTransactions<T extends Transaction | VersionedTransaction>(transactions: T[]): Promise<T[]>;
    signAllTransactions<T extends Transaction | VersionedTransaction>(transactions: T[]): Promise<T[]>;
    internalSignAndSendTransaction<T extends Transaction | VersionedTransaction>(transaction: T, options?: SendOptions): Promise<string>;
    signAndSendTransaction<T extends Transaction | VersionedTransaction>(transaction: T, options?: SendOptions): Promise<string>;
    sendTransaction<T extends Transaction | VersionedTransaction>(transaction: T, connection: Connection, options?: SendTransactionOptions): Promise<string>;
    private lamportsToSol;
    private optimizeTransaction;
    getBlockExplorerUrlsForCurrentNetwork(): Promise<string[]>;
    getEnabledNetworks(): GenericNetwork[];
}
export {};
