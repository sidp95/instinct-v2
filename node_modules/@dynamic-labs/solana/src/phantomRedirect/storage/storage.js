'use client'
import { logger } from '../../utils/logger.js';

const storage = {
    address: {
        get: () => {
            var _a;
            const value = (_a = localStorage.getItem('dynamic_phantom_wallet_address')) !== null && _a !== void 0 ? _a : undefined;
            logger.logVerboseTroubleshootingMessage('[PhantomStorage] address.get', {
                value,
            });
            return value;
        },
        remove: () => {
            logger.logVerboseTroubleshootingMessage('[PhantomStorage] address.remove');
            localStorage.removeItem('dynamic_phantom_wallet_address');
        },
        set: (address) => {
            logger.logVerboseTroubleshootingMessage('[PhantomStorage] address.set', {
                address: address.toString(),
            });
            localStorage.setItem('dynamic_phantom_wallet_address', address.toString());
        },
    },
    encryptionPublicKey: {
        get: () => {
            const rawPublicKey = localStorage.getItem('dynamic_phantom_public_key');
            if (!rawPublicKey) {
                return undefined;
            }
            return new Uint8Array(JSON.parse(rawPublicKey));
        },
        remove: () => {
            localStorage.removeItem('dynamic_phantom_public_key');
        },
        set: (publicKey) => {
            localStorage.setItem('dynamic_phantom_public_key', JSON.stringify([...publicKey]));
        },
    },
    encryptionSecretKey: {
        get: () => {
            const rawSecretKey = localStorage.getItem('dynamic_phantom_secret_key');
            if (!rawSecretKey) {
                return undefined;
            }
            return new Uint8Array(JSON.parse(rawSecretKey));
        },
        remove: () => {
            localStorage.removeItem('dynamic_phantom_secret_key');
        },
        set: (secretKey) => {
            localStorage.setItem('dynamic_phantom_secret_key', JSON.stringify([...secretKey]));
        },
    },
    message: {
        get: () => {
            var _a;
            const value = (_a = localStorage.getItem('dynamic_phantom_message_to_sign')) !== null && _a !== void 0 ? _a : undefined;
            logger.logVerboseTroubleshootingMessage('[PhantomStorage] message.get', {
                hasMessage: Boolean(value),
                messageLength: value === null || value === void 0 ? void 0 : value.length,
                messagePreview: value === null || value === void 0 ? void 0 : value.substring(0, 100),
            });
            return value;
        },
        remove: () => {
            logger.logVerboseTroubleshootingMessage('[PhantomStorage] message.remove');
            localStorage.removeItem('dynamic_phantom_message_to_sign');
        },
        set: (message) => {
            logger.logVerboseTroubleshootingMessage('[PhantomStorage] message.set', {
                messageLength: message.length,
                messagePreview: message.substring(0, 100),
            });
            localStorage.setItem('dynamic_phantom_message_to_sign', message);
        },
    },
    method: {
        get: () => {
            var _a;
            const value = (_a = localStorage.getItem('dynamic_phantom_method')) !== null && _a !== void 0 ? _a : undefined;
            logger.logVerboseTroubleshootingMessage('[PhantomStorage] method.get', {
                value,
            });
            return value;
        },
        remove: () => {
            logger.logVerboseTroubleshootingMessage('[PhantomStorage] method.remove');
            localStorage.removeItem('dynamic_phantom_method');
        },
        set: (method) => {
            logger.logVerboseTroubleshootingMessage('[PhantomStorage] method.set', {
                method,
            });
            localStorage.setItem('dynamic_phantom_method', method);
        },
    },
    requestId: {
        get: () => { var _a; return (_a = localStorage.getItem('dynamic_phantom_request_id')) !== null && _a !== void 0 ? _a : undefined; },
        remove: () => {
            localStorage.removeItem('dynamic_phantom_request_id');
        },
        set: (requestId) => {
            localStorage.setItem('dynamic_phantom_request_id', requestId);
        },
    },
    sendOptions: {
        get: () => { var _a; return (_a = localStorage.getItem('dynamic_phantom_send_options')) !== null && _a !== void 0 ? _a : undefined; },
        remove: () => {
            localStorage.removeItem('dynamic_phantom_send_options');
        },
        set: (options) => {
            localStorage.setItem('dynamic_phantom_send_options', options);
        },
    },
    session: {
        get: () => {
            var _a;
            const value = (_a = localStorage.getItem('dynamic_phantom_session')) !== null && _a !== void 0 ? _a : undefined;
            logger.logVerboseTroubleshootingMessage('[PhantomStorage] session.get', {
                hasSession: Boolean(value),
            });
            return value;
        },
        remove: () => {
            logger.logVerboseTroubleshootingMessage('[PhantomStorage] session.remove');
            localStorage.removeItem('dynamic_phantom_session');
        },
        set: (session) => {
            logger.logVerboseTroubleshootingMessage('[PhantomStorage] session.set', {
                session,
            });
            localStorage.setItem('dynamic_phantom_session', session);
        },
    },
    sharedSecret: {
        get: () => {
            const rawSharedSecret = localStorage.getItem('dynamic_phantom_shared_secret');
            logger.logVerboseTroubleshootingMessage('[PhantomStorage] sharedSecret.get', { hasSharedSecret: Boolean(rawSharedSecret) });
            if (!rawSharedSecret) {
                return undefined;
            }
            return new Uint8Array(JSON.parse(rawSharedSecret));
        },
        remove: () => {
            logger.logVerboseTroubleshootingMessage('[PhantomStorage] sharedSecret.remove');
            localStorage.removeItem('dynamic_phantom_shared_secret');
        },
        set: (sharedSecret) => {
            logger.logVerboseTroubleshootingMessage('[PhantomStorage] sharedSecret.set', {
                sharedSecretLength: sharedSecret.length,
            });
            localStorage.setItem('dynamic_phantom_shared_secret', JSON.stringify([...sharedSecret]));
        },
    },
};
const clearStorage = () => {
    logger.logVerboseTroubleshootingMessage('[PhantomStorage] clearStorage called');
    for (const key in storage) {
        storage[key].remove();
    }
};

export { clearStorage, storage };
