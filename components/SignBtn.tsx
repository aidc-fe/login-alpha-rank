"use client";

import { signIn, signOut, useSession, getSession } from "next-auth/react";
import Cookies from "js-cookie";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Session } from "inspector";

// 处理链式跳转逻辑
const redirectUrls = [
  "http://dev.alpha-rank.com:8000/login",
  // "https://your-site.com/second-url",
  // "https://your-site.com/third-url",
];

const SignInButton = () => {
  // const router = useRouter();
  // const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  // const callbackUrl = searchParams.get("callback") ?? "";

  // useEffect(() => {
  //   if (session) {
  //     // const token = session.jwt;
  //     // window.location.href = `http://dev.alpha-rank.com:8000/login?token=${token}&nextUrl=${callbackUrl}`;
  //     // const chainRedirect = async (urls: string[]) => {
  //     // for (const url of urls) {
  //     // window.location.href = url;
  //     // 延时等待每次跳转
  //     // await new Promise((resolve) => setTimeout(resolve, 2000));
  //     // }
  //     // if (callbackUrl) {
  //     //   window.location.href = callbackUrl;
  //     // }
  //   }
  //   // chainRedirect([
  //   //   ...redirectUrls.map((item) => `${item}?token=${token}`),
  //   //   callbackUrl,
  //   // ]);
  //   // }
  // }, [callbackUrl, session]);

  return (
    <div className="flex flex-col gap-2">
      {JSON.stringify(session)}
      <button
        className="bg-blue-600 rounded-lg px-4 py-1 w-fit text-white text-lg"
        onClick={
          session
            ? () => signOut()
            : () =>
                signIn("", {
                  // callbackUrl: window.location.href,
                })
        }
      >
        {session ? "Sign out" : "Sign in"}
      </button>
    </div>
  );
};

export default SignInButton;
