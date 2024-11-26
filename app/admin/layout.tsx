"use client";

import Header from "@/components/admin/Layouts/Header";
import Sider from "@/components/admin/Layouts/Sider";
import { useUpdateEffect } from "ahooks";
import type { Metadata } from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const { status } = useSession();
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace(`/`)
    }
  }, [status]);

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
