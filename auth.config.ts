import type { NextAuthConfig } from "next-auth";

const authConfig = {
  providers: [],
  pages: { signIn: "/sign-in" },
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  callbacks: {
    authorized: ({ auth, request }) => {
      const publicPath = ["/", "/sign-in"].includes(request.nextUrl.pathname);
      return publicPath || Boolean(auth?.user);
    },
  },
} satisfies NextAuthConfig;

export default authConfig;
