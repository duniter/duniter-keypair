"use strict";

const Q        = require('q');
const co       = require('co');
const nacl     = require('tweetnacl');
const naclutil = require('tweetnacl-util');
const scrypt   = require('scryptb');
const base58   = require('bs58');
const dec = naclutil.decodeBase64;

const SEED_LENGTH = 32; // Length of the key

/**
 * Generates a new keypair object from salt + password strings.
 * @param salt
 * @param key
 * @param N Scrypt parameter N. Defaults to 4096.
 * @param r Scrypt parameter r. Defaults to 16.
 * @param p Scrypt parameter p. Defaults to 1.
 * @return keyPair An object containing the public and private keys, base58 encoded.
 */
module.exports = (salt, key, N = 4096, r = 16, p = 1) => co(function*() {
  const keyBytes = yield getScryptKey(key, salt, N, r, p);
  const pair = nacl.sign.keyPair.fromSeed(keyBytes);
  return {
    pub: base58.encode(new Buffer(pair.publicKey, 'hex')),
    sec: base58.encode(new Buffer(pair.secretKey, 'hex'))
  };
});

const getScryptKey = (key, salt, N, r, p) => co(function*() {
  const res = yield Q.nbind(scrypt.hash, scrypt, key, { N, r, p }, SEED_LENGTH, salt);
  return dec(res.toString("base64"));
});
