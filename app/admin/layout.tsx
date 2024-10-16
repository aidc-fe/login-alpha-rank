import Header from "@/components/admin/Layouts/Header";
import Sider from "@/components/admin/Layouts/Sider";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Alpha Rank Login",
  description: "Login to your Alpha Rank",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen">
      <Header />
      <Sider
        items={[
          {
            label: "Client Manage",
            key: "/admin/list",
          },
        ]}
      />
      <main className="pt-20 ml-64">
        <div className="p-5 min-h-[calc(100vh-80px)] flex flex-col">{children}</div>
      </main>
    </div>
  );
}
