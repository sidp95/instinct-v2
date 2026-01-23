'use client'
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var _tslib = require('../../_virtual/_tslib.cjs');
var utils = require('@dynamic-labs/utils');
var walletBook = require('@dynamic-labs/wallet-book');
var walletConnectorCore = require('@dynamic-labs/wallet-connector-core');
var findWalletProviderFromWalletStandard = require('../injected/walletStandard/findWalletProviderFromWalletStandard/findWalletProviderFromWalletStandard.cjs');
var isSignedMessage = require('../utils/isSignedMessage.cjs');

class SolProviderHelper {
    constructor(connector) {
        this.walletBookWallet = walletBook.findWalletBookWallet(connector.walletBook, connector.key);
        this.connector = connector;
    }
    getInjectedConfig() {
        var _a;
        const injectedConfig = (_a = this.walletBookWallet) === null || _a === void 0 ? void 0 : _a.injectedConfig;
        return injectedConfig === null || injectedConfig === void 0 ? void 0 : injectedConfig.find((c) => c.chain === this.connector.connectedChain.toLowerCase());
    }
    getInstalledProvider() {
        const config = this.getInjectedConfig();
        if (!config || !config.extensionLocators) {
            return undefined;
        }
        return this.installedProviderLookup(config.extensionLocators);
    }
    installedProviders() {
        var _a, _b;
        const config = this.getInjectedConfig();
        if (!config)
            return [];
        const providers = [];
        if (config.windowLocations) {
            for (const windowLocation of config.windowLocations) {
                const foundProviders = utils.getProvidersFromWindow(windowLocation);
                if (foundProviders && foundProviders.length) {
                    providers.push(...foundProviders);
                }
            }
        }
        // We should only include the `window.solana` provider
        // when extensionLocators are provided
        if (config.extensionLocators.length !== 0 && window.solana) {
            if (!window.solana.providers) {
                providers.push(window.solana);
            }
            else {
                window.solana.providers.forEach((provider) => providers.push(provider));
            }
        }
        if (((_b = (_a = config.walletStandardLocators) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0) > 0) {
            const walletStandardProvider = findWalletProviderFromWalletStandard.findWalletProviderFromWalletStandard(config);
            if (walletStandardProvider) {
                providers.push(walletStandardProvider);
            }
        }
        return providers;
    }
    installedProviderLookup(extensionLocators) {
        const allInstalledProviders = this.installedProviders();
        // No need to search through the window.solana providers if the
        // wallet doesn't have extensionLocators
        if (extensionLocators.length === 0) {
            return allInstalledProviders[0];
        }
        return walletConnectorCore.ProviderLookup(allInstalledProviders, extensionLocators);
    }
    findProvider() {
        return this.connector.findProvider();
    }
    isInstalledHelper() {
        return this.findProvider() !== undefined;
    }
    getAddress() {
        return _tslib.__awaiter(this, void 0, void 0, function* () {
            var _a;
            const provider = this.findProvider();
            if (!provider) {
                return undefined;
            }
            yield provider.connect();
            return (_a = provider.publicKey) === null || _a === void 0 ? void 0 : _a.toString();
        });
    }
    connect() {
        return _tslib.__awaiter(this, void 0, void 0, function* () {
            const provider = this.findProvider();
            if (!provider) {
                walletConnectorCore.logger.error('No Solanaprovider found to connect', {
                    connector: this.connector.name,
                });
                return undefined;
            }
            try {
                if (!provider.isConnected) {
                    yield provider.connect();
                }
                return provider;
            }
            catch (err) {
                walletConnectorCore.logger.error('Error connecting to Solanaprovider', {
                    connector: this.connector.name,
                    error: err,
                });
                return undefined;
            }
        });
    }
    signMessage(messageToSign) {
        return _tslib.__awaiter(this, void 0, void 0, function* () {
            const walletAddress = yield this.getAddress();
            if (!walletAddress)
                return undefined;
            const provider = this.findProvider();
            if (!provider)
                return undefined;
            const encodedMessage = new TextEncoder().encode(messageToSign);
            const signedMessage = yield provider.signMessage(encodedMessage, 'utf8');
            if (!signedMessage)
                return undefined;
            return utils.bufferToBase64(isSignedMessage.isSignedMessage(signedMessage) ? signedMessage.signature : signedMessage);
        });
    }
    handleAccountChange(walletConnector, web3Provider, address) {
        return _tslib.__awaiter(this, void 0, void 0, function* () {
            var _a;
            if (!address) {
                yield (web3Provider === null || web3Provider === void 0 ? void 0 : web3Provider.connect());
                if ((_a = web3Provider === null || web3Provider === void 0 ? void 0 : web3Provider.publicKey) === null || _a === void 0 ? void 0 : _a.toString()) {
                    walletConnector.emit('accountChange', {
                        accounts: [web3Provider.publicKey.toString()],
                    });
                }
                return;
            }
            if (address.toString()) {
                walletConnector.emit('accountChange', { accounts: [address.toString()] });
            }
        });
    }
    _setupEventListeners() {
        const provider = this.findProvider();
        if (!provider) {
            walletConnectorCore.logger.warn('Provider not found', {
                connector: this.connector,
            });
            return;
        }
        if (!provider.on) {
            walletConnectorCore.logger.warn('Provider does not support event listeners', {
                connector: this.connector,
                provider,
            });
            return;
        }
        provider.on('accountChanged', (publicKey) => this.handleAccountChange(this.connector, provider, publicKey));
        provider.on('disconnect', () => this.connector.emit('disconnect'));
    }
    _teardownEventListeners() {
        const provider = this.findProvider();
        if (!provider)
            return;
        provider.removeAllListeners();
    }
    getConnectedAccounts() {
        return _tslib.__awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const provider = this.findProvider();
            if (!provider)
                return [];
            let connectionResult;
            try {
                if (!provider.isConnected) {
                    connectionResult = yield provider.connect({ onlyIfTrusted: true });
                }
            }
            catch (e) {
                return [];
            }
            const address = connectionResult === null || connectionResult === void 0 ? void 0 : connectionResult.address;
            if (address) {
                return [address];
            }
            // adding a try/catch to prevent errors from being thrown
            // when the public key getter throws for wallet standard wallets
            try {
                const publicKey = (_a = connectionResult === null || connectionResult === void 0 ? void 0 : connectionResult.publicKey) !== null && _a !== void 0 ? _a : (_b = provider.publicKey) === null || _b === void 0 ? void 0 : _b.toString();
                if (publicKey)
                    return [publicKey === null || publicKey === void 0 ? void 0 : publicKey.toString()];
            }
            catch (e) {
                walletConnectorCore.logger.debug('Error getting public key', {
                    connector: this.connector,
                    error: e,
                });
            }
            return [];
        });
    }
}

exports.SolProviderHelper = SolProviderHelper;
