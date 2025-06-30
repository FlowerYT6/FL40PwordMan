let key;

async function generateKey(password) {
  const enc = new TextEncoder();
  const salt = new Uint8Array(16); // fixed salt for demo
  const baseKey = await crypto.subtle.importKey(
    'raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']
  );
  key = await crypto.subtle.deriveKey({
    name: 'PBKDF2',
    salt,
    iterations: 100000,
    hash: 'SHA-256'
  }, baseKey, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}

async function encryptData(data, key) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(JSON.stringify(data));
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);
  return { iv: Array.from(iv), data: Array.from(new Uint8Array(cipher)) };
}

async function decryptData(encrypted, iv, key) {
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: new Uint8Array(iv) },
    key,
    new Uint8Array(encrypted)
  );
  return JSON.parse(new TextDecoder().decode(decrypted));
}
