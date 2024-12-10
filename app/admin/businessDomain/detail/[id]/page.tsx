"use client";

import { toastApi } from "@/components/ui/toaster";
import request from "@/lib/request";
import { FormEventHandler, useEffect, useState } from "react";
import {
  Input,
  Button,
  Textarea,
  Breadcrumbs,
  BreadcrumbItem,
  Switch,
} from "@nextui-org/react";
import Link from "next/link";
import CopyButton from "@/components/CopyButton";
import dayjs from "dayjs";
import { FilePenLine } from "lucide-react";
import Loader from "@/components/ui/loader";

interface BusinessDomain {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  sso: boolean;
  created_at: string;
  updated_at: string;
}

export default function BusinessDomainDetail({
  params,
}: {
  params: { id: string };
}) {
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [data, setData] = useState<BusinessDomain | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await request(`/api/businessDomain/${params.id}`);
      setData(response);
    } catch (error: any) {
      toastApi.error(error.message || "Failed to fetch data");
    } finally {
      setPageLoading(false);
    }
  };

  const handleSubmit: FormEventHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const updateData = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      active: formData.get("active") === "on",
      sso: formData.get("sso") === "on",
    };

    try {
      const response = await request(`/api/businessDomain/${params.id}`, {
        method: "PUT",
        body: JSON.stringify(updateData),
      });
      setData(response);
      setIsEdit(false);
      toastApi.success("Update success");

    } catch (error: any) {
      toastApi.error(error.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <Breadcrumbs>
        <BreadcrumbItem>
          <Link href="/admin/businessDomain">Business Domain</Link>
        </BreadcrumbItem>
        <BreadcrumbItem className="capitalize">
          {isEdit ? "Update" : "Detail"} Business Domain
        </BreadcrumbItem>
      </Breadcrumbs>

      <Loader loading={pageLoading}>
        <div className="flex gap-4 mt-4 flex-col xl:gap-8 xl:flex-row">
          {!pageLoading ? (
            <>
              <form onSubmit={handleSubmit} className="w-full">
                <div className="w-full flex items-center justify-between font-semibold text-2xl mb-2 self-start h-10">
                  <span>{isEdit ? "Update" : "Detail"} Business Domain</span>
                  {!isEdit ? (
                    <Button
                      type="button"
                      startContent={<FilePenLine size={16} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setIsEdit(true);
                      }}
                    >
                      Edit
                    </Button>
                  ) : null}
                </div>
                <div className="space-y-4 mt-6">
                  <Input
                    label="Name"
                    name="name"
                    defaultValue={data?.name}
                    isReadOnly={!isEdit}
                    required
                  />

                  <Textarea
                    label="Description"
                    name="description"
                    defaultValue={data?.description || ""}
                    isReadOnly={!isEdit}
                  />

                  <div className="flex gap-8">
                    <div className="flex items-center gap-2">
                      <Switch
                        name="active"
                        value="on"
                        isDisabled={!isEdit}
                        defaultSelected={data?.active}
                      />
                      <span>Active</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        name="sso"
                        value="on"
                        isDisabled={!isEdit}
                        defaultSelected={data?.sso}
                      />
                      <span>Enable SSO</span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-4 mt-auto">
                    {isEdit ? (
                      <div className="px-6 flex mt-8 w-full justify-center xl:justify-end gap-3">
                        <Button type="button" onClick={() => setIsEdit(false)}>
                          Cancel
                        </Button>
                        <Button color="primary" type="submit" isLoading={loading}>
                          Update
                        </Button>
                      </div>
                    ) : null}
                  </div>
                </div>
              </form>
              <div className="flex-shrink-0 order-1 flex flex-col gap-4 w-96 static xl:order-1 xl:sticky xl:top-24 xl:self-start z-0">
                <div className="text-2xl font-semibold">Information</div>
                <div className="flex flex-col gap-2 pl-3">
                  <div className="text-base text-foreground flex items-center">
                    Business Domain Id
                  </div>
                  <div className="text-sm leading-none text-muted-foreground break-all">
                    <span className="leading-5">{data?.id}</span>
                    <CopyButton textToCopy={data?.id} />
                  </div>
                </div>
                <div className="flex flex-col gap-2 pl-3">
                  <div className="text-base text-foreground flex items-center">
                    Create Time
                  </div>
                  <div className="text-sm text-muted-foreground break-all">
                    {dayjs(data?.created_at).format("YYYY-MM-DD HH:mm:ss")}
                  </div>
                </div>
                <div className="flex flex-col gap-2 pl-3">
                  <div className="text-base text-foreground flex items-center">
                    Update Time
                  </div>
                  <div className="text-sm text-muted-foreground break-all">
                    {dayjs(data?.updated_at).format("YYYY-MM-DD HH:mm:ss")}
                  </div>
                </div>
              </div>
            </>
          ): null}
        </div>
      </Loader>
    </div>
  );
}
