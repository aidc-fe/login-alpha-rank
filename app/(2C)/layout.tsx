import ClientProvider from "@/providers/client-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <ClientProvider>{children}</ClientProvider>
  );
}
