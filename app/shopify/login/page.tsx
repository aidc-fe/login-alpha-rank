"use client";

import SuspenseWrapper from "@/components/suspend-wrapper";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

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

    signIn("shopify", {
      ...userData,
      callbackUrl: `/login-landing-page?targetUrl=${sessionStorage.getItem(
        "shopifyTargetUrl"
      )}?shopDomain=${searchParams.get(
        "shopDomain"
      )}&shopName=${searchParams.get(
        "shopName"
      )}&displayDomain=${searchParams.get("displayDomain")}`,
    });
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
