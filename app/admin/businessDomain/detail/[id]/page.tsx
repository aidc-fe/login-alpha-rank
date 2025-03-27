"use client";

import { toast } from "react-toastify";
import { FormEventHandler, useEffect, useState } from "react";
import { Input, Button, Textarea, Breadcrumbs, BreadcrumbItem, Switch } from "@nextui-org/react";
import Link from "next/link";
import dayjs from "dayjs";
import { FilePenLine } from "lucide-react";

import CopyButton from "@/components/CopyButton";
import request from "@/lib/request";
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

export default function BusinessDomainDetail({ params }: { params: { id: string } }) {
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
      toast.error(error.message || "Failed to fetch data");
    } finally {
      setPageLoading(false);
    }
  };

  const handleSubmit: FormEventHandler = async e => {
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
      toast.success("Update success");
    } catch (error: any) {
      toast.error(error.message || "Update failed");
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
              <form className="w-full" onSubmit={handleSubmit}>
                <div className="w-full flex items-center justify-between font-semibold text-2xl mb-2 self-start h-10">
                  <span>{isEdit ? "Update" : "Detail"} Business Domain</span>
                  {!isEdit ? (
                    <Button
                      startContent={<FilePenLine size={16} />}
                      type="button"
                      onClick={e => {
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
                    required
                    defaultValue={data?.name}
                    isReadOnly={!isEdit}
                    label="Name"
                    name="name"
                  />

                  <Textarea
                    defaultValue={data?.description || ""}
                    isReadOnly={!isEdit}
                    label="Description"
                    name="description"
                  />

                  <div className="flex gap-8">
                    <div className="flex items-center gap-2">
                      <Switch
                        defaultSelected={data?.active}
                        isDisabled={!isEdit}
                        name="active"
                        value="on"
                      />
                      <span>Active</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        defaultSelected={data?.sso}
                        isDisabled={!isEdit}
                        name="sso"
                        value="on"
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
                        <Button color="primary" isLoading={loading} type="submit">
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
                  <div className="text-sm leading-none text-muted break-all">
                    <span className="leading-5">{data?.id}</span>
                    <CopyButton textToCopy={data?.id} />
                  </div>
                </div>
                <div className="flex flex-col gap-2 pl-3">
                  <div className="text-base text-foreground flex items-center">Create Time</div>
                  <div className="text-sm text-muted break-all">
                    {dayjs(data?.created_at).format("YYYY-MM-DD HH:mm:ss")}
                  </div>
                </div>
                <div className="flex flex-col gap-2 pl-3">
                  <div className="text-base text-foreground flex items-center">Update Time</div>
                  <div className="text-sm text-muted break-all">
                    {dayjs(data?.updated_at).format("YYYY-MM-DD HH:mm:ss")}
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </Loader>
    </div>
  );
}
