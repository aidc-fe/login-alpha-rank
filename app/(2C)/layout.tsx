import request from "@/lib/request";
import ClientProvider from "@/providers/client-provider";
import { headers } from "next/headers";

async function getClient() {
  const hostname = headers().get("host");
  // 本地开发需要将这里写死地址
  const baseUrl = `https://${hostname}`;
  const client = await request(`${baseUrl}/api/client/get_by_domain/${hostname}`, {
    cache: "force-cache"
  });
  const businessDomainRes = await request(`${baseUrl}/api/businessDomain/${client.businessDomainId}`, {
    cache: "force-cache"
  });
  return { ...client, isSSO: businessDomainRes.sso };
}

export async function generateMetadata() {
  const client = await getClient();
  return {
    title: client.title,
    description: client.description,
    icons: {
      icon: client.favicon
    }
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const client = await getClient();

  return (
    <ClientProvider client={client}>{children}</ClientProvider>
  );
}
