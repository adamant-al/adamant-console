var sodium = require('sodium-browserify-tweetnacl')
var crypto = require('crypto')
var Mnemonic = require('bitcore-mnemonic')
var bignum = require('./bignumber.js')
var ByteBuffer = require('bytebuffer')

module.exports = {
    createTransaction: function (type, data) {
	switch (type) {
	    case '0': 
		break;
	}
	return {};
    },
    getHash: function (trs) {
	return crypto.createHash('sha256').update(this.getBytes(trs)).digest()
    },
    getBytes: function (transaction) {
	var skipSignature = false
        var skipSecondSignature = true
	var assetSize = 0
	var assetBytes = null

        switch (transaction.type) {
	    case 0:
    	    break
	    case 8:
    		assetBytes = this.chatGetBytes(transaction)
    		assetSize = assetBytes.length
    	    break
	    default:
    		 alert('Not supported yet')
	}

	var bb = new ByteBuffer(1 + 4 + 32 + 8 + 8 + 64 + 64 + assetSize, true)

	bb.writeByte(transaction.type)
	bb.writeInt(transaction.timestamp)

	var senderPublicKeyBuffer = new Buffer(transaction.senderPublicKey, 'hex')
	for (var i = 0; i < senderPublicKeyBuffer.length; i++) {
	    bb.writeByte(senderPublicKeyBuffer[i])
	}

	if (transaction.requesterPublicKey) {
	    var requesterPublicKey = new Buffer(transaction.requesterPublicKey, 'hex')

	    for (var i = 0; i < requesterPublicKey.length; i++) {
    		bb.writeByte(requesterPublicKey[i])
	    }
	}

	if (transaction.recipientId) {
	    var recipient = transaction.recipientId.slice(1)
	    recipient = new bignum(recipient).toBuffer({size: 8})

	    for (i = 0; i < 8; i++) {
    		bb.writeByte(recipient[i] || 0)
	    }
	} else {
	    for (i = 0; i < 8; i++) {
    		bb.writeByte(0)
	    }
	}

	bb.writeLong(transaction.amount)

	if (assetSize > 0) {
	    for (var i = 0; i < assetSize; i++) {
    		 bb.writeByte(assetBytes[i])
	    }
	}

	if (!skipSignature && transaction.signature) {
	    var signatureBuffer = new Buffer(transaction.signature, 'hex')
	    for (var i = 0; i < signatureBuffer.length; i++) {
    		bb.writeByte(signatureBuffer[i])
	    }
	}

	if (!skipSecondSignature && transaction.signSignature) {
	    var signSignatureBuffer = new Buffer(transaction.signSignature, 'hex')
	    for (var i = 0; i < signSignatureBuffer.length; i++) {
    		bb.writeByte(signSignatureBuffer[i])
	    }
	}

	bb.flip()
	var arrayBuffer = new Uint8Array(bb.toArrayBuffer())
	var buffer = []

	for (var i = 0; i < arrayBuffer.length; i++) {
	    buffer[i] = arrayBuffer[i]
	}

	return new Buffer(buffer)
    },
    transactionSign: function (trs, keypair) {
	var hash = this.getHash(trs)
	return this.sign(hash, keypair).toString('hex')
    },
    chatGetBytes: function (trs) {
	var buf

	try {
	    buf = Buffer.from([])
	    var messageBuf = Buffer.from(trs.asset.chat.message, 'hex')
	    buf = Buffer.concat([buf, messageBuf])

	    if (trs.asset.chat.own_message) {
    		var ownMessageBuf = Buffer.from(trs.asset.chat.own_message, 'hex')
    		buf = Buffer.concat([buf, ownMessageBuf])
	    }
	    var bb = new ByteBuffer(4 + 4, true)
	    bb.writeInt(trs.asset.chat.type)
	    bb.flip()
	    buf = Buffer.concat([buf, Buffer.from(bb.toBuffer())])
	} catch (e) {
	    throw e
	}

	return buf
    },
    sign: function (hash, keypair) {
	return sodium.crypto_sign_detached(hash, Buffer.from(keypair.privateKey, 'hex'))
    }
}