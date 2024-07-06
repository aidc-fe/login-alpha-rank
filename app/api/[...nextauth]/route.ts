import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
// import { HttpProxyAgent } from "http-proxy-agent";
//
// const agent = new HttpProxyAgent("http://127.0.0.1:8234");

export const authOptions = {
  debug: true,
  httpOptions: {
    // agent, // 配置代理
    timeout: 20000, // 增加超时时间为 20 秒
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  // callbacks: {
  //   async jwt({ token, account }) {
  //     console.log("jwt", token, account);
  //     // Persist the OAuth access_token to the token right after signin
  //     if (account) {
  //       token.accessToken = account.access_token;
  //     }
  //     return token;
  //   },
  //   async session({ session, token, user }) {
  //     console.log("session", session, token, user);
  //     // Send properties to the client, like an access_token from a provider.
  //     session.accessToken = token.accessToken;
  //     return session;
  //   },
  // },
  pages: {
    // signIn: "/google_login",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
