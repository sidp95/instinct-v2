'use client'
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var _tslib = require('../../../../_virtual/_tslib.cjs');
var web3_js = require('@solana/web3.js');
var bs58 = require('bs58');
var logger = require('../../../utils/logger.cjs');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var bs58__default = /*#__PURE__*/_interopDefaultLegacy(bs58);

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
    const connect = (args) => _tslib.__awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const autoConnectedAccounts = wallet.accounts;
        logger.logger.logVerboseTroubleshootingMessage('[SolanaWalletStandardConnector] - connect', {
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
            logger.logger.error('connect - Not implemented');
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
    const disconnect = () => _tslib.__awaiter(void 0, void 0, void 0, function* () {
        var _b;
        const disconnectMethod = (_b = features['standard:disconnect']) === null || _b === void 0 ? void 0 : _b.disconnect;
        if (!disconnectMethod) {
            logger.logger.debug('disconnect - Not implemented');
            return;
        }
        yield disconnectMethod();
    });
    const getCurrentAccount = () => _tslib.__awaiter(void 0, void 0, void 0, function* () {
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
    const signTransaction = (transaction) => _tslib.__awaiter(void 0, void 0, void 0, function* () {
        const signedTransactions = yield signAllTransactions([transaction]);
        return signedTransactions[0];
    });
    const signAllTransactions = (transactions) => _tslib.__awaiter(void 0, void 0, void 0, function* () {
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
                return web3_js.VersionedTransaction.deserialize(signedTransaction);
            }
            return web3_js.Transaction.from(signedTransaction);
        });
        return signedTransactions;
    });
    const signAndSendTransaction = (transaction) => _tslib.__awaiter(void 0, void 0, void 0, function* () {
        var _c;
        const signAndSendTransactionMethod = (_c = features['solana:signAndSendTransaction']) === null || _c === void 0 ? void 0 : _c.signAndSendTransaction;
        if (!signAndSendTransactionMethod) {
            logger.logger.error('signAndSendTransaction - Not implemented');
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
        return { signature: bs58__default["default"].encode(signature) };
    });
    const signMessage = (message) => _tslib.__awaiter(void 0, void 0, void 0, function* () {
        var _d;
        const signMessageMethod = (_d = features['solana:signMessage']) === null || _d === void 0 ? void 0 : _d.signMessage;
        if (!signMessageMethod) {
            logger.logger.error('signMessage - Not implemented');
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
            logger.logger.error('on - Not implemented');
            return;
        }
        logger.logger.debug(`[SolanaWalletStandardConnector] - on: ${event}`);
        if (event !== 'accountChanged') {
            logger.logger.debug(`on - Not implemented for event: ${event}`);
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
            logger.logger.error('eventNames - Not implemented');
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
            logger.logger.error('listenerCount - Not implemented');
            return 0;
        },
        listeners: () => {
            logger.logger.error('listeners - Not implemented');
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
            return new web3_js.PublicKey(wallet.accounts[0].publicKey);
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

exports.createSolanaSignerFromWalletStandard = createSolanaSignerFromWalletStandard;
