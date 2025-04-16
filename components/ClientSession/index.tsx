"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function ClientSession() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const invite = searchParams.get("invite") as string;
    const loginReferral = searchParams.get("loginReferral") as string;
    const utmSource = searchParams.get("utm_source") as string;
    if (invite) {
      sessionStorage.setItem("invite", invite);
    }
    if (loginReferral) {
      sessionStorage.setItem("loginReferral", loginReferral);
    }
    if (utmSource) {
      sessionStorage.setItem("utmSource", utmSource);
    }
  }, []);

  return <></>;
}
