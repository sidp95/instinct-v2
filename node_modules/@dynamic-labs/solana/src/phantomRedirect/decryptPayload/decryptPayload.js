'use client'
import bs58 from 'bs58';
import nacl from 'tweetnacl';
import { logger } from '../../utils/logger.js';

const failForMissingParam = (paramName, param) => {
    const message = `Failed to decrypt phantom redirect payload: ${paramName} was invalid (${param})`;
    logger.error(message);
    throw new Error(message);
};
const decryptPayload = (data, nonce, sharedSecret) => {
    if (!data)
        failForMissingParam('data', data);
    if (!nonce)
        failForMissingParam('nonce', nonce);
    if (!sharedSecret)
        failForMissingParam('sharedSecret', sharedSecret);
    const decryptedData = nacl.box.open.after(bs58.decode(data), bs58.decode(nonce), sharedSecret);
    if (!decryptedData) {
        throw new Error('Unable to decrypt data');
    }
    return JSON.parse(Buffer.from(decryptedData).toString('utf8'));
};

export { decryptPayload };
