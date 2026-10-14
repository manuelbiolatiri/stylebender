import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

const allowedEmails = () =>
  (process.env.AUTH_ALLOWED_EMAILS ?? "manuelbiolatiri@gmail.com")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google,
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "").trim().toLowerCase();
        const password = String(credentials?.password ?? "");

        if (
          !email ||
          !allowedEmails().includes(email) ||
          password !== (process.env.AUTH_PASSWORD ?? "")
        ) {
          return null;
        }

        return { id: email, email, name: email };
      },
    }),
  ],
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
