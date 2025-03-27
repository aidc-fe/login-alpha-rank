"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { Loader } from "lucide-react";
import React from "react";

import SuspenseWrapper from "@/components/suspend-wrapper";

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
        if (window.opener && window.name === "loginWindow") {
          window.close();

          return;
        }
        break;
      case "unauthenticated":
        router.replace(`/${searchParams.toString()}`);
        break;
      case "loading":
        break;
    }
  }, [router, status, searchParams]);

  return (
    <main className="min-h-svh flex justify-center items-center w-full">
      <Loader className="text-primary animate-spin" size={60} />
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
