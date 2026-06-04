import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  // Protect routes matching /admin, /profile, /checkout while ignoring static assets and API routes
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png|.*\\.jpg|.*\\.svg|favicon.ico).*)"],
};
