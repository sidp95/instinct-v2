'use client'
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var _tslib = require('../../_virtual/_tslib.cjs');
var bs58 = require('bs58');
var web3_js = require('@solana/web3.js');
var EventEmitter = require('eventemitter3');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var bs58__default = /*#__PURE__*/_interopDefaultLegacy(bs58);
var EventEmitter__default = /*#__PURE__*/_interopDefaultLegacy(EventEmitter);

/**
 * Signer implementation for DynamicWaasSVMConnector
 * This class provides a similar interface to TurnkeySolanaSigner
 */
class DynamicWaasSVMSigner extends EventEmitter__default["default"] {
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
            ? new web3_js.PublicKey(this.accountAddress)
            : undefined;
    }
    signMessage(encodedMessage) {
        return _tslib.__awaiter(this, void 0, void 0, function* () {
            // Convert Uint8Array to string for the DynamicWaasSVMConnector
            const messageString = Buffer.from(encodedMessage).toString();
            const signedMessage = yield this.walletConnector.signMessage(messageString);
            // Convert base64 string to Uint8Array
            const signatureBytes = bs58__default["default"].decode(signedMessage);
            return { signature: signatureBytes };
        });
    }
    signTransaction(transaction) {
        return _tslib.__awaiter(this, void 0, void 0, function* () {
            return this.walletConnector.signTransaction(transaction);
        });
    }
    signAllTransactions(transactions) {
        return _tslib.__awaiter(this, void 0, void 0, function* () {
            return this.walletConnector.signAllTransactions(transactions);
        });
    }
    signAndSendTransaction(transaction, options) {
        return _tslib.__awaiter(this, void 0, void 0, function* () {
            const signature = yield this.walletConnector.signAndSendTransaction(transaction, options);
            return { signature };
        });
    }
    connect(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _args) {
        return _tslib.__awaiter(this, void 0, void 0, function* () {
            return { address: this.accountAddress, publicKey: this.publicKey };
        });
    }
    disconnect() {
        return _tslib.__awaiter(this, void 0, void 0, function* () {
            return;
        });
    }
}

exports.DynamicWaasSVMSigner = DynamicWaasSVMSigner;
