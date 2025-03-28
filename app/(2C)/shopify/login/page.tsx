"use client";

import { Loader } from "lucide-react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { useClient } from "@/providers/client-provider";
import SuspenseWrapper from "@/components/suspend-wrapper";

function PageContent() {
  const searchParams = useSearchParams();
  const { businessDomainId } = useClient();

  // 从searchParams提取用户信息
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

    const signedStoreList = JSON.parse(localStorage.getItem("signedStoreList") || "[]");

    if (
      !signedStoreList.some(
        (item: { shopDomain: string; shopName: string; displayDomain: string }) =>
          item.shopDomain === shopDomain
      )
    ) {
      localStorage.setItem(
        "signedStoreList",
        JSON.stringify([...signedStoreList, { shopDomain, shopName, displayDomain }])
      );
    }

    signIn("thirdParty", {
      ...userData,
      businessDomainId,
      callbackUrl: `/login-landing-page?targetUrl=${
        sessionStorage.getItem("shopifyTargetUrl") || searchParams.get("targetUrl")
      }&shopDomain=${shopDomain}`,
    });
  }, [searchParams]);

  return (
    <main className="h-full flex justify-center items-center w-full">
      <Loader className="text-primary animate-spin" size={60} />
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
