import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
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
      const allowed = (
        process.env.AUTH_ALLOWED_EMAILS ?? "manuelbiolatiri@gmail.com"
      )
        .split(",")
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean);
      return Boolean(user.email && allowed.includes(user.email.toLowerCase()));
    },
  },
});
