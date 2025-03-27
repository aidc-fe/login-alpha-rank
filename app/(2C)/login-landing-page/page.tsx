"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { Loader } from "lucide-react";

import SuspenseWrapper from "@/components/suspend-wrapper";
import { thirdPartySignIn } from "@/lib/auth";
import { APP_DOMAIN } from "@/lib/url";

declare module "next-auth" {
  interface Session {
    jwtToken: string;
  }
}

function PageContent() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const targetUrl = searchParams.get("targetUrl");
  const shopDomain = searchParams.get("shopDomain");
  const jwtToken = session?.jwtToken;

  useEffect(() => {
    switch (status) {
      case "authenticated":
        if (jwtToken) {
          thirdPartySignIn(jwtToken, shopDomain).then(() => {
            // 如果是在登录弹窗中，则关闭弹窗
            if (window.opener && window.name === "loginWindow") {
              window.close();

              return;
            }

            let url;

            try {
              url = new URL(targetUrl || "");
            } catch {}

            if (
              targetUrl &&
              process.env.NEXT_PUBLIC_TARGET_HOST_WHITE_LIST?.split(",")?.includes(url?.host || "")
            ) {
              window.location.href = targetUrl;
            } else {
              window.location.href = APP_DOMAIN;
            }
          });
        } else {
          router.replace(`/${searchParams.toString()}`);
        }
        break;
      case "unauthenticated":
        router.replace(`/${searchParams.toString()}`);
        break;
      case "loading":
        break;
    }
  }, [jwtToken, targetUrl, shopDomain, router, status, searchParams]);

  return (
    <main className="min-h-svh flex justify-center items-center w-full">
      <Loader className="text-primary animate-spin" size={60} />
    </main>
  );
}

export default function LoginLandingPage() {
  return (
    <SuspenseWrapper>
      <PageContent />
    </SuspenseWrapper>
  );
}
