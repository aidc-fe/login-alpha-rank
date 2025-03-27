"use client";

import { signIn, useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useClient } from "@/providers/client-provider";

function replaceDomain(authDomain: string) {
  return authDomain.replace("login", "www");
}

export default function GetAuthPage() {
  const { status, data } = useSession();
  const router = useRouter();
  const { businessDomainId, auth_domain } = useClient();

  const websiteDomain = `https://${replaceDomain(auth_domain)}`;

  // 如果不是在iframe中，禁止访问
  useEffect(() => {
    if (window.top === window.self) {
      router.replace("/");
    }
  }, [router]);

  useEffect(() => {
    // 向父页面发送 status
    window.parent.postMessage({ status, userInfo: data?.user, session: data }, websiteDomain);
  }, [status, data]);

  useEffect(() => {
    if (window.top === window.self) {
      return;
    }

    const handleMessage = (event: MessageEvent) => {
      // 检查来源，确保安全
      if (!event.origin.includes(websiteDomain)) {
        return;
      }
      // 接收到信息，外面的button置为 loading
      window.parent.postMessage({ status: "loading" }, websiteDomain);

      // 接收用户信息，并且进行登录
      signIn("thirdParty", {
        ...event.data,
        businessDomainId,
        callbackUrl: `/getAuth`,
      });
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  return <div className="flex items-center flex-col gap-2" />;
}
