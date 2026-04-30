/**
 * ALCHEMIST Universal Backup & Sync Module
 * AES-256-GCM Encryption / File System Access API based
 */

/**
 * Derives a cryptographic key from a master password.
 */
async function deriveKey(password: string, salt: Uint8Array) {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );
  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts a plain string data using AES-256-GCM.
 * Output format: [salt (16b)] + [iv (12b)] + [ciphertext (n b)]
 */
export async function encryptData(plainText: string, password: string): Promise<ArrayBuffer> {
  const enc = new TextEncoder();
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);

  const encrypted = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(plainText)
  );

  const result = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
  result.set(salt, 0);
  result.set(iv, salt.length);
  result.set(new Uint8Array(encrypted), salt.length + iv.length);
  
  return result.buffer;
}

/**
 * Decrypts an encrypted ArrayBuffer using AES-256-GCM.
 */
export async function decryptData(encryptedBuffer: ArrayBuffer, password: string): Promise<string> {
  const data = new Uint8Array(encryptedBuffer);
  const salt = data.slice(0, 16);
  const iv = data.slice(16, 28);
  const ciphertext = data.slice(28);

  const key = await deriveKey(password, salt);
  const dec = new TextDecoder();

  const decrypted = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  );

  return dec.decode(decrypted);
}

/**
 * File System Helpers
 */
export async function saveEncryptedFile(directoryHandle: any, fileName: string, data: ArrayBuffer) {
  const fileHandle = await directoryHandle.getFileHandle(fileName, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(data);
  await writable.close();
}

export async function readEncryptedFile(fileHandle: any): Promise<ArrayBuffer> {
  const file = await fileHandle.getFile();
  return await file.arrayBuffer();
}
