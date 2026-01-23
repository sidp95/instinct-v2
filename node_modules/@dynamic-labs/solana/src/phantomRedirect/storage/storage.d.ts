import { PublicKey } from '@solana/web3.js';
import { Method } from '../types';
export declare const storage: {
    address: {
        get: () => string | undefined;
        remove: () => void;
        set: (address: PublicKey) => void;
    };
    encryptionPublicKey: {
        get: () => Uint8Array | undefined;
        remove: () => void;
        set: (publicKey: Uint8Array) => void;
    };
    encryptionSecretKey: {
        get: () => Uint8Array | undefined;
        remove: () => void;
        set: (secretKey: Uint8Array) => void;
    };
    message: {
        get: () => string | undefined;
        remove: () => void;
        set: (message: string) => void;
    };
    method: {
        get: () => Method | undefined;
        remove: () => void;
        set: (method: Method) => void;
    };
    requestId: {
        get: () => string | undefined;
        remove: () => void;
        set: (requestId: string) => void;
    };
    sendOptions: {
        get: () => string | undefined;
        remove: () => void;
        set: (options: string) => void;
    };
    session: {
        get: () => string | undefined;
        remove: () => void;
        set: (session: string) => void;
    };
    sharedSecret: {
        get: () => Uint8Array | undefined;
        remove: () => void;
        set: (sharedSecret: Uint8Array) => void;
    };
};
export declare const clearStorage: () => void;
