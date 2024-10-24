"use client";

import { signIn, useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { WEBSITE_DOMAIN } from "@/lib/url";

export default function GetAuthPage() {
  const { status, data } = useSession();
  const router = useRouter();

  // 如果不是在iframe中，禁止访问
  useEffect(() => {
    if (window.top === window.self) {
      router.replace("/");
    }
  }, [router]);

  useEffect(() => {
    // 向父页面发送 status
    window.parent.postMessage({ status, userInfo: data?.user }, WEBSITE_DOMAIN);
  }, [status, data]);

  useEffect(() => {
    if (window.top === window.self) {
      return;
    }

    const handleMessage = (event: MessageEvent) => {
      // 检查来源，确保安全
      if (!event.origin.includes(WEBSITE_DOMAIN)) {
        return;
      }
      // 接收到信息，外面的button置为 loading
      window.parent.postMessage({ status: "loading" }, WEBSITE_DOMAIN);

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

  return <div className="flex items-center flex-col gap-2"></div>;
}
