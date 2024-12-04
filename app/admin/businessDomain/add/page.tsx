"use client";

import { toastApi } from "@/components/ui/toaster";
import request from "@/lib/request";
import { FormEventHandler, useState } from "react";
import {
  Input,
  Button,
  Textarea,
  Breadcrumbs,
  BreadcrumbItem,
  Switch,
} from "@nextui-org/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function EditClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit: FormEventHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      active: formData.get("active") === "on",
      sso: formData.get("sso") === "on",
    };

    try {
      await request("/api/businessDomain", {
        method: "POST",
        body: JSON.stringify(data),
      });
      toastApi.success("Created successfully");
      router.push("/admin/businessDomain");
    } catch (error) {
      toastApi.error("Creation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex-auto flex flex-col">
      <Breadcrumbs>
        <BreadcrumbItem>
          <Link href="/admin/businessDomain">Business Domain</Link>
        </BreadcrumbItem>
        <BreadcrumbItem className="capitalize">
          Add Business Domain
        </BreadcrumbItem>
      </Breadcrumbs>
      <div className="font-semibold text-2xl mt-4 mb-2 self-start h-10">
        <span>Add Business Domain</span>
      </div>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col mt-6 w-full min-h-full flex-auto"
      >
        <div className="flex flex-col gap-4">
          <Input label="Name" name="name" required />

          <Textarea label="Description" name="description" />

          <div className="flex gap-8">
            <div className="flex items-center gap-2">
              <Switch value="on" name="active" defaultSelected />
              <span>Active</span>
            </div>

            <div className="flex items-center gap-2">
              <Switch value="on" name="sso" />
              <span>Enable SSO</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button color="primary" type="submit" isLoading={loading}>
            Add
          </Button>
        </div>
      </form>
    </div>
  );
}
