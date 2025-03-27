import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 判断邮箱是否是gmail
export function isGmail(email: string) {
  // 使用正则表达式检查是否为 Gmail 地址
  const gmailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;

  return gmailPattern.test(email);
}

// 添加 hex 转 HSL 的工具函数
export function hexToHSL(hex: string) {
  // 移除 # 号（如果存在）
  hex = hex.replace(/^#/, "");

  // 将 hex 转换为 RGB
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;

    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  // 转换为实际的 HSL 值
  h = Math.round(h * 360);
  s = Math.round(s * 100);
  const lightness = Math.round(l * 100);

  return { h, s, l: lightness };
}

// 判断是否是3分钟内注册的
export function is3Minutes(created_at: Date): "sign_up" | "sign_in" {
  const verifiedTime = new Date(created_at).getTime();
  const currentTime = Date.now();
  const threeMinutes = 3 * 60 * 1000; // 3分钟转换为毫秒

  if (verifiedTime > currentTime - threeMinutes && verifiedTime <= currentTime) {
    return "sign_up";
  } else {
    return "sign_in";
  }
}
