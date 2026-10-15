import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { verifyPassword } from "@/lib/auth-password";
import authConfig from "@/auth.config";

const failedAttempts = new Map<string, { count: number; resetAt: number; blockedUntil: number }>();
const MAX_FAILED_ATTEMPTS = 5;
const FAILURE_WINDOW_MS = 15 * 60 * 1000;
const BLOCK_MS = 15 * 60 * 1000;

const credentialsProvider = Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "").trim().toLowerCase();
        const password = String(credentials?.password ?? "");
        const adminEmail = (process.env.AUTH_ADMIN_EMAIL ?? "admin@stylebender.test").trim().toLowerCase();
        const passwordHash = process.env.AUTH_ADMIN_PASSWORD_HASH?.trim() ?? "";
        const key = email || "unknown";
        const now = Date.now();
        const attempt = failedAttempts.get(key);
        if (attempt?.blockedUntil && attempt.blockedUntil > now) return null;
        const valid = email === adminEmail && Boolean(password) && Boolean(passwordHash) && verifyPassword(password, passwordHash);
        if (!valid) {
          const next = attempt && attempt.resetAt > now
            ? { ...attempt, count: attempt.count + 1 }
            : { count: 1, resetAt: now + FAILURE_WINDOW_MS, blockedUntil: 0 };
          if (next.count >= MAX_FAILED_ATTEMPTS) next.blockedUntil = now + BLOCK_MS;
          failedAttempts.set(key, next);
          return null;
        }
        failedAttempts.delete(key);
        return { id: adminEmail, email: adminEmail, name: "Stylebender admin" };
      },
    });

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [credentialsProvider],
});
