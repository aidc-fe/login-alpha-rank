import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isGmail(email: string) {
  // 使用正则表达式检查是否为 Gmail 地址
  const gmailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;
  return gmailPattern.test(email);
}

// 测试示例
console.log(isGmail("example@gmail.com")); // true
console.log(isGmail("example@yahoo.com")); // false
