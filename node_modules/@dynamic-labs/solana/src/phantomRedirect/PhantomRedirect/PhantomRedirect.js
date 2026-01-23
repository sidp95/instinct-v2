'use client'
import { __awaiter } from '../../../_virtual/_tslib.js';
import { Transaction, VersionedTransaction, PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';
import nacl from 'tweetnacl';
import { SolanaWalletConnector } from '@dynamic-labs/solana-core';
import { PlatformService, StorageService, PHANTOM_REDIRECT_CONNECTION_TYPE_KEY } from '@dynamic-labs/utils';
import { buildUrl } from '../buildUrl/buildUrl.js';
import { clearRedirectUrlForPhantom } from '../clearRedirectUrlForPhantom/clearRedirectUrlForPhantom.js';
import { decryptPayload } from '../decryptPayload/decryptPayload.js';
import { encryptPayload } from '../encryptPayload/encryptPayload.js';
import { storage, clearStorage } from '../storage/storage.js';
import { logger } from '../../utils/logger.js';

class PhantomRedirect extends SolanaWalletConnector {
    constructor(props) {
        super(Object.assign({}, props));
        this.name = 'Phantom';
        this.overrideKey = 'phantom';
    }
    getMethod() {
        throw new Error('Method not implemented.');
    }
    /**
     * Sets up a Promise/listener pattern for native mobile redirects.
     * Returns undefined if not on native mobile.
     */
    setupNativeMobileListener({ eventName, methodName, getResult, shouldIgnoreEvent, }) {
        if (!PlatformService.isNativeMobile) {
            return undefined;
        }
        const requestId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        storage.requestId.set(requestId);
        logger.logVerboseTroubleshootingMessage(`[PhantomRedirect] ${methodName} - setting up listener`, { requestId });
        return new Promise((resolve, reject) => {
            const listener = (event) => {
                // Check requestId mismatch or custom validation
                if (event.requestId !== requestId ||
                    (shouldIgnoreEvent === null || shouldIgnoreEvent === void 0 ? void 0 : shouldIgnoreEvent(event, requestId))) {
                    logger.logVerboseTroubleshootingMessage(`[PhantomRedirect] ${methodName} - ignoring event (requestId mismatch)`, {
                        expectedRequestId: requestId,
                        receivedRequestId: event.requestId,
                    });
                    return;
                }
                logger.logVerboseTroubleshootingMessage(`[PhantomRedirect] ${methodName} - listener received matching event`, { errorCode: event.errorCode, requestId });
                // Clean up this listener
                this.off(eventName, listener);
                if (event.errorCode) {
                    reject(new Error(event.errorMessage || event.errorCode));
                }
                else {
                    resolve(getResult(event));
                }
            };
            this.on(eventName, listener);
        });
    }
    /**
     * Encrypts payload, builds Phantom redirect URL, stores method, and opens URL.
     */
    openPhantomUrl({ payload, sharedSecret, encryptionPublicKey, phantomEndpoint, methodToStore, }) {
        const [nonce, encryptedPayload] = encryptPayload(payload, sharedSecret);
        const params = new URLSearchParams({
            dapp_encryption_public_key: bs58.encode(encryptionPublicKey),
            nonce: bs58.encode(nonce),
            payload: bs58.encode(encryptedPayload),
            redirect_link: clearRedirectUrlForPhantom(PlatformService.getUrl()),
        });
        const url = buildUrl(phantomEndpoint, params);
        storage.method.set(methodToStore);
        logger.debug(`[PhantomRedirect] ${methodToStore} - opening Phantom`, {
            isNativeMobile: PlatformService.isNativeMobile,
        });
        PlatformService.openURL(url);
    }
    getAddress() {
        return __awaiter(this, void 0, void 0, function* () {
            const address = storage.address.get();
            if (address) {
                return address;
            }
            yield this.connect();
            return undefined;
        });
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            // Consume the connection type
            const connectionType = StorageService.getItem(PHANTOM_REDIRECT_CONNECTION_TYPE_KEY);
            if (connectionType) {
                // If this has already been consumed, then we must discard it
                if (connectionType.connectorConsumed) {
                    StorageService.setItem(PHANTOM_REDIRECT_CONNECTION_TYPE_KEY, undefined);
                }
                else {
                    connectionType.connectorConsumed = true;
                    StorageService.setItem(PHANTOM_REDIRECT_CONNECTION_TYPE_KEY, connectionType);
                }
            }
            // Generate a new key pair
            const keyPair = nacl.box.keyPair();
            storage.encryptionPublicKey.set(keyPair.publicKey);
            storage.encryptionSecretKey.set(keyPair.secretKey);
            const { href } = PlatformService.getUrl();
            const isLocalHost = href.includes('localhost') ||
                href.includes('0.0.0.0') ||
                href.includes('127.0.0.1');
            const currentNetwork = this.getSelectedNetwork();
            let cluster = (_a = currentNetwork === null || currentNetwork === void 0 ? void 0 : currentNetwork.cluster) !== null && _a !== void 0 ? _a : 'mainnet-beta';
            // According to https://docs.phantom.com/phantom-deeplinks/provider-methods/connect#query-string-parameters
            // mainnet should be "mainnet-beta"
            if (cluster === 'mainnet') {
                cluster = 'mainnet-beta';
            }
            const params = new URLSearchParams({
                app_url: isLocalHost ? 'https://demo.dynamic.xyz' : href,
                cluster,
                dapp_encryption_public_key: bs58.encode(keyPair.publicKey),
                redirect_link: clearRedirectUrlForPhantom(PlatformService.getUrl()),
            });
            const url = buildUrl('connect', params);
            PlatformService.openURL(url);
        });
    }
    getSession() {
        return __awaiter(this, void 0, void 0, function* () {
            const { data, nonce, phantom_encryption_public_key: phantomEncryptionPublicKey, encryptionSecretKey, } = this.getInputsOrThrow('getSession', ['data', 'nonce', 'phantom_encryption_public_key'], ['encryptionSecretKey']);
            const sharedSecret = nacl.box.before(bs58.decode(phantomEncryptionPublicKey), encryptionSecretKey);
            storage.sharedSecret.set(sharedSecret);
            const connectData = decryptPayload(data, nonce, sharedSecret);
            storage.session.set(connectData.session);
            storage.address.set(new PublicKey(connectData.public_key));
            return connectData.public_key;
        });
    }
    signMessage(messageToSign) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.debug('[PhantomRedirect] signMessage called', {
                messageLength: messageToSign.length,
                messagePreview: messageToSign.substring(0, 200),
            });
            const { session, sharedSecret, encryptionPublicKey } = this.getInputsOrThrow('signMessage', [], ['session', 'sharedSecret', 'encryptionPublicKey']);
            storage.message.set(messageToSign);
            const payload = {
                message: bs58.encode(Buffer.from(messageToSign)),
                session,
            };
            this.openPhantomUrl({
                encryptionPublicKey,
                methodToStore: 'signMessage',
                payload,
                phantomEndpoint: 'signMessage',
                sharedSecret,
            });
            const nativePromise = this.setupNativeMobileListener({
                eventName: 'signMessage',
                getResult: (event) => event.signature,
                methodName: 'signMessage',
                shouldIgnoreEvent: (event) => event.message !== messageToSign,
            });
            if (nativePromise) {
                return nativePromise;
            }
            // On mobile web browsers, Phantom opens in a new tab and redirects back
            // to a fresh page load, losing this Promise/listener context.
            // The signature is handled via PhantomRedirectContext which reads URL
            // params on page load and emits the 'signMessage' event, but there's
            // no way to return it to the original caller. Throwing here prevents
            // the SDK from clearing local storage when no signature is returned.
            logger.debug('[PhantomRedirect] signMessage - mobile web, throwing ignore error');
            throw new Error('ignore');
        });
    }
    extractSignature() {
        var _a;
        logger.debug('[PhantomRedirect] extractSignature called');
        const { data, nonce, sharedSecret, message } = this.getInputsOrThrow('extractSignature', ['data', 'nonce'], ['sharedSecret', 'message']);
        logger.debug('[PhantomRedirect] extractSignature - retrieved from storage', {
            dataPresent: Boolean(data),
            message,
            messageLength: message === null || message === void 0 ? void 0 : message.length,
            noncePresent: Boolean(nonce),
            sharedSecretPresent: Boolean(sharedSecret),
        });
        const signMessageData = decryptPayload(data, nonce, sharedSecret);
        logger.debug('[PhantomRedirect] extractSignature - decrypted payload', {
            signature: signMessageData.signature,
            signatureLength: (_a = signMessageData.signature) === null || _a === void 0 ? void 0 : _a.length,
        });
        return {
            message,
            signature: signMessageData.signature,
        };
    }
    extractTransactions() {
        const { data, nonce, sharedSecret } = this.getInputsOrThrow('extractTransactions', ['data', 'nonce'], ['sharedSecret']);
        const signAllTransactionsData = decryptPayload(data, nonce, sharedSecret);
        const decodedTransactions = signAllTransactionsData.transactions.map((t) => Transaction.from(bs58.decode(t)));
        return decodedTransactions;
    }
    extractTransaction() {
        const { data, nonce, sharedSecret } = this.getInputsOrThrow('extractTransaction', ['data', 'nonce'], ['sharedSecret']);
        const signTransactionData = decryptPayload(data, nonce, sharedSecret);
        const transactionBytes = bs58.decode(signTransactionData.transaction);
        // Try to deserialize as VersionedTransaction first, fall back to legacy Transaction
        // VersionedTransaction has a version prefix byte, legacy transactions don't
        try {
            return VersionedTransaction.deserialize(transactionBytes);
        }
        catch (_a) {
            // If VersionedTransaction fails, try legacy Transaction
            return Transaction.from(transactionBytes);
        }
    }
    /**
     * Extracts the signed transaction and sends it to the network.
     * Used for signAndSendTransaction since Phantom redirect doesn't support it natively.
     * @returns The transaction signature
     */
    extractAndSendTransaction() {
        return __awaiter(this, void 0, void 0, function* () {
            logger.debug('[PhantomRedirect] extractAndSendTransaction called');
            const signedTransaction = this.extractTransaction();
            // Get stored send options if any
            const sendOptionsJson = storage.sendOptions.get();
            storage.sendOptions.remove();
            const sendOptions = sendOptionsJson
                ? JSON.parse(sendOptionsJson)
                : undefined;
            logger.debug('[PhantomRedirect] Sending transaction to network', {
                hasSendOptions: Boolean(sendOptions),
                isVersioned: signedTransaction instanceof VersionedTransaction,
            });
            // Send the signed transaction to the network
            const serialized = signedTransaction.serialize();
            const signature = yield this.getWalletClient().sendRawTransaction(serialized, sendOptions);
            logger.debug('[PhantomRedirect] Transaction sent successfully', {
                signature,
            });
            return signature;
        });
    }
    consumeMethod() {
        const method = storage.method.get();
        storage.method.remove();
        return method;
    }
    consumeRequestId() {
        const requestId = storage.requestId.get();
        storage.requestId.remove();
        return requestId;
    }
    getSigner() {
        return __awaiter(this, void 0, void 0, function* () {
            const address = storage.address.get();
            if (!address) {
                return undefined;
            }
            return {
                addListener: () => {
                    throw new Error('Not implemented');
                },
                connect: () => {
                    throw new Error('Not implemented');
                },
                disconnect: () => {
                    throw new Error('Not implemented');
                },
                emit: () => {
                    throw new Error('Not implemented');
                },
                eventNames: () => {
                    throw new Error('Not implemented');
                },
                isBackpack: false,
                isBraveWallet: false,
                isConnected: true,
                isExodus: false,
                isGlow: false,
                isMagicEden: false,
                isPhantom: true,
                isSolflare: false,
                listenerCount: () => {
                    throw new Error('Not implemented');
                },
                listeners: () => {
                    throw new Error('Not implemented');
                },
                off: () => {
                    throw new Error('Not implemented');
                },
                on: () => {
                    throw new Error('Not implemented');
                },
                once: () => {
                    throw new Error('Not implemented');
                },
                providers: [],
                publicKey: new PublicKey(address),
                removeAllListeners: () => {
                    throw new Error('Not implemented');
                },
                removeListener: () => {
                    throw new Error('Not implemented');
                },
                signAllTransactions: (transactions) => __awaiter(this, void 0, void 0, function* () {
                    const serializedTransactions = transactions.map((t) => bs58.encode(t.serialize({
                        requireAllSignatures: false,
                    })));
                    const { session, sharedSecret, encryptionPublicKey } = this.getInputsOrThrow('signAllTransactions', [], ['session', 'sharedSecret', 'encryptionPublicKey']);
                    const payload = {
                        session,
                        transactions: serializedTransactions,
                    };
                    this.openPhantomUrl({
                        encryptionPublicKey,
                        methodToStore: 'signAllTransactions',
                        payload,
                        phantomEndpoint: 'signAllTransactions',
                        sharedSecret,
                    });
                    const nativePromise = this.setupNativeMobileListener({
                        eventName: 'signAllTransactions',
                        getResult: (event) => (event.transactions || []),
                        methodName: 'signAllTransactions',
                    });
                    if (nativePromise) {
                        return nativePromise;
                    }
                    // On mobile web browsers, return empty array
                    // The signed transactions are handled via PhantomRedirectContext
                    return [];
                }),
                signAndSendTransaction: (transaction, options) => __awaiter(this, void 0, void 0, function* () {
                    // Phantom redirect doesn't support signAndSendTransaction natively,
                    // so we use signTransaction and then send it manually after redirect
                    const serializedTransaction = bs58.encode(transaction.serialize({ requireAllSignatures: false }));
                    const { session, sharedSecret, encryptionPublicKey } = this.getInputsOrThrow('signAndSendTransaction', [], ['session', 'sharedSecret', 'encryptionPublicKey']);
                    const payload = {
                        session,
                        transaction: serializedTransaction,
                    };
                    // Store send options to use when sending the transaction
                    if (options) {
                        storage.sendOptions.set(JSON.stringify(options));
                    }
                    // Use signTransaction endpoint since Phantom redirect doesn't support signAndSendTransaction
                    // but store method as signAndSendTransaction so we know to send after signing
                    this.openPhantomUrl({
                        encryptionPublicKey,
                        methodToStore: 'signAndSendTransaction',
                        payload,
                        phantomEndpoint: 'signTransaction',
                        sharedSecret,
                    });
                    const nativePromise = this.setupNativeMobileListener({
                        eventName: 'signAndSendTransaction',
                        getResult: (event) => ({ signature: event.signature || '' }),
                        methodName: 'signAndSendTransaction',
                    });
                    if (nativePromise) {
                        return nativePromise;
                    }
                    // On mobile web browsers, return empty signature
                    // The actual signature is handled via PhantomRedirectContext
                    return { signature: '' };
                }),
                signMessage: (message) => __awaiter(this, void 0, void 0, function* () {
                    // Delegate to connector's signMessage which properly stores method and sets up listeners
                    const messageString = new TextDecoder().decode(message);
                    const signature = yield this.signMessage(messageString);
                    // Convert signature string to Uint8Array for ISolana interface
                    return {
                        signature: signature ? bs58.decode(signature) : new Uint8Array(0),
                    };
                }),
                signTransaction: (transaction) => __awaiter(this, void 0, void 0, function* () {
                    const serializedTransaction = bs58.encode(transaction.serialize({
                        requireAllSignatures: false,
                    }));
                    const { session, sharedSecret, encryptionPublicKey } = this.getInputsOrThrow('signTransaction', [], ['session', 'sharedSecret', 'encryptionPublicKey']);
                    const payload = {
                        session,
                        transaction: serializedTransaction,
                    };
                    this.openPhantomUrl({
                        encryptionPublicKey,
                        methodToStore: 'signTransaction',
                        payload,
                        phantomEndpoint: 'signTransaction',
                        sharedSecret,
                    });
                    const nativePromise = this.setupNativeMobileListener({
                        eventName: 'signTransaction',
                        getResult: (event) => event.transaction,
                        methodName: 'signTransaction',
                    });
                    if (nativePromise) {
                        return nativePromise;
                    }
                    // On mobile web browsers, return the original transaction
                    // The signed transaction is handled via PhantomRedirectContext
                    return transaction;
                }),
            };
        });
    }
    getConnectedAccounts() {
        return __awaiter(this, void 0, void 0, function* () {
            const address = storage.address.get();
            return address ? [address] : [];
        });
    }
    endSession() {
        return __awaiter(this, void 0, void 0, function* () {
            const address = storage.address.get();
            const session = storage.session.get();
            const sharedSecret = storage.sharedSecret.get();
            const encryptionPublicKey = storage.encryptionPublicKey.get();
            // Clear all local storage in case of any stale state
            clearStorage();
            // if there is no session/encrytion keys, then we don't need to disconnect
            if (!address || !session || !encryptionPublicKey || !sharedSecret)
                return;
            const payload = { session };
            const [nonce, encryptedPayload] = encryptPayload(payload, sharedSecret);
            const params = new URLSearchParams({
                dapp_encryption_public_key: bs58.encode(encryptionPublicKey),
                nonce: bs58.encode(nonce),
                payload: bs58.encode(encryptedPayload),
                redirect_link: clearRedirectUrlForPhantom(PlatformService.getUrl()),
            });
            const url = buildUrl('disconnect', params);
            PlatformService.openURL(url);
        });
    }
    /**
     * Helper method to get inputs from query params and localstorage
     *
     * The second argument is used to read values from the query string
     *   e.g. ['data', 'nonce'] -> params.get('data') and params.get('nonce')
     *
     * The third argument is used to read values from local storage
     *   e.g. ['address', 'message'] -> storage.address.get() and storage.message.get()
     *
     * Throws an error if any of the inputs are unable to be found in their respective locations
     */
    getInputsOrThrow(methodName, queryParams, storageParams) {
        const inputs = {};
        const queryString = PlatformService.getUrl().searchParams;
        queryParams.forEach((param) => {
            const value = queryString.get(param);
            if (!value) {
                throw new Error(`[PhantomRedirect] ${methodName} called, but required input '${param}' not found in query params`);
            }
            inputs[param] = value;
        });
        storageParams.forEach((storageParam) => {
            const value = storage[storageParam].get();
            if (!value) {
                throw new Error(`[PhantomRedirect] ${methodName} called, but required input '${storageParam}' not found in local storage`);
            }
            inputs[storageParam] = value;
        });
        return inputs;
    }
}

export { PhantomRedirect };
