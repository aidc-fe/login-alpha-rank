import request from "@/lib/request";
import ClientProvider from "@/providers/client-provider";
import { headers } from "next/headers";

async function getClient() {
  const hostname = headers().get("host");
  const client = await request(`http://${hostname}/api/client/get_by_domain/${`pre-login.text2go.ai`}`, {
    cache: "force-cache"
  });
  const businessDomainRes = await request(`http://${hostname}/api/businessDomain/${client.businessDomainId}`, {
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
