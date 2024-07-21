"use client";

import { callbackUrl } from "@/app/page";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

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
