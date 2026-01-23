import { WalletSchema } from '@dynamic-labs/wallet-book';
import { ISolana } from '@dynamic-labs/solana-core';
export declare const findWalletProviderFromWalletStandard: (injectConfig: NonNullable<WalletSchema['injectedConfig']>[number]) => ISolana | undefined;
