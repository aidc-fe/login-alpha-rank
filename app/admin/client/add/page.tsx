"use client";

import { toastApi } from "@/components/ui/toaster";
import request from "@/lib/request";
import { Breadcrumbs, BreadcrumbItem } from "@nextui-org/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ClientForm from "@/components/admin/ClientForm";

export default function CreateClient() {
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    return request("/api/client", {
      method: "POST",
      body: JSON.stringify(data),
    }).then(() => {
      toastApi.success("Create Success");
      router.push("/admin/client");
    });
  };

  return (
    <>
      <Breadcrumbs>
        <BreadcrumbItem>
          <Link href="/admin/client">My Client</Link>
        </BreadcrumbItem>
        <BreadcrumbItem>Create Client</BreadcrumbItem>
      </Breadcrumbs>
      <div className="w-full font-semibold text-2xl mt-4 self-start h-10">
        <span>Create Client</span>
      </div>
      <ClientForm
        mode="create" 
        onSubmit={handleSubmit}
      />
    </>
  );
}
