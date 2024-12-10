"use client";

import Header from "@/components/admin/Layouts/Header";
import Sider from "@/components/admin/Layouts/Sider";
import { Loader } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const whiteList = ['yuyuqueenlovemyself@gmail.com'];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  useEffect(() => {
    // 检查是否在加载中
    if (status === 'loading') return;

    if (status === 'unauthenticated' || !whiteList.includes(session?.user?.email || '')) {
      router.replace('/');
    }
  }, [status, session?.user?.email]);

  if (status === 'loading') {
    return (
      <main className="h-full flex justify-center items-center w-full">
        <Loader size={60} className="text-primary animate-spin" />
      </main>
    )
  }

  if (status === 'unauthenticated' || !whiteList.includes(session?.user?.email || '')) {
    return null;
  }

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
