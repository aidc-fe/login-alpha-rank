"use client";

import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

const LOGIN_SERVER_LIST = [
  "http://localhost:3000/home",
  "http://localhost:8000/dashboard",
];

export default function LoginLandingPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const targetUrl = searchParams.get("targetUrl");
  const jwt = session?.jwt;

  // useEffect(() => {
  //   if (jwt) {
  //     const nextUrls = LOGIN_SERVER_LIST.slice(1).join(",");
  //     const redirectUrl = `${LOGIN_SERVER_LIST[0]}?nextUrls=${nextUrls}&targetUrl=${targetUrl}&_jwtToken=${jwt}`;
  //     window.location.href = redirectUrl;
  //   }
  // }, [jwt, targetUrl]);

  return <div>{JSON.stringify(session?.jwt)}</div>;
}
