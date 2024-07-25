"use client";

import SuspenseWrapper from "@/components/suspend-wrapper";
import { Loader } from "lucide-react";
import { getCsrfToken } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

const redirectUri = `${process.env.NEXT_PUBLIC_NEXT_AUTH_URL}/api/shopify/auth/callback`;
const scope = [
  "write_products",
  "write_content",
  "write_themes",
  "read_products",
  "read_content",
  "read_themes",
].join(",");

function PageContent() {
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
      window.location.href = `https://${shopDomain}/admin/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_SHOPIFY_CLIENT_ID}&scope=${scope}&redirect_uri=${redirectUri}&state=${csrfToken}`;
    });
  }, [shopDomain]);

  return (
    <main className="w-full h-full flex justify-center items-center">
      <Loader size={60} className="text-primary animate-spin" />
    </main>
  );
}

export default function ShopifyAuthPage() {
  return (
    <SuspenseWrapper>
      <PageContent />
    </SuspenseWrapper>
  );
}
