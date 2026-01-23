'use client'
import { __awaiter } from '../../../../_virtual/_tslib.js';
import { PublicKey, VersionedTransaction, Transaction } from '@solana/web3.js';
import bs58 from 'bs58';
import { logger } from '../../../utils/logger.js';

const isVersionedTransaction = (transaction) => !('instructions' in transaction);
const createSolanaSignerFromWalletStandard = ({ wallet, walletConnector, }) => {
    const features = wallet.features;
    const hasAutoConnectedAccounts = () => {
        var _a, _b, _c;
        return Boolean(((_a = wallet.accounts) === null || _a === void 0 ? void 0 : _a.length) > 0 &&
            ((_b = wallet.accounts[0]) === null || _b === void 0 ? void 0 : _b.publicKey) &&
            ((_c = wallet.accounts[0]) === null || _c === void 0 ? void 0 : _c.address));
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const connect = (args) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const autoConnectedAccounts = wallet.accounts;
        logger.logVerboseTroubleshootingMessage('[SolanaWalletStandardConnector] - connect', {
            autoConnectedAccounts,
        });
        // some wallets like Farcaster will auto inject the account into the wallet object
        // instead of returning it from the connect method
        // so we need to check for that first
        if (hasAutoConnectedAccounts()) {
            return {
                address: autoConnectedAccounts[0].address,
                publicKey: autoConnectedAccounts[0].publicKey,
            };
        }
        const connectMethod = (_a = features['standard:connect']) === null || _a === void 0 ? void 0 : _a.connect;
        if (!connectMethod) {
            logger.error('connect - Not implemented');
            return;
        }
        const result = yield connectMethod({ silent: false });
        if (!result.accounts[0]) {
            return;
        }
        return {
            address: result.accounts[0].address,
            publicKey: result.accounts[0].publicKey,
        };
    });
    const disconnect = () => __awaiter(void 0, void 0, void 0, function* () {
        var _b;
        const disconnectMethod = (_b = features['standard:disconnect']) === null || _b === void 0 ? void 0 : _b.disconnect;
        if (!disconnectMethod) {
            logger.debug('disconnect - Not implemented');
            return;
        }
        yield disconnectMethod();
    });
    const getCurrentAccount = () => __awaiter(void 0, void 0, void 0, function* () {
        const address = yield walletConnector.getAddress();
        const account = wallet.accounts.find((account) => account.address === address);
        if (!account) {
            throw new Error('Account not found');
        }
        return account;
    });
    const getChain = () => {
        var _a;
        const currentNetwork = walletConnector.getSelectedNetwork();
        if (!currentNetwork) {
            throw new Error('Network not found');
        }
        //for SVM netwroks, the cluster name is stored in shortName for now
        const cluster = (_a = currentNetwork.cluster) !== null && _a !== void 0 ? _a : 'mainnet';
        return `solana:${cluster}`;
    };
    const signTransaction = (transaction) => __awaiter(void 0, void 0, void 0, function* () {
        const signedTransactions = yield signAllTransactions([transaction]);
        return signedTransactions[0];
    });
    const signAllTransactions = (transactions) => __awaiter(void 0, void 0, void 0, function* () {
        const signTransactionMethod = features['solana:signTransaction'].signTransaction;
        const account = yield getCurrentAccount();
        const chain = getChain();
        const transactionsInput = transactions.map((transaction) => ({
            account,
            chain,
            transaction: transaction.serialize({
                requireAllSignatures: false,
            }),
        }));
        const signTransactionResult = yield signTransactionMethod(...transactionsInput);
        const signedTransactions = signTransactionResult.map(({ signedTransaction }, index) => {
            const inputTransaction = transactions[index];
            if (isVersionedTransaction(inputTransaction)) {
                return VersionedTransaction.deserialize(signedTransaction);
            }
            return Transaction.from(signedTransaction);
        });
        return signedTransactions;
    });
    const signAndSendTransaction = (transaction) => __awaiter(void 0, void 0, void 0, function* () {
        var _c;
        const signAndSendTransactionMethod = (_c = features['solana:signAndSendTransaction']) === null || _c === void 0 ? void 0 : _c.signAndSendTransaction;
        if (!signAndSendTransactionMethod) {
            logger.error('signAndSendTransaction - Not implemented');
            throw new Error('signAndSendTransaction - Not implemented by wallet');
        }
        const account = yield getCurrentAccount();
        const signedTransactions = yield signAndSendTransactionMethod({
            account,
            chain: getChain(),
            transaction: transaction.serialize({
                requireAllSignatures: false,
            }),
        });
        const [{ signature }] = signedTransactions;
        return { signature: bs58.encode(signature) };
    });
    const signMessage = (message) => __awaiter(void 0, void 0, void 0, function* () {
        var _d;
        const signMessageMethod = (_d = features['solana:signMessage']) === null || _d === void 0 ? void 0 : _d.signMessage;
        if (!signMessageMethod) {
            logger.error('signMessage - Not implemented');
            throw new Error('signMessage - Not implemented by wallet');
        }
        const account = yield getCurrentAccount();
        const messages = yield signMessageMethod({
            account,
            message,
        });
        return { signature: messages[0].signature };
    });
    const on = (event, listener) => {
        var _a;
        const onMethod = (_a = features['standard:events']) === null || _a === void 0 ? void 0 : _a.on;
        if (!onMethod) {
            logger.error('on - Not implemented');
            return;
        }
        logger.debug(`[SolanaWalletStandardConnector] - on: ${event}`);
        if (event !== 'accountChanged') {
            logger.debug(`on - Not implemented for event: ${event}`);
            return;
        }
        const wrappedListener = (prop) => {
            var _a, _b;
            const publicKey = (_b = (_a = prop.accounts) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.publicKey;
            if (publicKey) {
                listener(new TextDecoder().decode(publicKey));
            }
        };
        // 'change' is the only event that is supported by the wallet standard
        return onMethod('change', wrappedListener);
    };
    return {
        addListener: () => {
            throw new Error('addListener - Not implemented');
        },
        connect,
        disconnect,
        emit: () => {
            throw new Error('emit - Not implemented');
        },
        eventNames: () => {
            logger.error('eventNames - Not implemented');
            return [];
        },
        isBackpack: false,
        isBraveWallet: false,
        isConnected: hasAutoConnectedAccounts(),
        isExodus: false,
        isGlow: false,
        isMagicEden: false,
        isPhantom: false,
        isSolflare: false,
        listenerCount: () => {
            logger.error('listenerCount - Not implemented');
            return 0;
        },
        listeners: () => {
            logger.error('listeners - Not implemented');
            return [];
        },
        off: () => {
            throw new Error('off - Not implemented');
        },
        on,
        once: () => {
            throw new Error('once - Not implemented');
        },
        providers: [],
        get publicKey() {
            var _a, _b;
            if (!((_b = (_a = wallet.accounts) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.publicKey)) {
                return undefined;
            }
            return new PublicKey(wallet.accounts[0].publicKey);
        },
        removeAllListeners: () => {
            throw new Error('removeAllListeners - Not implemented');
        },
        removeListener: () => {
            throw new Error('removeListener - Not implemented');
        },
        send: () => {
            throw new Error('send - Not implemented');
        },
        signAllTransactions,
        signAndSendTransaction,
        signMessage,
        signTransaction,
    };
};

export { createSolanaSignerFromWalletStandard };
