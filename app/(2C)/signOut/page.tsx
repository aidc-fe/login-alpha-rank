"use client";

import { signOut, useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader } from "lucide-react";
import { thirdPartySignOut } from "@/lib/auth";
import { useClient } from "@/providers/client-provider";

export default function SignOutPage() {
  const { status } = useSession();
  const router = useRouter();
  const { isSSO } = useClient();

  useEffect(() => {
    if (status === "authenticated") {
      if(isSSO){
        // 登出并清除登录态
        thirdPartySignOut().then(() => {
          signOut();
        });
      }else{
        signOut();
      }
    } else if (status === "unauthenticated") {
      // 登录
      router.replace(`/${location.search}`);
    }
  }, [router, status, isSSO]);

  return (
    <main className="h-svh flex justify-center items-center w-full">
      <Loader size={60} className="text-primary animate-spin" />
    </main>
  );
}
