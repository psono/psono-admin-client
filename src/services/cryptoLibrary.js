/**
 * Crypto library service providing all the crypto
 */

import nacl from 'ecma-nacl'
import uuid from 'uuid-js'
import sha512 from 'js-sha512'
import sha256 from 'js-sha256'

import helper from './helper'
import converter from './converter'

function InvalidRecoveryCodeException(message) {
    this.message = message;
    this.name = "InvalidRecoveryCodeException";
}

/**
 * Random byte generator from nacl_factory.js
 * https://github.com/tonyg/js-nacl
 *
 * @param {int} count The amount of random bytes to return
 *
 * @returns {Uint8Array} Random byte array
 */
function randomBytes (count) {
    let bs;
    if (typeof module !== 'undefined' && module.exports) {
        // add node.js implementations
        const crypto = require('crypto');
        return crypto.randomBytes(count)
    } else if (window && window.crypto && window.crypto.getRandomValues) {
        // add in-browser implementation
        bs = new Uint8Array(count);
        window.crypto.getRandomValues(bs);
        return bs;
    } else if (window && window.msCrypto && window.msCrypto.getRandomValues) {
        // add in-browser implementation
        bs = new Uint8Array(count);
        window.msCrypto.getRandomValues(bs);
        return bs;
    } else {
        throw new Error("No cryptographic random number generator");
    }
}

let scrypt_lookup_table = {};

/**
 * flushes the scrypt lookup table after 60 seconds
 */
function clear_scrypt_lookup_table() {
    setTimeout(function() {
        scrypt_lookup_table = {};
    }, 60000);
}


/**
 * Scrypt wrapper for psono to create for a password and a salt the fix scrypt hash.
 *
 * @param {string} password the password one wants to hash
 * @param {string} salt The fix salt one wants to use
 *
 * @returns {string} The scrypt hash
 */
function password_scrypt(password, salt) {
    // Lets first generate our key from our user_sauce and password
    const u = 14; //2^14 = 16MB
    const r = 8;
    const p = 1;
    const l = 64; // 64 Bytes = 512 Bits
    let k;

    const lookup_hash = sha512(password) + sha512(salt);

    if (scrypt_lookup_table.hasOwnProperty(lookup_hash)) {
        k = scrypt_lookup_table[lookup_hash];
    } else {
        k = converter.to_hex(nacl.scrypt(converter.encode_utf8(password), converter.encode_utf8(salt), u, r, p, l, function(pDone) {}));
        scrypt_lookup_table[lookup_hash] = k;
        clear_scrypt_lookup_table()
    }
    return k;
}

/**
 * takes the sha512 of lowercase username as salt to generate scrypt password hash in hex called
 * the authkey, so basically:
 *
 * hex(scrypt(password, hex(sha512(lower(username)))))
 *
 * For compatibility reasons with other clients please use the following parameters if you create your own client:
 *
 * var c = 16384 // 2^14;
 * var r = 8;
 * var p = 1;
 * var l = 64;
 *
 * @param {string} username Username of the user (in email format)
 * @param {string} password Password of the user
 *
 * @returns {string} auth_key Scrypt hex value of the password with the sha512 of lowercase email as salt
 */
function generate_authkey (username, password) {
    // takes the sha512(username) as salt.
    // var salt = nacl.to_hex(nacl.crypto_hash_string(username.toLowerCase()));
    const salt = sha512(username.toLowerCase());
    return password_scrypt(password, salt);
}

/**
 * generates secret keys that is 32 Bytes or 256 Bits long and represented as hex
 *
 * @returns {string} Returns secret key (hex encoded, 32 byte long)
 */
function generate_secret_key () {
    return converter.to_hex(randomBytes(32)); // 32 Bytes = 256 Bits
}

/**
 * generates public and private key pair
 * All keys are 32 Bytes or 256 Bits long and represented as hex
 *
 * @returns {PublicPrivateKeyPair} Returns object with a public-private-key-pair
 */
function generate_public_private_keypair() {

    const sk = randomBytes(32);
    const pk = nacl.box.generate_pubkey(sk);

    return {
        public_key : converter.to_hex(pk), // 32 Bytes = 256 Bits
        private_key : converter.to_hex(sk) // 32 Bytes = 256 Bits
    };
}

/**
 * Takes the secret and encrypts that with the provided password. The crypto_box takes only 256 bits, therefore we
 * are using sha256(password+user_sauce) as key for encryption.
 * Returns the nonce and the cipher text as hex.
 *
 * @param {string} secret The secret you want to encrypt
 * @param {string} password The password you want to use to encrypt the secret
 * @param {string} user_sauce The user's sauce
 *
 * @returns {EncryptedValue} The encrypted text and the nonce
 */
function encrypt_secret (secret, password, user_sauce) {

    const salt = sha512(user_sauce);
    const k = converter.from_hex(sha256(password_scrypt(password, salt))); // key

    // and now lets encrypt
    const m = converter.encode_utf8(secret); // message
    const n = randomBytes(24); // nonce
    const c = nacl.secret_box.pack(m, n, k); //encrypted message

    return {
        nonce: converter.to_hex(n),
        text: converter.to_hex(c)
    };

}

/**
 * Takes the cipher text and decrypts that with the nonce and the sha256(password+user_sauce).
 * Returns the initial secret.
 *
 * @param {string} text The encrypted text
 * @param {string} nonce The nonce for the encrypted text
 * @param {string} password The password to decrypt the text
 * @param {string} user_sauce The users sauce used during encryption
 *
 * @returns {string} secret The decrypted secret
 */
function decrypt_secret (text, nonce, password, user_sauce) {

    const salt = sha512(user_sauce);
    const k = converter.from_hex(sha256(password_scrypt(password, salt)));

    // and now lets decrypt
    const n = converter.from_hex(nonce);
    const c = converter.from_hex(text);
    const m1 = nacl.secret_box.open(c, n, k);

    return converter.decode_utf8(m1);
}

/**
 * Takes the data and the secret_key as hex and encrypts the data.
 * Returns the nonce and the cipher text as hex.
 *
 * @param {string} data The data you want to encrypt
 * @param {string} secret_key The secret key you want to use to encrypt the data
 *
 * @returns {EncryptedValue} The encrypted text and the nonce
 */
function encrypt_data(data, secret_key) {

    const k = converter.from_hex(secret_key);
    const m = converter.encode_utf8(data);
    const n = randomBytes(24);
    const c = nacl.secret_box.pack(m, n, k);

    return {
        nonce: converter.to_hex(n),
        text: converter.to_hex(c)
    };
}

/**
 * Takes the cipher text and decrypts that with the nonce and the secret_key.
 * Returns the initial data.
 *
 * @param {string} text The encrypted text
 * @param {string} nonce The nonce of the encrypted text
 * @param {string} secret_key The secret key used in the past to encrypt the text
 *
 * @returns {string} The decrypted data
 */
function decrypt_data(text, nonce, secret_key) {

    const k = converter.from_hex(secret_key);
    const n = converter.from_hex(nonce);
    const c = converter.from_hex(text);
    const m1 = nacl.secret_box.open(c, n, k);

    return converter.decode_utf8(m1);
}

/**
 * Takes the data and encrypts that with a random nonce, the receivers public key and users private key.
 * Returns the nonce and the cipher text as hex.
 *
 * @param {string} data The data you want to encrypt
 * @param {string} public_key The public key you want to use for the encryption
 * @param {string} private_key The private key you want to use for the encryption
 *
 * @returns {EncryptedValue} The encrypted text and the nonce
 */
function encrypt_data_public_key(data, public_key, private_key) {

    const p = converter.from_hex(public_key);
    const s = converter.from_hex(private_key);
    const m = converter.encode_utf8(data);
    const n = randomBytes(24);
    const c = nacl.box.pack(m, n, p, s);

    return {
        nonce: converter.to_hex(n),
        text: converter.to_hex(c)
    };
}

/**
 * Takes the cipher text and decrypts that with the nonce, the senders public key and users private key.
 * Returns the initial data.
 *
 * @param {string} text The encrypted text
 * @param {string} nonce The nonce that belongs to the encrypted text
 * @param {string} public_key The pulic key you want to use to decrypt the text
 * @param {string} private_key The private key you want to use to encrypt the text
 *
 * @returns {string} The decrypted data
 */
function decrypt_data_public_key(text, nonce, public_key, private_key) {

    const p = converter.from_hex(public_key);
    const s = converter.from_hex(private_key);
    const n = converter.from_hex(nonce);
    const c = converter.from_hex(text);
    const m1 = nacl.box.open(c, n, p, s);

    return converter.decode_utf8(m1);
}

/**
 * returns a 32 bytes long random hex value to be used as the user special sauce
 *
 * @returns {string} Returns a random user sauce (32 bytes, hex encoded)
 */
function generate_user_sauce() {
    return converter.to_hex(randomBytes(32)); // 32 Bytes = 256 Bits
}

/**
 * generates a n-long base58 checksum
 *
 * @param {string} str The string of which ones to have a checksum
 * @param {int} n The length of the checksum one wants to have
 *
 * @returns {string} Returns n base58 encoded chars as checksum
 */
function get_checksum(str, n) {
    return converter.hex_to_base58(sha512(str)).substring(0, n);
}

/**
 * returns a 16 bytes long random base58 value to be used as recovery password including four base58 letters as checksum
 *
 * @returns {object} Returns a random user sauce (16 bytes, hex encoded)
 */
function generate_recovery_code() {
    const password_bytes = randomBytes(16);// 16 Bytes = 128 Bits
    const password_hex = converter.to_hex(password_bytes);
    const password_words = converter.hex_to_words(password_hex);
    const password_base58 = converter.to_base58(password_bytes);

    // Then we split up everything in 11 digits long chunks
    let recovery_code_chunks = helper.split_string_in_chunks(password_base58, 11);
    // Then we loop over our chunks and use the base58 representation of the sha512 checksum to get 2 checksum
    // digits, and append them to the original chunk
    for (let i = 0; i < recovery_code_chunks.length; i++) {
        recovery_code_chunks[i] += get_checksum(recovery_code_chunks[i], 2);
    }

    return {
        bytes: password_bytes,
        hex: password_hex,
        words: password_words,
        base58: password_base58,
        base58_checksums: recovery_code_chunks.join('')
    };
}

/**
 * Removes the checksums from a base58 encoded recovery code with checksums.
 * e.g. 'UaKSKNNixJY2ARqGDKXduo4c2N' becomes 'UaKSKNNixJYRqGDKXduo4c'
 *
 * @param {string} recovery_code_with_checksums The recovery code with checksums
 *
 * @returns {string} Returns recovery code without checksums
 */
function recovery_code_strip_checksums(recovery_code_with_checksums) {

    let recovery_code_chunks = helper.split_string_in_chunks(recovery_code_with_checksums, 13);

    for (let i = 0; i < recovery_code_chunks.length; i++) {

        if (recovery_code_chunks[i].length < 2) {
            throw new InvalidRecoveryCodeException("Recovery code chunks with a size < 2 are impossible");
        }
        recovery_code_chunks[i] = recovery_code_chunks[i].slice(0,-2);
    }
    return recovery_code_chunks.join('')
}

/**
 * Tests if a given recovery password chunk can be valid according to the checksum
 * e.g. UaKSKNNixJY2A would return true and UaKSKNNixJY2B would return false
 *
 * @returns {boolean} Returns weather the password chunk is valid
 */
function recovery_password_chunk_pass_checksum(chunk_with_checksum) {
    if (chunk_with_checksum.length < 2) return false;
    const password = chunk_with_checksum.substring(0, chunk_with_checksum.length -2);
    const checksum = chunk_with_checksum.substring(chunk_with_checksum.length -2);

    return get_checksum(password, 2) === checksum;
}

/**
 * Generates a uuid
 *
 * @returns {uuid} Returns weather the password chunk is valid
 */
function generate_uuid() {
    const uuidv4 = uuid.create();
    return uuidv4.toString();
}

/**
 * Returns whether the provided message and verify_key produce the correct signature or not
 *
 * @param {string} message The raw message to verify
 * @param {string} signature The hex representation of the signature
 * @param {string} verify_key The hex representation of the verification key
 *
 * @returns {boolean} Returns whether the signature is correct or not
 */
function validate_signature(message, signature, verify_key) {
    return nacl.signing.verify(converter.from_hex(signature), converter.encode_utf8(message), converter.from_hex(verify_key));
}

const service = {
    randomBytes,
    sha256,
    sha512,
    generate_authkey,
    generate_secret_key,
    generate_public_private_keypair,
    encrypt_secret,
    decrypt_secret,
    encrypt_data,
    decrypt_data,
    encrypt_data_public_key,
    decrypt_data_public_key,
    generate_user_sauce,
    get_checksum,
    generate_recovery_code,
    recovery_code_strip_checksums,
    recovery_password_chunk_pass_checksum,
    generate_uuid,
    validate_signature
};

export default service;