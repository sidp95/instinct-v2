'use client'
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const isSignedMessage = (message) => Boolean(message) && message.signature !== undefined;

exports.isSignedMessage = isSignedMessage;
