"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

const callbackUrl = `${process.env.NEXT_PUBLIC_NEXT_AUTH_URL}/login-landing-page`;

export default function ShopifyAuthLoginPage() {
  const searchParams = useSearchParams();

  const userData = Array.from(searchParams.keys()).reduce(
    (acc: { [key: string]: string }, curr: string) => {
      acc[curr] = searchParams.get(curr) || "";
      return acc;
    },
    {}
  );

  signIn("shopify", { ...userData, callbackUrl });
}
