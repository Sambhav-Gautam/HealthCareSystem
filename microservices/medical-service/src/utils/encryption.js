const sodium = require('libsodium-wrappers');

let initialized = false;

const initSodium = async () => {
  if (!initialized) {
    await sodium.ready;
    initialized = true;
  }
};

const getEncryptionKey = () => {
  const keyHex = process.env.ENCRYPTION_KEY || '0'.repeat(64);
  return Buffer.from(keyHex, 'hex');
};

exports.encryptData = async (plaintext) => {
  await initSodium();
  
  if (!plaintext) return null;
  
  const key = getEncryptionKey();
  const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
  const message = sodium.from_string(JSON.stringify(plaintext));
  const ciphertext = sodium.crypto_secretbox_easy(message, nonce, key);
  
  return {
    ciphertext: sodium.to_hex(ciphertext),
    nonce: sodium.to_hex(nonce)
  };
};

exports.decryptData = async (encrypted) => {
  await initSodium();
  
  if (!encrypted || !encrypted.ciphertext || !encrypted.nonce) return null;
  
  try {
    const key = getEncryptionKey();
    const ciphertext = sodium.from_hex(encrypted.ciphertext);
    const nonce = sodium.from_hex(encrypted.nonce);
    
    const decrypted = sodium.crypto_secretbox_open_easy(ciphertext, nonce, key);
    const plaintext = sodium.to_string(decrypted);
    
    return JSON.parse(plaintext);
  } catch (error) {
    console.error('Decryption error:', error.message);
    return null;
  }
};

exports.hashSensitiveData = async (data) => {
  await initSodium();
  
  if (!data) return null;
  
  const hash = sodium.crypto_generichash(32, sodium.from_string(data));
  return sodium.to_hex(hash);
};

exports.generateEncryptionKey = async () => {
  await initSodium();
  const key = sodium.randombytes_buf(sodium.crypto_secretbox_KEYBYTES);
  return sodium.to_hex(key);
};


