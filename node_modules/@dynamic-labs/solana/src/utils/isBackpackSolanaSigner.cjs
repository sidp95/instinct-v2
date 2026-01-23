'use client'
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const isBackpackSolanaSigner = (signer) => Boolean(signer) && signer.send !== undefined;

exports.isBackpackSolanaSigner = isBackpackSolanaSigner;
