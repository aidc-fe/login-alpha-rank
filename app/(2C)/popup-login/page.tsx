"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import SuspenseWrapper from "@/components/suspend-wrapper";
import { Loader } from "lucide-react";
import React from "react";

declare module "next-auth" {
  interface Session {
    jwtToken: string;
  }
}

function PageContent() {
  const { status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    switch (status) {
      case "authenticated":
          window.close();
        return;
      case "unauthenticated":
        router.replace(`/${searchParams.toString()}`);
        break;
      case "loading":
        break;
    }
  }, [router, status, searchParams]);

  return (
    <main className="min-h-svh flex justify-center items-center w-full">
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
