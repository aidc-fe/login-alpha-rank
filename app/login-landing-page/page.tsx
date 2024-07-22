"use client";

import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import SuspenseWrapper from "@/components/suspend-wrapper";

const LOGIN_SERVER_LIST = [
  // "http://localhost:3000/home",
  "https://pre-blog.alpha-rank.com/dashboard",
];

declare module "next-auth" {
  interface Session {
    jwtToken: string;
  }
}

function LoginLandingPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const targetUrl = searchParams.get("targetUrl");
  const jwt = session?.jwtToken;

  useEffect(() => {
    console.log(session);
    if (jwt) {
      const nextUrls = LOGIN_SERVER_LIST.slice(1).join(",");
      const redirectUrl = `${LOGIN_SERVER_LIST[0]}?nextUrls=${nextUrls}&targetUrl=${targetUrl}&_jwtToken=${jwt}`;
      window.location.href = redirectUrl;
    }
  }, [jwt, session, targetUrl]);

  return <div>{JSON.stringify(session?.jwtToken)}</div>;
}

export default function PageWrapper() {
  return (
    <SuspenseWrapper>
      <LoginLandingPage />
    </SuspenseWrapper>
  );
}
