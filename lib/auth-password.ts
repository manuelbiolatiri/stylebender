import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

const SCRYPT_COST = 16384;
const KEY_LENGTH = 64;

export function createPasswordHash(password: string): string {
  if (!password) throw new Error("Password cannot be empty");
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, KEY_LENGTH, { N: SCRYPT_COST }).toString("hex");
  return `scrypt$${SCRYPT_COST}$${salt}$${hash}`;
}

export function verifyPassword(password: string, encoded: string): boolean {
  const [algorithm, costValue, salt, expectedHex] = encoded.split("$");
  if (algorithm !== "scrypt" || !costValue || !salt || !expectedHex) return false;
  const cost = Number(costValue);
  if (!Number.isSafeInteger(cost) || cost < 16_384 || cost > 1_048_576) return false;
  try {
    const expected = Buffer.from(expectedHex, "hex");
    const actual = scryptSync(password, salt, expected.length || KEY_LENGTH, { N: cost });
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}
