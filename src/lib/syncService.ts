/**
 * Legacy decryption utilities for importing v5 .alchemist backups
 */

// We use PBKDF2 to derive an AES-GCM key from the password
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as any,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );
}

export async function decryptData(encryptedData: Uint8Array, password: string): Promise<string> {
  // Format: salt (16 bytes) + iv (12 bytes) + ciphertext
  const salt = encryptedData.slice(0, 16);
  const iv = encryptedData.slice(16, 28);
  const ciphertext = encryptedData.slice(28);

  const key = await deriveKey(password, salt);

  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv as any
    },
    key,
    ciphertext
  );

  const dec = new TextDecoder();
  return dec.decode(decryptedBuffer);
}
