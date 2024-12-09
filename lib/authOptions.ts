import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { getBusinessDomainIdByAuthDomain, getCurrentServerClient, getUserIdByEmail, prisma } from "@/lib/database";
import { decodeJwt, encodeJwt } from "@/lib/secret";
import { sendVerificationEmail } from "@/lib/email";
import { CookieOpt } from "@/lib/auth";

export const authOptions: NextAuthOptions = {
  adapter: {
    ...PrismaAdapter(prisma),
    getUserByEmail: async (email: string) => {
      // 从请求中获取 businessDomainId
      // 注意：这里需要访问请求上下文来获取 businessDomainId
      const businessDomainId = await getBusinessDomainIdByAuthDomain();

      const user = await prisma.user.findUnique({
        where: {
          email_businessDomainId: {
            email,
            businessDomainId,
          },
        },
      });

      return user;
    },
    createUser: async (data) => {
      // 从请求中获取 businessDomainId
      // 注意：这里需要访问请求上下文来获取 businessDomainId
      const businessDomainId = await getBusinessDomainIdByAuthDomain();

      const user = await prisma.user.create({
        data: {
          ...data,
          businessDomainId,
        },
      });

      return user;
    },
  },
  session: {
    strategy: "jwt",
  },
  jwt: {
    encode: encodeJwt,
    decode: decodeJwt,
  },
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: CookieOpt,
    },
    callbackUrl: {
      name: "next-auth.callback-url",
      options: CookieOpt,
    },
    csrfToken: {
      name: "next-auth.csrf-token",
      options: CookieOpt,
    },
  },

  callbacks: {
    async session({ session, token }) {
      return { ...session, jwtToken: token?.jwtToken, id: token?.sub };
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
        businessDomainId: {},
      },
      async authorize(credentials) {
        const name = credentials?.name || "";
        const email = credentials?.email || "";
        const from = credentials?.from || "";
        const image = credentials?.image || "";
        const businessDomainId = credentials?.businessDomainId || "";
        // 在数据库中查找用户
        let user = await prisma.user.findUnique({
          where: {
            email_businessDomainId: {
              email,
              businessDomainId,
            },
          },
        });

        // 如果用户不存在，创建新用户
        if (!user) {
          user = await prisma.user.create({
            data: {
              name,
              email,
              from,
              businessDomainId,
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
      credentials: {
        id: {},
        password: {},
        name: {},
        email: {},
        businessDomainId: {},
      },
      async authorize(credentials) {
        const email = credentials?.email || "";
        const businessDomainId = credentials?.businessDomainId || "";
        // 在数据库中查找用户
        let user = await prisma.user.findUnique({
          where: {
            email_businessDomainId: {
              email,
              businessDomainId,
            },
          },
        });

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
        secure: true,
      },
      from: process.env.EMAIL_FROM,
      async sendVerificationRequest({ identifier: email, url }) {
        const userId = await getUserIdByEmail(email);
        const client = await getCurrentServerClient();
        const urlObj = new URL(url);
        let callbackUrl = urlObj.searchParams.get('callbackUrl');
        if (callbackUrl && userId) {
          // 解码 callbackUrl
          callbackUrl = decodeURIComponent(callbackUrl);
          
          // 直接将 userId 添加到 callbackUrl
          const separator = callbackUrl.includes('?') ? '&' : '?';
          const updatedCallbackUrl = `${callbackUrl}${separator}userId=${userId}`;
          
          // 设置回原始 URL，只编码一次
          urlObj.searchParams.set('callbackUrl', updatedCallbackUrl);
        }

        const finalUrl = urlObj.toString();

        await sendVerificationEmail(email, finalUrl, `${client.name} - Login`, {
          title: `Login to ${client.name}`,
          description: `<p>You can login to ${client.name} by clicking the button below.</p> 
            <p>
            Good news!  You and your team can use username/password to login your ${client.name} account now. Just set your password with the following link: <a style='color:${client.brand_color}' href='${
              process.env.NEXT_PUBLIC_NEXT_AUTH_URL
            }/password/emailVerify?email=${encodeURIComponent(
            email
          )}'>setting your password.</a>.
            </p>
            `,
          btnContent: "Login",
        }, client.brand_color ?? '#7c3aed');
      },
    }),
  ],
  pages: {
    signIn: `/`,
    verifyRequest: `/email/sent`,
    error: "/", // Error code passed in query string as ?error=
  },
};