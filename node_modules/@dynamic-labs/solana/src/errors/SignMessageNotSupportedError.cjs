'use client'
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var utils = require('@dynamic-labs/utils');

class SignMessageNotSupportedError extends utils.NotSupportedError {
    constructor(walletName) {
        super(`Message signing is currently not supported on ${walletName} hardware wallet.
    You can use signMessageViaTransaction instead to achieve similar functionality
    by signing a transaction with a memo instruction.
    You can read more about it here https://github.com/solana-labs/solana/issues/21366`);
    }
}

exports.SignMessageNotSupportedError = SignMessageNotSupportedError;
