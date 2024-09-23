"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect } from "react";

export default function GetAuthPage() {
  const { status, data } = useSession();

  useEffect(() => {
    // 向父页面发送 status
    window.parent.postMessage(
      { status },
      process.env.NEXT_PUBLIC_WEBSITE_DOMAIN!
    );
  }, [status]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // 检查来源，确保安全
      if (!event.origin.includes(process.env.NEXT_PUBLIC_WEBSITE_DOMAIN!)) {
        return;
      }
      // 接收到信息，外面的button置为 loading
      window.parent.postMessage(
        { status: "loading" },
        process.env.NEXT_PUBLIC_WEBSITE_DOMAIN!
      );

      // 接收用户信息，并且进行登录
      signIn("thirdParty", {
        ...event.data,
        callbackUrl: `/getAuth`,
      });
    };
    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  return (
    <div className="flex items-center flex-col gap-2">
      {status}
      <div>{JSON.stringify(data?.user)}</div>
      <button
        onClick={() => {
          signOut();
        }}
      >
        Sign out
      </button>
      <button
        onClick={() => {
          // signIn("thirdParty", {
          //   name: "shabi",
          //   email: "text@163.com",
          //   id: "123123",
          //   callbackUrl: `/getAuth`,
          // });
          signIn("thirdParty", {
            name: "xushi.zt@alibaba-inc.com",
            email: "xushi.zt@alibaba-inc.com",
            domain: "alpharank.myshoplaza.com",
            from: "shoplazza",
            callbackUrl: `/getAuth`,
          });
        }}
      >
        Sign In
      </button>
    </div>
  );
}
