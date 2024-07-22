"use client";

import SuspenseWrapper from "@/components/suspend-wrapper";
import { getCsrfToken } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

const redirectUri = `${process.env.NEXT_PUBLIC_NEXT_AUTH_URL}/api/shopify/auth/callback`;

function ShopifyAuthPage() {
  const searchParams = useSearchParams();
  const shopDomain = searchParams.get("shopDomain");
  const targetUrl = searchParams.get("targetUrl");
  sessionStorage.setItem(
    "shopifyTargetUrl",
    targetUrl || `https://blog.alpha-rank.com`
  );

  useEffect(() => {
    if (!shopDomain) {
      return;
    }
    getCsrfToken().then((csrfToken) => {
      window.location.href = `https://${shopDomain}/admin/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_SHOPIFY_CLIENT_ID}&scope=read_products,write_products&redirect_uri=${redirectUri}&state=${csrfToken}`;
    });
  }, [shopDomain]);

  return <></>;
}

export default function PageWrapper() {
  return (
    <SuspenseWrapper>
      <ShopifyAuthPage />
    </SuspenseWrapper>
  );
}
