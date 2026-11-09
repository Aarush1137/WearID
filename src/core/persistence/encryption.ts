import crypto from "crypto";
import { AnatomicalProfile } from "../types";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

/**
 * Derives a 32-byte key from secret passphrase using SHA-256
 */
function deriveKey(secret: string): Buffer {
  return crypto.createHash("sha256").update(secret).digest();
}

/**
 * Encrypt anatomical measurements at rest using AES-256-GCM.
 * Protects biometric dimensions against database leaks or storage snapshots.
 */
export function encryptBiometrics(
  profile: AnatomicalProfile,
  masterKey: string
): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = deriveKey(masterKey);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const payload = JSON.stringify(profile);
  const encrypted = Buffer.concat([
    cipher.update(payload, "utf8"),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  // Combined payload: IV + AuthTag + EncryptedData (hex encoded)
  return [
    iv.toString("hex"),
    tag.toString("hex"),
    encrypted.toString("hex"),
  ].join(":");
}

/**
 * Decrypts AES-256-GCM encrypted anatomical profile.
 */
export function decryptBiometrics(
  encryptedPayload: string,
  masterKey: string
): AnatomicalProfile {
  const parts = encryptedPayload.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted payload format");
  }

  const [ivHex, tagHex, dataHex] = parts;
  const iv = Buffer.from(ivHex, "hex");
  const tag = Buffer.from(tagHex, "hex");
  const encrypted = Buffer.from(dataHex, "hex");

  const key = deriveKey(masterKey);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return JSON.parse(decrypted.toString("utf8")) as AnatomicalProfile;
}
