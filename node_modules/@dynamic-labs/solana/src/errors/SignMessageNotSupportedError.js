'use client'
import { NotSupportedError } from '@dynamic-labs/utils';

class SignMessageNotSupportedError extends NotSupportedError {
    constructor(walletName) {
        super(`Message signing is currently not supported on ${walletName} hardware wallet.
    You can use signMessageViaTransaction instead to achieve similar functionality
    by signing a transaction with a memo instruction.
    You can read more about it here https://github.com/solana-labs/solana/issues/21366`);
    }
}

export { SignMessageNotSupportedError };
