// 往所有端种登录态cookie
export function thirdPartySignIn(jwt: string, shopDomain?: string | null) {
  const urls = process.env.NEXT_PUBLIC_THIRD_PARTY_SIGNIN_API?.split(",") || [];

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

// 往所有端种登录态cookie
export function thirdPartySignOut() {
  const urls =
    process.env.NEXT_PUBLIC_THIRD_PARTY_SIGNOUT_API?.split(",") || [];

  const fetchPromises = urls.map((url) => {
    return fetch(`${url}`, {
      method: "POST",
      credentials: "include", // 确保 cookie 被发送
      body: "{}",
      headers: {
        "Content-Type": "application/json",
        // 仅仅是为了blog产品，没有让问己新增接口，所以先保留这个
        Authorization: `Bearer` ?? "",
      },
    });
  });

  // 等待所有请求完成
  return Promise.all(fetchPromises);
}
