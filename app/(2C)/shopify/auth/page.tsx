"use client";

import { Loader } from "lucide-react";
import { getCsrfToken } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { APP_DOMAIN } from "@/lib/url";
import SuspenseWrapper from "@/components/suspend-wrapper";

const redirectUri = `${process.env.NEXT_PUBLIC_NEXT_AUTH_URL}/api/shopify/auth/callback`;
const scope = [
  "write_products",
  "read_products",
  "read_content",
  "write_content",
  "write_themes",
  "read_themes",
  "read_locales",
  "write_locales",
  "write_translations",
  "read_translations",
].join(",");

function PageContent() {
  const searchParams = useSearchParams();
  const shopDomain = searchParams.get("shopDomain");
  const targetUrl = searchParams.get("targetUrl");

  sessionStorage.setItem("shopifyTargetUrl", targetUrl || APP_DOMAIN);

  useEffect(() => {
    if (!shopDomain) {
      return;
    }
    getCsrfToken().then(csrfToken => {
      window.location.href = `https://${shopDomain}/admin/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_SHOPIFY_CLIENT_ID}&scope=${scope}&redirect_uri=${redirectUri}&state=${csrfToken}`;
    });
  }, [shopDomain]);

  return (
    <main className="w-full h-full flex justify-center items-center">
      <Loader className="text-primary animate-spin" size={60} />
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
