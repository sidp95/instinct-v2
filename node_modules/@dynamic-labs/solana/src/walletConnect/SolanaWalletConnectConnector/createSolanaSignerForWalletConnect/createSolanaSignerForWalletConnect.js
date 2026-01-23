'use client'
import { __awaiter } from '../../../../_virtual/_tslib.js';
import { PublicKey } from '@solana/web3.js';
import { filterDuplicates } from '@dynamic-labs/utils';
import { logger } from '../../../utils/logger.js';

const createSolanaSignerForWalletConnect = ({ walletConnector, }) => {
    const connect = () => __awaiter(void 0, void 0, void 0, function* () {
        const address = walletConnector.getActiveAddress();
        if (!address) {
            return undefined;
        }
        return { address, publicKey: new PublicKey(address) };
    });
    // eslint-disable-next-line arrow-body-style
    const disconnect = () => __awaiter(void 0, void 0, void 0, function* () {
        yield walletConnector.endSession();
    });
    const on = (event, listener) => {
        if (event === 'connect') {
            logger.debug('on - Not implemented for event: connect');
            return signer;
        }
        if (event === 'activeWalletDidChange') {
            walletConnector.listenToActiveAccountChange(listener);
            return signer;
        }
        walletConnector.signClient.on('session_event', (sessionEvent) => {
            // Skip events from other sessions
            if (!walletConnector.session ||
                sessionEvent.topic !== walletConnector.session.topic) {
                return;
            }
            if (sessionEvent.params.event.name === 'accountsChanged' &&
                event === 'accountChanged') {
                const accountsParam = sessionEvent.params.event.data;
                const accounts = filterDuplicates(accountsParam.map((account) => {
                    // Handle potentially CAIP-10 format
                    if (account.startsWith('solana:')) {
                        return account.split(':')[2];
                    }
                    return account;
                }));
                listener(accounts[0]);
                return;
            }
            if (sessionEvent.params.event.name === 'disconnected' &&
                event === 'disconnect') {
                listener('');
                return;
            }
        });
        return signer;
    };
    const signMessage = (messageArrayBuffer) => __awaiter(void 0, void 0, void 0, function* () {
        const signature = yield walletConnector.signEncodedMessage(messageArrayBuffer);
        return { signature };
    });
    const signAllTransactions = (transactions) => __awaiter(void 0, void 0, void 0, function* () { return walletConnector.signAllTransactions(transactions); });
    const signAndSendTransaction = (transaction, options) => __awaiter(void 0, void 0, void 0, function* () {
        const signature = yield walletConnector.signAndSendTransaction(transaction, options);
        return { signature };
    });
    const signTransaction = (transaction) => __awaiter(void 0, void 0, void 0, function* () { return walletConnector.signTransaction(transaction); });
    const signer = {
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
        get isConnected() {
            return Boolean(walletConnector.getActiveAddress());
        },
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
            const address = walletConnector.getActiveAddress();
            return address ? new PublicKey(address) : undefined;
        },
        removeAllListeners: () => {
            throw new Error('removeAllListeners - Not implemented');
        },
        removeListener: () => {
            throw new Error('removeListener - Not implemented');
        },
        signAllTransactions,
        signAndSendTransaction,
        signMessage,
        signTransaction,
    };
    return signer;
};

export { createSolanaSignerForWalletConnect };
