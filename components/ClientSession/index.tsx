"use client"

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function ClientSession() {
  const searchParams = useSearchParams();
  const invite = searchParams.get("invite") as string;
  
  useEffect(() => {
    if (invite) {
      sessionStorage.setItem("invite", invite);
    }
  }, [invite]);

  return <></>;
}
