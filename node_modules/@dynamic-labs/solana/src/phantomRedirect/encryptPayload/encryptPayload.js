'use client'
import nacl from 'tweetnacl';

const encryptPayload = (payload, sharedSecret) => {
    const nonce = nacl.randomBytes(24);
    const encryptedPayload = nacl.box.after(Buffer.from(JSON.stringify(payload)), nonce, sharedSecret);
    return [nonce, encryptedPayload];
};

export { encryptPayload };
