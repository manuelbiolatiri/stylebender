import { randomBytes, scryptSync } from "node:crypto";

const password = process.argv[2];
if (!password) {
  console.error("Usage: node scripts/generate-auth-hash.mjs 'a-long-password'");
  process.exit(1);
}
const salt = randomBytes(16).toString("hex");
const hash = scryptSync(password, salt, 64, { N: 16384 }).toString("hex");
console.log(`scrypt$16384$${salt}$${hash}`);
