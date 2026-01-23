'use client'
import { __awaiter } from '../../_virtual/_tslib.js';
import bs58 from 'bs58';
import { PublicKey } from '@solana/web3.js';
import EventEmitter from 'eventemitter3';

/**
 * Signer implementation for DynamicWaasSVMConnector
 * This class provides a similar interface to TurnkeySolanaSigner
 */
class DynamicWaasSVMSigner extends EventEmitter {
    constructor({ walletConnector, }) {
        super();
        // ISolanaSigner properties
        this.isConnected = true;
        this.providers = [this];
        this.isBraveWallet = false;
        this.isGlow = false;
        this.isPhantom = false;
        this.isSolflare = false;
        this.isExodus = false;
        this.isBackpack = false;
        this.isMagicEden = false;
        this.walletConnector = walletConnector;
        this.accountAddress = this.walletConnector.activeAccountAddress;
        this.publicKey = this.accountAddress
            ? new PublicKey(this.accountAddress)
            : undefined;
    }
    signMessage(encodedMessage) {
        return __awaiter(this, void 0, void 0, function* () {
            // Convert Uint8Array to string for the DynamicWaasSVMConnector
            const messageString = Buffer.from(encodedMessage).toString();
            const signedMessage = yield this.walletConnector.signMessage(messageString);
            // Convert base64 string to Uint8Array
            const signatureBytes = bs58.decode(signedMessage);
            return { signature: signatureBytes };
        });
    }
    signTransaction(transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.walletConnector.signTransaction(transaction);
        });
    }
    signAllTransactions(transactions) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.walletConnector.signAllTransactions(transactions);
        });
    }
    signAndSendTransaction(transaction, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const signature = yield this.walletConnector.signAndSendTransaction(transaction, options);
            return { signature };
        });
    }
    connect(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _args) {
        return __awaiter(this, void 0, void 0, function* () {
            return { address: this.accountAddress, publicKey: this.publicKey };
        });
    }
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            return;
        });
    }
}

export { DynamicWaasSVMSigner };
