"use client";

import { getCsrfToken } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

const redirectUri = `${process.env.NEXT_PUBLIC_NEXT_AUTH_URL}/api/shopify/auth/callback`;

export default function ShopifyAuthPage() {
  const searchParams = useSearchParams();
  const shopDomain = searchParams.get("shopDomain");

  useEffect(() => {
    if (!shopDomain) {
      return;
    }
    getCsrfToken().then((csrfToken) => {
      // setCsrfToken(res!);
      window.location.href = `https://${shopDomain}/admin/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_SHOPIFY_CLIENT_ID}&scope=read_products,write_products&redirect_uri=${redirectUri}&state=${csrfToken}`;
    });
  }, [shopDomain]);

  return <></>;
}
