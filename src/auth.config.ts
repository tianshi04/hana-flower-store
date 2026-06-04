import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnAdmin = nextUrl.pathname.startsWith("/admin");
      const isOnProfile = nextUrl.pathname.startsWith("/profile");
      const isOnCheckout = nextUrl.pathname.startsWith("/checkout");

      if (isOnAdmin) {
        if (isLoggedIn && auth.user.role === "ADMIN") return true;
        // Redirect non-admins to login
        return Response.redirect(new URL("/login", nextUrl));
      }

      if (isOnProfile || isOnCheckout) {
        if (isLoggedIn) return true;
        // Redirect unauthenticated users to login
        return Response.redirect(new URL("/login", nextUrl));
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.name = token.name;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
  providers: [], // Configured in src/auth.ts
} satisfies NextAuthConfig;
