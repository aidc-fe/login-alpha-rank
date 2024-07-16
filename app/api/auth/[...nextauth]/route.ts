import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

const authOptions: NextAuthOptions = {
  debug: true,
  adapter: PrismaAdapter(prisma),
  session: {
    // strategy: "jwt",
  },
  cookies: {
    // sessionToken: {
    //   name: "__Secure-alpha-rank-login.session-token",
    //   options: { sameSite: "lax" },
    // },
    // callbackUrl: {
    //   name: "__Secure-alpha-rank-login.callback-url",
    //   options: { sameSite: "lax" },
    // },
  },
  callbacks: {
    // async signIn({ user, account, profile, email, credentials }) {
    //   console.log("signIn", { user, account, profile, email, credentials });
    //   return true;
    // },
    // async redirect({ url, baseUrl }) {
    //   console.log("redirect", { url, baseUrl });
    //   return url.startsWith(baseUrl) ? url : baseUrl;
    // },
    // async session({ session, user, token }) {
    //   console.log("session", { session, user, token });
    //   return { ...session, jwt: token.jwt };
    // },
    // async jwt({ token, user, account, profile }) {
    //   token.jwt = jwt.sign(token, process.env.NEXT_AUTH_SECRET!);
    //   console.log("jwt", { token, user, account, profile });
    //   return token;
    // },
  },
  secret: process.env.NEXT_AUTH_SECRET!,
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: process.env.EMAIL_SERVER_PORT,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
        secure: true, // 使用SSL/TLS
      },
      from: process.env.EMAIL_FROM,
    }),
  ],
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
