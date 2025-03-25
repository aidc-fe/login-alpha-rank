"use client";

import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { FilePenLine } from "lucide-react";
import { Breadcrumbs, BreadcrumbItem, Button } from "@nextui-org/react";
import Link from "next/link";
import dayjs from "dayjs";

import request from "@/lib/request";
import { ClientDataType } from "@/lib/admin";
import Loader from "@/components/ui/loader";
import ClientForm, { FormMode } from "@/components/admin/ClientForm";
import CopyButton from "@/components/CopyButton";

export default function ClientDetail({ params: { clientId } }: { params: { clientId: string } }) {
  const [mode, setMode] = useState<FormMode>("view");
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<ClientDataType>();

  const getDetail = () => {
    request(`/api/client/${clientId}`)
      .then(res => {
        setDetails(res);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    getDetail();
  }, []);

  const handleSubmit = async (data: any) => {
    return request(`/api/client/${clientId}`, {
      method: "POST",
      body: JSON.stringify(data),
    }).then(res => {
      toast.success("Update Success");
      setDetails(res);
      setMode("view");
    });
  };

  return (
    <>
      <Breadcrumbs>
        <BreadcrumbItem>
          <Link href="/admin/client">My Client</Link>
        </BreadcrumbItem>
        <BreadcrumbItem>{mode === "edit" ? "Edit" : "Detail"} Client</BreadcrumbItem>
      </Breadcrumbs>

      <div className="flex gap-4 mt-4 flex-col xl:gap-8 xl:flex-row">
        <div className="flex-auto">
          <div className="w-full flex items-center justify-between font-semibold text-2xl mb-2 self-start h-10">
            <span>{mode === "edit" ? "Edit" : "Detail"} Client</span>
            {mode === "view" && !loading ? (
              <Button startContent={<FilePenLine size={16} />} onClick={() => setMode("edit")}>
                Edit
              </Button>
            ) : null}
          </div>
          <Loader loading={loading}>
            {details ? (
              <ClientForm
                initialData={details}
                mode={mode}
                onCancel={() => setMode("view")}
                onSubmit={handleSubmit}
              />
            ) : null}
          </Loader>
        </div>

        {/* 右侧附加信息 */}
        {details ? (
          <div className="flex-shrink-0 order-1 flex flex-col gap-4 w-96 static xl:order-1 xl:sticky xl:top-24 xl:self-start z-0">
            <div className="text-2xl font-semibold">Additional Information</div>
            <div className="flex flex-col gap-2 pl-3">
              <div className="text-base text-foreground flex items-center">Client Id</div>
              <div className="text-sm leading-none text-muted break-all">
                <span className="leading-5">{details?.client_id}</span>
                <CopyButton textToCopy={details?.client_id} />
              </div>
            </div>
            <div className="flex flex-col gap-2 pl-3">
              <div className="text-base text-foreground flex items-center">Client Secret</div>
              <div className="text-sm leading-none text-muted break-all">
                <span className="leading-5">{details?.client_secret}</span>
                <CopyButton textToCopy={details?.client_secret} />
              </div>
            </div>
            <div className="flex flex-col gap-2 pl-3">
              <div className="text-base text-foreground flex items-center">Create Time</div>
              <div className="text-sm text-muted break-all">
                {dayjs(details?.created_at).format("YYYY-MM-DD HH:mm:ss")}
              </div>
            </div>
            <div className="flex flex-col gap-2 pl-3">
              <div className="text-base text-foreground flex items-center">Update Time</div>
              <div className="text-sm text-muted break-all">
                {dayjs(details?.updated_at).format("YYYY-MM-DD HH:mm:ss")}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
