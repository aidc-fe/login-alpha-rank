"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect } from "react";

export default function GetAuthPage() {
  const { status } = useSession();

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

      // 接收并处理用户信息
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
      <button
        onClick={() => {
          signOut();
        }}
      >
        Sign out
      </button>
      <button
        onClick={() => {
          signIn("google");
        }}
      >
        Sign In
      </button>
    </div>
  );
}
