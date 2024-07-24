"use client";

import { signOut, useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { plantCookies } from "@/utils/auth";

export default function SignOutPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      signOut().then(() => {
        plantCookies("");
      });
    } else if (status === "unauthenticated") {
      router.replace(`/${location.search}`);
    }
  }, [router, status]);

  return <>{status}</>;
}
