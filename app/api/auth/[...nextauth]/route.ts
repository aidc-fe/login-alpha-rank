import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const authOptions: NextAuthOptions = {
  // debug: true,
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },

  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      console.log(
        "********** signIn **********",
        user,
        account,
        profile,
        email,
        credentials
      );
      return true;
    },
    // async redirect({ url, baseUrl }) {
    //   return baseUrl;
    // },
    async session({ session, token }) {
      console.log("********** session **********", session, token);
      const { user, expires: rawExpires } = session || {};

      const jwtToken = jwt.sign(user || {}, process.env.NEXT_AUTH_SECRET!, {
        expiresIn: (token.exp as number) - Math.floor(Date.now() / 1000),
      });
      return { ...session, jwtToken };
    },
    async jwt({ token, user, account, profile }) {
      console.log("********** jwt **********", token, user, account, profile);
      return token;
    },
  },
  secret: process.env.NEXT_AUTH_SECRET!,
  providers: [
    CredentialsProvider({
      id: "shopify",
      name: "Shopify",
      credentials: { id: {}, domain: {}, name: {}, email: {} },
      async authorize(credentials, req) {
        console.log("*********** CredentialsProvider **********", credentials);
        // const { id, domain, email, name } = credentials;
        const id = credentials?.id || "";
        const domain = credentials?.domain || "";
        const name = credentials?.name || "";
        const email = credentials?.email || "";
        const user = { id, domain, email, name };
        if (user) {
          return user;
        } else {
          return null;
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
        secure: true, // 使用SSL/TLS
      },
      from: process.env.EMAIL_FROM,
    }),
  ],
  pages: {
    signIn: `/`,
    // verifyRequest: `/login`,
    error: "/", // Error code passed in query string as ?error=
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
