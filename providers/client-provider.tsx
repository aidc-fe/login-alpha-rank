'use client'

import { useContext, useEffect } from "react";
import { createContext } from "react";
import { Client } from "@prisma/client";

type ClientWithBusinessDomainType = Client & {  
  isSSO: boolean;
  materials: {image:string,title:string,description:string}[];
};

// 添加 hex 转 HSL 的工具函数
function hexToHSL(hex: string) {
  // 移除 # 号（如果存在）
  hex = hex.replace(/^#/, '');

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

const ClientContext = createContext<ClientWithBusinessDomainType | undefined>(undefined);

export default function ClientProvider({ children, client }: { children: React.ReactNode, client?: ClientWithBusinessDomainType }) {
  useEffect(() => {
    if (client?.brand_color) {
      const hsl = hexToHSL(client.brand_color);
      document.documentElement.style.setProperty('--nextui-primary', `${hsl.h} ${hsl.s}% ${hsl.l}%`);
    }
  }, [client?.brand_color]);

  return <ClientContext.Provider value={client}>{children}</ClientContext.Provider>;
}

export function useClient() {
  const client = useContext(ClientContext) as ClientWithBusinessDomainType;
  return client || {};
}
