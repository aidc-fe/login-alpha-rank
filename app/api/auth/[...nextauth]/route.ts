import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/database";

const authOptions: NextAuthOptions = {
  // debug: true,
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        sameSite: "none",
        path: "/",
        secure: true,
      },
    },
    callbackUrl: {
      name: "next-auth.callback-url",
      options: {
        sameSite: "none",
        path: "/",
        secure: true,
      },
    },
    csrfToken: {
      name: "next-auth.csrf-token",
      options: {
        sameSite: "none",
        path: "/",
        secure: true,
      },
    },
  },

  callbacks: {
    async session({ session, token }) {
      const jwtToken = jwt.sign(
        { ...session.user, expires: session.expires, id: token.sub } || {},
        process.env.NEXT_AUTH_SECRET!,
        {
          expiresIn: (token.exp as number) - Math.floor(Date.now() / 1000),
        }
      );
      return { ...session, jwtToken };
    },
  },
  secret: process.env.NEXT_AUTH_SECRET!,
  providers: [
    CredentialsProvider({
      id: "thirdParty",
      name: "ThirdParty",
      credentials: {
        id: {},
        name: {},
        email: {},
        from: {},
        image: {},
      },
      async authorize(credentials) {
        const name = credentials?.name || "";
        const email = credentials?.email || "";
        const from = credentials?.from || "";
        const image = credentials?.image || "";

        // 在数据库中查找用户
        let user = await prisma.user.findUnique({
          where: { email },
        });

        // 如果用户不存在，创建新用户
        if (!user) {
          user = await prisma.user.create({
            data: {
              name,
              email,
              from,
              image,
            },
          });
        }

        if (user) {
          return user;
        } else {
          return null;
        }
      },
    }),
    CredentialsProvider({
      id: "password",
      name: "Password",
      credentials: { id: {}, password: {}, name: {}, email: {} },
      async authorize(credentials) {
        const name = credentials?.name || "";
        const email = credentials?.email || "";
        const password = credentials?.password || "";

        // 在数据库中查找用户
        let user = await prisma.user.findUnique({
          where: { email },
        });

        // 如果用户不存在，创建新用户
        if (!user) {
          user = await prisma.user.create({
            data: {
              name,
              email,
              password,
            },
          });
        }

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
    verifyRequest: `/auth/email/verify`,
    error: "/", // Error code passed in query string as ?error=
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
