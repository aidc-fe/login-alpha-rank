// 官网的地址
export const WEBSITE_DOMAIN = `https://${
  process.env.NEXT_PUBLIC_ENV === "production" ? "" : "pre-"
}www.alpha-rank.com`;

// app的地址
export const APP_DOMAIN = `https://${
  process.env.NEXT_PUBLIC_ENV === "production" ? "" : "pre-"
}blog.alpha-rank.com`;
