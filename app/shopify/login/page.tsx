"use client";

import SuspenseWrapper from "@/components/suspend-wrapper";
import { Loader } from "lucide-react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

function PageContent() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const userData = Array.from(searchParams.keys()).reduce(
      (acc: { [key: string]: string }, curr: string) => {
        acc[curr] = searchParams.get(curr) || "";
        return acc;
      },
      {}
    );

    const shopDomain = searchParams.get("shopDomain");
    const shopName = searchParams.get("shopName");
    const displayDomain = searchParams.get("displayDomain");

    const signedStoreList = JSON.parse(
      localStorage.getItem("signedStoreList") || "[]"
    );
    if (
      !signedStoreList.some(
        (item: {
          shopDomain: string;
          shopName: string;
          displayDomain: string;
        }) => item.shopDomain === shopDomain
      )
    ) {
      localStorage.setItem(
        "signedStoreList",
        JSON.stringify([
          ...signedStoreList,
          { shopDomain, shopName, displayDomain },
        ])
      );
    }

    signIn("shopify", {
      ...userData,
      callbackUrl: `/login-landing-page?targetUrl=${
        sessionStorage.getItem("shopifyTargetUrl") ||
        searchParams.get("targetUrl")
      }&shopDomain=${shopDomain}`,
    });
  }, [searchParams]);

  return (
    <main className="h-full flex justify-center items-center w-full">
      <Loader size={60} className="text-primary animate-spin" />
    </main>
  );
}

export default function ShopifyAuthLoginPage() {
  return (
    <SuspenseWrapper>
      <PageContent />
    </SuspenseWrapper>
  );
}
