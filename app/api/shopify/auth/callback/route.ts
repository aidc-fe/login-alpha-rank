import { HttpsProxyAgent } from "https-proxy-agent";
import { NextRequest, NextResponse } from "next/server";
import fetch from "node-fetch";

const proxyAgent = new HttpsProxyAgent(process.env.PROXY_URL!);

export async function GET(request: NextRequest) {
  const url = new URL(request.url);

  const params = new URLSearchParams({
    client_id: process.env.NEXT_PUBLIC_SHOPIFY_CLIENT_ID!,
    client_secret: process.env.SHOPIDY_CLIENT_SECRET!,
    code: url.searchParams.get("code") as string,
  });

  const tokenResponse = await fetch(
    `https://${url.searchParams.get("shop")}/admin/oauth/access_token`,
    {
      method: "POST",
      body: params.toString(),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded", // 更改 Content-Type
        Accept: "application/json",
      },
      agent: process.env.VERCEL_ENV === "development" ? proxyAgent : undefined,
    }
  );

  const token = await tokenResponse.json();

  const shop = await fetch(
    `https://${url.searchParams.get("shop")}/admin/api/2023-07/shop.json`,
    {
      method: "GET",
      headers: {
        "X-Shopify-Access-Token": token?.access_token,
      },
      agent: proxyAgent,
    }
  );

  const shopData = await shop.json();
  console.log(shopData);
  const { id, name, email, domain } = shopData?.shop || {};
  const searchParams = new URLSearchParams({ id, name, email, domain });
  return NextResponse.redirect(
    `${
      process.env.NEXT_PUBLIC_NEXT_AUTH_URL
    }/shopify/login?${searchParams.toString()}`,
    302
  );
}
