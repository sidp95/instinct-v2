'use client'
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var _tslib = require('../../../_virtual/_tslib.cjs');
var web3_js = require('@solana/web3.js');
var solanaCore = require('@dynamic-labs/solana-core');
var walletConnectorCore = require('@dynamic-labs/wallet-connector-core');
var SolProviderHelper = require('../../SolProviderHelper/SolProviderHelper.cjs');
var SignMessageNotSupportedError = require('../../errors/SignMessageNotSupportedError.cjs');
var logger = require('../../utils/logger.cjs');
var SolanaWalletConnectConnector = require('../../walletConnect/SolanaWalletConnectConnector/SolanaWalletConnectConnector.cjs');

class InjectedWalletBase extends solanaCore.SolanaWalletConnector {
    constructor() {
        super(...arguments);
        /**
         * For historical reasons, all wallet connect data for wallets reside in the EVM entry for the wallet in wallet book.
         * Therefore, for Solana wallets that support wallet connect, we must also hold the reference to the wallet book
         * entry that has the wallet connect data for it.
         */
        this.walletConnectWalletBookEntry = undefined;
    }
    getMobileOrInstalledWallet() {
        // can use WC if the wallet has WC setting in wallet book and projectId is set
        const canUseWalletConnect = this.walletConnectWalletBookEntry && this.constructorProps.projectId;
        logger.logger.logVerboseTroubleshootingMessage('[SOL InjectedWalletBase] getMobileOrInstalledWallet', {
            canUseWalletConnect,
            isInstalledOnBrowser: this.isInstalledOnBrowser(),
            projectId: this.constructorProps.projectId,
            walletConnectWalletBookEntry: this.walletConnectWalletBookEntry,
        });
        // if the wallet is installed on the browser or WC is not available, return the injected connector
        if (this.isInstalledOnBrowser() || !canUseWalletConnect) {
            return this;
        }
        // if the wallet is not installed on the browser and WC is available, return the WC connector
        const wcConnector = new SolanaWalletConnectConnector.SolanaWalletConnectConnector(Object.assign(Object.assign({}, this.constructorProps), { metadata: walletConnectorCore.getWalletMetadataFromWalletBook(Object.assign(Object.assign({}, this.metadata), { walletBook: this.walletBook, walletBookWallet: this.walletConnectWalletBookEntry, walletKey: this.key })), overrideKey: this.key, walletName: this.name }));
        wcConnector.init();
        return wcConnector;
    }
    get solProviderHelper() {
        if (!this._solProviderHelper) {
            this._solProviderHelper = new SolProviderHelper.SolProviderHelper(this);
        }
        return this._solProviderHelper;
    }
    findProvider() {
        var _a;
        return (_a = this.solProviderHelper) === null || _a === void 0 ? void 0 : _a.getInstalledProvider();
    }
    setupEventListeners() {
        var _a;
        (_a = this.solProviderHelper) === null || _a === void 0 ? void 0 : _a._setupEventListeners();
    }
    teardownEventListeners() {
        var _a;
        (_a = this.solProviderHelper) === null || _a === void 0 ? void 0 : _a._teardownEventListeners();
    }
    connect() {
        return _tslib.__awaiter(this, void 0, void 0, function* () {
            var _a;
            yield ((_a = this.solProviderHelper) === null || _a === void 0 ? void 0 : _a.connect());
        });
    }
    getSigner() {
        return _tslib.__awaiter(this, void 0, void 0, function* () {
            var _a;
            return (_a = this.solProviderHelper) === null || _a === void 0 ? void 0 : _a.connect();
        });
    }
    createUiTransaction(from) {
        return _tslib.__awaiter(this, void 0, void 0, function* () {
            yield this.validateActiveWallet(from);
            const transaction = new solanaCore.SolanaUiTransaction({
                connection: this.getWalletClient(),
                from,
                onSubmit: (transaction) => _tslib.__awaiter(this, void 0, void 0, function* () {
                    var _a;
                    if (!transaction)
                        return;
                    const signer = yield this.getSigner();
                    if (!signer)
                        throw new Error('Signer not found');
                    const blockhash = yield this.getWalletClient().getLatestBlockhash();
                    if ('version' in transaction) {
                        transaction.message.recentBlockhash =
                            blockhash.blockhash;
                    }
                    else {
                        const userAddress = yield this.getAddress();
                        if (!userAddress)
                            throw new Error('User address not found');
                        transaction.recentBlockhash = blockhash.blockhash;
                        transaction.feePayer =
                            (_a = transaction.feePayer) !== null && _a !== void 0 ? _a : new web3_js.PublicKey(userAddress);
                    }
                    return (yield signer.signAndSendTransaction(transaction)).signature;
                }),
            });
            return transaction;
        });
    }
    isInstalledOnBrowser() {
        var _a;
        return Boolean((_a = this.solProviderHelper) === null || _a === void 0 ? void 0 : _a.isInstalledHelper());
    }
    getAddress() {
        return _tslib.__awaiter(this, void 0, void 0, function* () {
            var _a;
            const didOpenInAppBrowser = this.openInAppBrowserIfRequired();
            if (didOpenInAppBrowser) {
                return;
            }
            return (_a = this.solProviderHelper) === null || _a === void 0 ? void 0 : _a.getAddress();
        });
    }
    signMessage(messageToSign) {
        return _tslib.__awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const walletAddress = yield ((_a = this.solProviderHelper) === null || _a === void 0 ? void 0 : _a.getAddress());
            if (walletAddress && this.isLedgerAddress(walletAddress)) {
                throw new SignMessageNotSupportedError.SignMessageNotSupportedError(this.name);
            }
            return (_b = this.solProviderHelper) === null || _b === void 0 ? void 0 : _b.signMessage(messageToSign);
        });
    }
    getConnectedAccounts() {
        return _tslib.__awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            return (_b = (_a = this.solProviderHelper) === null || _a === void 0 ? void 0 : _a.getConnectedAccounts()) !== null && _b !== void 0 ? _b : [];
        });
    }
}

exports.InjectedWalletBase = InjectedWalletBase;
