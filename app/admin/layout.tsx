"use client";

import Header from "@/components/admin/Layouts/Header";
import Sider from "@/components/admin/Layouts/Sider";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const whiteList = ['hedyli1018+39@gmail.com', 'yuyuqueenlovemyself@gmail.com'];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const { data } = useSession();
  
  useEffect(() => {
    if (data && (!data?.user?.email || !whiteList.includes(data?.user?.email))) {
      router.replace(`/`)
    }
  }, [data?.user?.email]);

  return (
    <div className="min-h-screen">
      <Header />
      <Sider
        items={[
          {
            label: "Client Manage",
            key: "/admin/client",
          },
          {
            label: "Business Domain Manage",
            key: "/admin/businessDomain",
          }
        ]}
      />
      <main className="pt-20 ml-64">
        <div className="p-5 min-h-[calc(100vh-80px)] flex flex-col">{children}</div>
      </main>
    </div>
  );
}
