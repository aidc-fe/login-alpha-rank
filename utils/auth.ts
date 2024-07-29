// 往所有端种登录态cookie
export function plantCookies(jwt: string, shopDomain?: string | null) {
  const urls = [
    `https://${
      process.env.NEXT_PUBLIC_VERCEL_ENV === "production" ? "" : "pre-"
    }blog.alpha-rank.com/web/api/account/register`,
  ];

  const fetchPromises = urls.map((url) => {
    return fetch(url, {
      method: "POST",
      credentials: "include", // 确保 cookie 被发送
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}` ?? "",
      },
      body: JSON.stringify({
        shopifyShopDomain: shopDomain,
      }),
    });
  });

  // 等待所有请求完成
  return Promise.all(fetchPromises);
}
