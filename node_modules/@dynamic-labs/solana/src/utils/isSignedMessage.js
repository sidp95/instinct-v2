'use client'
const isSignedMessage = (message) => Boolean(message) && message.signature !== undefined;

export { isSignedMessage };
