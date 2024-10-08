"use client";

import { signOut, useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader } from "lucide-react";
import { thirdPartySignOut } from "@/lib/auth";

export default function SignOutPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      // 登出并清除登录态
      thirdPartySignOut().then(() => {
        signOut();
      });
    } else if (status === "unauthenticated") {
      // 登录
      router.replace(`/${location.search}`);
    }
  }, [router, status]);

  return (
    <main className="h-full flex justify-center items-center w-full">
      <Loader size={60} className="text-primary animate-spin" />
    </main>
  );
}
