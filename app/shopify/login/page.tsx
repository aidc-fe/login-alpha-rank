"use client";

import SuspenseWrapper from "@/components/suspend-wrapper";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

const callbackUrl = `${process.env.NEXT_PUBLIC_NEXT_AUTH_URL}/login-landing-page`;

function ShopifyAuthLoginPage() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const userData = Array.from(searchParams.keys()).reduce(
      (acc: { [key: string]: string }, curr: string) => {
        acc[curr] = searchParams.get(curr) || "";
        return acc;
      },
      {}
    );

    signIn("shopify", { ...userData, callbackUrl });
  }, [searchParams]);

  return <div>Redirecting...</div>;
}

export default function PageWrapper() {
  return (
    <SuspenseWrapper>
      <ShopifyAuthLoginPage />
    </SuspenseWrapper>
  );
}
