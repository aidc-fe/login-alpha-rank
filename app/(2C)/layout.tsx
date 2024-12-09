import request from "@/lib/request";
import ClientProvider from "@/providers/client-provider";
import { headers } from "next/headers";
import { hexToHSL } from "@/lib/utils";

async function getClient() {
  const header = headers();
  // 在 HTTP/2 以及 HTTP/3 中，以一个伪头 :authority 代替 所以需要做一层兼容
  const hostname = header.get("host") || header.get(":authority");

  // 本地开发需要将这里写死地址
  const baseUrl = `https://${hostname}`;
  const client = await request(
    `${baseUrl}/api/client/get_by_domain/${hostname}`
  );
  const businessDomainRes = await request(
    `${baseUrl}/api/businessDomain/${client.businessDomainId}`
  );
  return { ...client, isSSO: businessDomainRes.sso };
}

export async function generateMetadata() {
  const client = await getClient();
  return {
    title: client.title,
    description: client.description,
    icons: {
      icon: client.favicon,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const client = await getClient();
  const hsl = hexToHSL(client.brand_color);
  return (
    <div
      style={
        {
          "--nextui-primary": `${hsl.h} ${hsl.s}% ${hsl.l}%`,
        } as React.CSSProperties
      }
    >
      <ClientProvider client={client}>{children}</ClientProvider>
    </div>
  );
}
