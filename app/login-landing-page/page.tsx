"use client";

import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import SuspenseWrapper from "@/components/suspend-wrapper";
import { plantCookies } from "@/utils/auth";

declare module "next-auth" {
  interface Session {
    jwtToken: string;
  }
}

function PageContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const targetUrl = searchParams.get("targetUrl");
  const shopDomain = searchParams.get("shopDomain");
  const jwtToken = session?.jwtToken;

  useEffect(() => {
    if (jwtToken) {
      plantCookies(jwtToken, shopDomain).then(() => {
        window.location.href = targetUrl || "https://blog.alpha-rank.com";
      });
    }
  }, [jwtToken, targetUrl, shopDomain]);

  return <div>{JSON.stringify(session?.jwtToken)}</div>;
}

export default function LoginLandingPage() {
  return (
    <SuspenseWrapper>
      <PageContent />
    </SuspenseWrapper>
  );
}
