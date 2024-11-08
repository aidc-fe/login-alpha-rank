"use client";

import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toastApi } from "@/components/ui/toaster";
import request from "@/lib/request";
import { Copy, Plus, Trash2 } from "lucide-react";
import { FormEventHandler, useEffect, useState } from "react";
import {
  OPERATION_TYPE,
  scopeOptions,
  defaultClientInfo,
  ClientDataType,
} from "@/lib/admin";
import { upperFirst } from "lodash";
import { cn, copyToClipboard } from "@/lib/utils";
import dayjs from "dayjs";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Loader from "@/components/ui/loader";

export default function EditClient({
  params,
  searchParams,
}: {
  params: { operationType: OPERATION_TYPE };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const operationType = params.operationType;
  const clientId = searchParams.clientId as string;
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(
    operationType === OPERATION_TYPE.EDIT
  );
  const [details, setDetails] = useState<ClientDataType>();
  const [formData, setFormData] = useState<ClientDataType>(defaultClientInfo);

  const isEdit = operationType === OPERATION_TYPE.EDIT && clientId;
  const noEdit = operationType === "add" && !!details;

  const getDetail = () => {
    request(`/api/client/${clientId}`)
      .then((res) => {
        const { scope, redirect_uris, name, signout_uri, description } = res;
        setDetails(res);
        setFormData({
          redirect_uris,
          scope,
          name,
          signout_uri,
          description,
        });
      })
      .finally(() => {
        setDetailLoading(false);
      });
  };

  useEffect(() => {
    if (clientId && operationType === OPERATION_TYPE.EDIT) {
      getDetail();
    }
  }, []);

  const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    setLoading(true);
    const params = {
      ...formData,
    };
    request(`/api/client${isEdit ? `/${clientId}` : ""}`, {
      method: "POST",
      body: JSON.stringify(params),
    })
      .then((res) => {
        toastApi.success(`${upperFirst(operationType)} Success`);
        setDetails(res);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin/list">My Client</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{upperFirst(operationType)} Client</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Loader loading={detailLoading}>
        <div className="flex gap-4 mt-4 flex-col xl:gap-8 xl:flex-row">
          {!detailLoading ? (
            <>
              <form
                className="flex-auto flex flex-col gap-4 w-full max-w-7xl m-auto"
                onSubmit={handleSubmit}
              >
                <div className="font-semibold text-2xl mb-2 self-start">{`${upperFirst(
                  operationType
                )} Client`}</div>

                <div className="px-3 flex flex-col gap-4">
                  <Input
                    layout="vertical"
                    name="name"
                    readOnly={noEdit}
                    label="name"
                    placeholder="Please enter name"
                    required
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                    }}
                  />

                  <Textarea
                    name="description"
                    label="description"
                    readOnly={noEdit}
                    placeholder="Please enter your description"
                    value={formData.description}
                    onChange={(e) => {
                      setFormData({ ...formData, description: e.target.value });
                    }}
                  />

                  <div className="w-full flex flex-col gap-1">
                    <span className="capitalize text-sm">Redirect URL:</span>
                    <div className="bg-slate-100 rounded-xl px-4 py-6">
                      {formData.redirect_uris?.map((item, index) => (
                        <div
                          key={`redirect_uri${index}`}
                          className={cn(
                            "w-full grid grid-cols-[1fr_auto] gap-2 items-center mb-4",
                            {
                              "grid-cols-1": !index,
                            }
                          )}
                        >
                          <Input
                            className={`h-10`}
                            layout="vertical"
                            readOnly={noEdit}
                            placeholder="Please enter your Redirect URL"
                            value={item}
                            type="url"
                            pattern="^(https?|ftp)://.+"
                            onChange={(e) => {
                              const new_redirect_uris = [
                                ...(formData.redirect_uris ?? []),
                              ];
                              new_redirect_uris[index] = e.target.value;
                              setFormData({
                                ...formData,
                                redirect_uris: new_redirect_uris,
                              });
                            }}
                            required
                          />
                          <Button
                            size={"icon"}
                            variant={"secondary"}
                            className={cn({ hidden: !index || noEdit })}
                            onClick={() => {
                              const new_redirect_uris = [
                                ...(formData.redirect_uris ?? []),
                              ];
                              new_redirect_uris.splice(index, 1);
                              setFormData({
                                ...formData,
                                redirect_uris: new_redirect_uris,
                              });
                            }}
                          >
                            <Trash2 />
                          </Button>
                        </div>
                      ))}
                      {!noEdit ? (
                        <div className="text-right">
                          <Button
                            variant="outline"
                            type="button"
                            disabled={loading}
                            className="inline-flex items-center gap-1"
                            onClick={() =>
                              setFormData({
                                ...formData,
                                redirect_uris: [
                                  ...(formData.redirect_uris ?? []),
                                  "",
                                ],
                              })
                            }
                          >
                            <Plus size={20} />
                            Add
                          </Button>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <Input
                    label="signout url"
                    layout="vertical"
                    name="signout_uri"
                    readOnly={noEdit}
                    placeholder="Please enter signout url"
                    required
                    type="url"
                    pattern="^(https?|ftp)://.+"
                    value={formData.signout_uri}
                    onChange={(e) => {
                      setFormData({ ...formData, signout_uri: e.target.value });
                    }}
                  />

                  <div className="w-full text-left">
                    <div className="text-sm">Scope:</div>
                    <div className="flex items-center gap-4 mt-2">
                      {scopeOptions.map((key) => (
                        <div
                          className="inline-flex items-center gap-2"
                          key={key}
                        >
                          <Checkbox
                            id={key}
                            name="scope"
                            disabled={noEdit}
                            checked={formData.scope?.includes(key)}
                            onClick={() => {
                              if (formData.scope?.includes(key)) {
                                const new_scope = formData.scope.filter(
                                  (item) => item !== key
                                );
                                setFormData({ ...formData, scope: new_scope });
                              } else {
                                const new_scope = [
                                  ...(formData.scope ?? []),
                                  key,
                                ];
                                setFormData({ ...formData, scope: new_scope });
                              }
                            }}
                          />
                          <label>{key}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {!noEdit ? (
                  <div className="px-6 flex mt-8 w-full justify-end">
                    <Button variant={"default"} type="submit" loading={loading}>
                      {`${upperFirst(operationType)}`}
                    </Button>
                  </div>
                ) : null}
              </form>
              {operationType === OPERATION_TYPE.EDIT || details ? (
                <div className="flex-shrink-0 -order-1 flex flex-col gap-4 w-96 static xl:order-1 xl:sticky xl:top-24 xl:self-start z-0">
                  <div className="text-2xl font-semibold">
                    Additional Information
                  </div>
                  <div className="flex flex-col gap-2 pl-3">
                    <div className="text-base text-foreground flex items-center">
                      Client Id
                    </div>
                    <div className="text-sm leading-none text-muted-foreground break-all">
                      <span className="leading-5">{details?.client_id}</span>
                      <Button
                        className="p-0 w-5 h-5 ml-1"
                        variant="ghost"
                        icon={
                          <Copy className="text-muted-foreground" size={14} />
                        }
                        onClick={() => copyToClipboard(details?.client_id ?? '')}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 pl-3">
                    <div className="text-base text-foreground flex items-center">
                      Client Secret
                    </div>
                    <div className="text-sm leading-none text-muted-foreground break-all">
                      <span className="leading-5">{details?.client_secret}</span>
                      <Button
                        className="p-0 w-5 h-5 ml-1"
                        variant="ghost"
                        icon={
                          <Copy className="text-muted-foreground" size={14} />
                        }
                        onClick={() => copyToClipboard(details?.client_secret ?? '')}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 pl-3">
                    <div className="text-base text-foreground flex items-center">
                      Create Time
                    </div>
                    <div className="text-sm text-muted-foreground break-all">
                      {dayjs(details?.created_at).format("YYYY-MM-DD HH:mm:ss")}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 pl-3">
                    <div className="text-base text-foreground flex items-center">
                      Update Time
                    </div>
                    <div className="text-sm text-muted-foreground break-all">
                      {dayjs(details?.updated_at).format("YYYY-MM-DD HH:mm:ss")}
                    </div>
                  </div>
                </div>
              ) : null}
            </>
          ) : null}
        </div>
      </Loader>
    </>
  );
}
