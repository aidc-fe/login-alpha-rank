import request from "@/lib/request";
import ClientProvider from "@/providers/client-provider";
import { headers } from "next/headers";

async function getClient() {
  const hostname = headers().get("host");
  const baseUrl = `${process.env.NODE_ENV === 'development' ? 'http' : 'https'}://${hostname}`;
  const client = await request(`${baseUrl}/api/client/get_by_domain/${process.env.NODE_ENV === 'development' ? `pre-login.text2go.ai` : hostname}`, {
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
