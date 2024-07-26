"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import SuspenseWrapper from "@/components/suspend-wrapper";
import { plantCookies } from "@/utils/auth";
import { Loader } from "lucide-react";

declare module "next-auth" {
  interface Session {
    jwtToken: string;
  }
}

function PageContent() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const targetUrl =
    searchParams.get("targetUrl") ||
    process.env.NEXT_PUBLIC_DEFAULT_TARGET_URL ||
    "";

  const shopDomain = searchParams.get("shopDomain");
  const jwtToken = session?.jwtToken;

  useEffect(() => {
    switch (status) {
      case "authenticated":
        if (jwtToken) {
          plantCookies(jwtToken, shopDomain).then(() => {
            window.location.href = targetUrl;
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
    <main className="h-full flex justify-center items-center w-full">
      <Loader size={60} className="text-primary animate-spin" />
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
