import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

const allowedEmails = () =>
  (process.env.AUTH_ALLOWED_EMAILS ?? "manuelbiolatiri@gmail.com")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

const credentialsProvider = process.env.AUTH_PASSWORD?.trim()
  ? Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "").trim().toLowerCase();
        const password = String(credentials?.password ?? "");
        const configuredPassword = process.env.AUTH_PASSWORD?.trim();

        if (
          !email ||
          !allowedEmails().includes(email) ||
          !configuredPassword ||
          !password ||
          password !== configuredPassword
        ) {
          return null;
        }

        return { id: email, email, name: email };
      },
    })
  : null;

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google, ...(credentialsProvider ? [credentialsProvider] : [])],
  pages: { signIn: "/sign-in" },
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  callbacks: {
    authorized: ({ auth, request }) => {
      const publicPath = ["/", "/sign-in", "/sign-up"].includes(
        request.nextUrl.pathname,
      );
      return publicPath || Boolean(auth?.user);
    },
    async signIn({ user }) {
      return Boolean(user.email && allowedEmails().includes(user.email.toLowerCase()));
    },
  },
});
