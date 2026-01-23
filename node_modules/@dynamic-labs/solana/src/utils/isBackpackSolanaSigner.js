'use client'
const isBackpackSolanaSigner = (signer) => Boolean(signer) && signer.send !== undefined;

export { isBackpackSolanaSigner };
