import ClientProvider from "@/providers/client-provider";
import { headers } from "next/headers";
import { hexToHSL } from "@/lib/utils";
import { getClientByAuthDomain, getBusinessDomainById } from "@/lib/database";
import { cache } from "react";
import ClientSession from "@/components/ClientSession";

const getClientWithCache = cache(async (authDomain: string) => {
  const client = await getClientByAuthDomain(authDomain);
  return client;
});

const getBusinessDomainWithCache = cache(async (id: string) => {
  const businessDomain = await getBusinessDomainById(id);
  return businessDomain;
});

async function getClient() {
  const header = headers();
  // 在 HTTP/2 以及 HTTP/3 中，以一个伪头 :authority 代替 所以需要做一层兼容
  // const hostname = header.get("host") || header.get(":authority");
  const hostname = "pre-login.text2go.ai";

  if (!hostname) {
    throw new Error("Hostname not found");
  }
  const client = await getClientWithCache(hostname);

  if (!client?.businessDomainId) {
    throw new Error("Client not found");
  }

  const businessDomain = await getBusinessDomainWithCache(client.businessDomainId);

  return { ...client, isSSO: businessDomain.sso, url: `https://${hostname}` };
}

export async function generateMetadata() {
  const client = await getClient();
  return {
    title: client.title || '',
    description: client.description || '',
    icons: {
      icon: client.favicon || '',
    },
    alternates: {
      canonical: client.url,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const client = await getClient();
  const hsl = hexToHSL(client.brand_color || '');
  return (
    <div
      style={
        {
          "--nextui-primary": `${hsl.h} ${hsl.s}% ${hsl.l}%`,
        } as React.CSSProperties
      }
    >
      <ClientSession />
      <ClientProvider client={client}>{children}</ClientProvider>
    </div>
  );
}
