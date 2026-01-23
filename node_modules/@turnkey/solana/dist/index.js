'use strict';

var web3_js = require('@solana/web3.js');
var http = require('@turnkey/http');

class TurnkeySigner {
    constructor(input) {
        this.organizationId = input.organizationId;
        this.client = input.client;
    }
    /**
     * This function takes an array of Solana transactions and adds a signature with Turnkey to each of them
     *
     * @param txs array of Transaction | VersionedTransaction (native @solana/web3.js type)
     * @param fromAddress Solana address (base58 encoded)
     */
    async signAllTransactions(txs, fromAddress, organizationId) {
        const fromKey = new web3_js.PublicKey(fromAddress);
        let messages = txs.map((tx) => this.getMessageToSign(tx).toString("hex"));
        const signRawPayloadsResult = await this.signRawPayloads(messages, fromAddress, organizationId);
        const signatures = signRawPayloadsResult?.signatures?.map((sig) => `${sig?.r}${sig?.s}`);
        for (let i in txs) {
            txs[i]?.addSignature(fromKey, Buffer.from(signatures[i], "hex"));
        }
        return txs;
    }
    /**
     * This function takes a Solana transaction and adds a signature with Turnkey
     *
     * @param tx Transaction | VersionedTransaction object (native @solana/web3.js type)
     * @param fromAddress Solana address (base58 encoded)
     */
    async addSignature(tx, fromAddress, organizationId) {
        const fromKey = new web3_js.PublicKey(fromAddress);
        const messageToSign = this.getMessageToSign(tx);
        const signRawPayloadResult = await this.signRawPayload(messageToSign.toString("hex"), fromAddress, organizationId ?? this.organizationId);
        const signature = `${signRawPayloadResult?.r}${signRawPayloadResult?.s}`;
        tx.addSignature(fromKey, Buffer.from(signature, "hex"));
    }
    /**
     * This function takes a message and returns it after being signed with Turnkey
     *
     * @param message The message to sign (Uint8Array)
     * @param fromAddress Solana address (base58 encoded)
     */
    async signMessage(message, fromAddress, organizationId) {
        const signRawPayloadResult = await this.signRawPayload(Buffer.from(message).toString("hex"), fromAddress, organizationId);
        return Buffer.from(`${signRawPayloadResult?.r}${signRawPayloadResult?.s}`, "hex");
    }
    /**
     * This function takes a Solana transaction, adds a signature via Turnkey,
     * and returns a new transaction
     *
     * @param tx Transaction | VersionedTransaction object (native @solana/web3.js type)
     * @param fromAddress Solana address (base58 encoded)
     */
    async signTransaction(tx, fromAddress, organizationId) {
        const payloadToSign = Buffer.from(tx.serialize({
            requireAllSignatures: false,
            verifySignatures: false,
        })).toString("hex");
        const signedTransaction = await this.signTransactionImpl(payloadToSign, fromAddress, organizationId);
        const decodedTransaction = Buffer.from(signedTransaction, "hex");
        const recoveredTransaction = "version" in tx
            ? web3_js.VersionedTransaction.deserialize(decodedTransaction)
            : web3_js.Transaction.from(decodedTransaction);
        return recoveredTransaction;
    }
    async signTransactionImpl(unsignedTransaction, signWith, organizationId) {
        if (http.isHttpClient(this.client)) {
            const response = await this.client.signTransaction({
                type: "ACTIVITY_TYPE_SIGN_TRANSACTION_V2",
                organizationId: organizationId ?? this.organizationId,
                timestampMs: String(Date.now()),
                parameters: {
                    signWith,
                    unsignedTransaction,
                    type: "TRANSACTION_TYPE_SOLANA",
                },
            });
            const { activity } = response;
            http.assertActivityCompleted(activity);
            return http.assertNonNull(activity?.result?.signTransactionResult?.signedTransaction);
        }
        else {
            const { activity, signedTransaction } = await this.client.signTransaction({
                ...(organizationId !== undefined && { organizationId }),
                signWith,
                unsignedTransaction,
                type: "TRANSACTION_TYPE_SOLANA",
            });
            http.assertActivityCompleted(activity);
            return http.assertNonNull(signedTransaction);
        }
    }
    async signRawPayload(payload, signWith, organizationId) {
        if (http.isHttpClient(this.client)) {
            const response = await this.client.signRawPayload({
                type: "ACTIVITY_TYPE_SIGN_RAW_PAYLOAD_V2",
                organizationId: organizationId ?? this.organizationId,
                timestampMs: String(Date.now()),
                parameters: {
                    signWith,
                    payload,
                    encoding: "PAYLOAD_ENCODING_HEXADECIMAL",
                    // Note: unlike ECDSA, EdDSA's API does not support signing raw digests (see RFC 8032).
                    // Turnkey's signer requires an explicit value to be passed here to minimize ambiguity.
                    hashFunction: "HASH_FUNCTION_NOT_APPLICABLE",
                },
            });
            const { activity } = response;
            http.assertActivityCompleted(activity);
            return http.assertNonNull(activity?.result?.signRawPayloadResult);
        }
        else {
            const { activity, r, s, v } = await this.client.signRawPayload({
                ...(organizationId !== undefined && { organizationId }),
                signWith,
                payload,
                encoding: "PAYLOAD_ENCODING_HEXADECIMAL",
                // Note: unlike ECDSA, EdDSA's API does not support signing raw digests (see RFC 8032).
                // Turnkey's signer requires an explicit value to be passed here to minimize ambiguity.
                hashFunction: "HASH_FUNCTION_NOT_APPLICABLE",
            });
            http.assertActivityCompleted(activity);
            return http.assertNonNull({
                r,
                s,
                v,
            });
        }
    }
    async signRawPayloads(payloads, signWith, organizationId) {
        if (http.isHttpClient(this.client)) {
            const response = await this.client.signRawPayloads({
                type: "ACTIVITY_TYPE_SIGN_RAW_PAYLOADS",
                organizationId: organizationId ?? this.organizationId,
                timestampMs: String(Date.now()),
                parameters: {
                    signWith,
                    payloads,
                    encoding: "PAYLOAD_ENCODING_HEXADECIMAL",
                    // Note: unlike ECDSA, EdDSA's API does not support signing raw digests (see RFC 8032).
                    // Turnkey's signer requires an explicit value to be passed here to minimize ambiguity.
                    hashFunction: "HASH_FUNCTION_NOT_APPLICABLE",
                },
            });
            const { activity } = response;
            http.assertActivityCompleted(activity);
            return http.assertNonNull(activity?.result?.signRawPayloadsResult);
        }
        else {
            const { activity, signatures } = await this.client.signRawPayloads({
                ...(organizationId !== undefined && { organizationId }),
                signWith,
                payloads,
                encoding: "PAYLOAD_ENCODING_HEXADECIMAL",
                // Note: unlike ECDSA, EdDSA's API does not support signing raw digests (see RFC 8032).
                // Turnkey's signer requires an explicit value to be passed here to minimize ambiguity.
                hashFunction: "HASH_FUNCTION_NOT_APPLICABLE",
            });
            http.assertActivityCompleted(activity);
            return http.assertNonNull({
                signatures: signatures,
            });
        }
    }
    getMessageToSign(tx) {
        let messageToSign;
        // @ts-ignore
        // type narrowing (e.g. tx instanceof Transaction) does not seem to work here when the package gets compiled
        // and bundled. Instead, we will check for the existence of a property unique to the Transaction class
        // to determine whether the caller passed a Transaction or a VersionedTransaction
        if (typeof tx.serializeMessage === "function") {
            messageToSign = tx.serializeMessage();
        }
        else {
            messageToSign = Buffer.from(tx.message.serialize());
        }
        return messageToSign;
    }
}

exports.TurnkeySigner = TurnkeySigner;
//# sourceMappingURL=index.js.map
