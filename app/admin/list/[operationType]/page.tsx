"use client";

import { toastApi } from "@/components/ui/toaster";
import request from "@/lib/request";
import { FilePenLine, Plus, Trash2 } from "lucide-react";
import { FormEventHandler, useEffect, useState } from "react";
import {
  OPERATION_TYPE,
  scopeOptions,
  defaultClientInfo,
  ClientDataType,
} from "@/lib/admin";
import { upperFirst } from "lodash";
import { cn } from "@/lib/utils";
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
import CopyButton from "@/components/CopyButton";
import { Input, Button, Checkbox ,Textarea} from "@nextui-org/react";

export default function EditClient({
  params,
  searchParams,
}: {
  params: { operationType: OPERATION_TYPE };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const operationType = params.operationType;
  const [canEdit, setCanEdit] = useState([OPERATION_TYPE.CREATE, OPERATION_TYPE.EDIT].includes(operationType));
  const clientId = searchParams.clientId as string;
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(!!clientId);
  const [details, setDetails] = useState<ClientDataType>();
  const [formData, setFormData] = useState<ClientDataType>(defaultClientInfo);

  const pageTitle = details || clientId ? (canEdit ? OPERATION_TYPE.EDIT : 'Detail' ) : OPERATION_TYPE.CREATE;

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
    if (clientId) {
      getDetail();
    }
  }, []);

  const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    setLoading(true);
    const params = {
      ...formData,
    };
    request(
      `/api/client${
        details?.client_id || clientId
          ? `/${clientId || details?.client_id}`
          : ""
      }`,
      {
        method: "POST",
        body: JSON.stringify(params),
      }
    )
      .then((res) => {
        toastApi.success(`${upperFirst(pageTitle)} Success`);
        setDetails(res);
        setCanEdit(false);
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
            <BreadcrumbPage>{upperFirst(pageTitle)} Client</BreadcrumbPage>
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
                <div className="w-full flex items-center justify-between font-semibold text-2xl mb-2 self-start">
                  <span>{`${upperFirst(pageTitle)} Client`}</span>
                  {!canEdit && details ? (
                    <Button
                      type="button"
                      startContent={<FilePenLine size={16} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setCanEdit(true);
                      }}
                    >
                      Edit
                    </Button>
                  ) : null}
                </div>

                <div className="px-3 flex flex-col gap-4">
                 
                <Input  
                  name="name"
                  readOnly={!canEdit}
                  label="Name"
                  required
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                  }}  
                />


                  <Textarea
                    name="description"
                    rows={2}
                    label="Description"
                    readOnly={!canEdit}
                    value={formData.description}
                    onChange={(e) => {
                      setFormData({ ...formData, description: e.target.value });
                    }}
                  />

                  <div
                    className={cn("flex flex-col gap-4", {
                      "border border-border rounded-xl px-4 py-6": canEdit,
                    })}
                  >
                    {formData.redirect_uris?.map((item, index) => (
                      <div
                        key={`redirect_uri${index}`}
                        className={cn(
                          "w-full grid grid-cols-[1fr_auto] gap-2 items-center",
                          {
                            "grid-cols-1": !index,
                          }
                        )}
                      >
                        <Input
                          readOnly={!canEdit}
                          label="Redirect URL"
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
                          isIconOnly
                          color="danger"
                          className={cn({ hidden: !index || !canEdit })}
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
                          <Trash2 size={20}/>
                        </Button>
                      </div>
                    ))}
                    {!!canEdit ? (
                      <div className="text-right">
                        <Button
                          type="button"
                          startContent={<Plus size={20} />}
                          disabled={loading}
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
                          Add
                        </Button>
                      </div>
                    ) : null}
                  </div>

                  <Input
                    label="Signout url"
                    name="signout_uri"
                    readOnly={!canEdit}
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
                    {canEdit ? <div className="flex items-center gap-4 mt-2">
                      {scopeOptions.map((key) => (
                        <div
                          className="inline-flex items-center gap-2"
                          key={key}
                        >
                          <Checkbox
                            onValueChange={(val) => {
                              setFormData({
                                ...formData,
                                scope: val
                                  ? [...(formData.scope ?? []), key]
                                  : formData.scope?.filter((item) => item !== key) ?? [],
                              });
                            }}
                            id={key}
                            name="scope"
                            checked={formData.scope?.includes(key)}
                          >
                            {key}
                          </Checkbox>
                        </div>
                      ))}
                    </div> : (
                      <div className="text-sm text-muted-foreground leading-10">
                        {formData.scope?.join(",")}
                      </div>
                    )}
                  </div>
                </div>
                {canEdit ? (
                  <div className="px-6 flex mt-8 w-full justify-center xl:justify-end gap-3">
                    {pageTitle !== OPERATION_TYPE.CREATE ? (
                      <Button
                        type="button"
                        onClick={() => {
                          setCanEdit(false);
                        }}
                      >
                        Cancel
                      </Button>
                    ) : null}
                    <Button  type="submit" isLoading={loading}>
                      {`${upperFirst(pageTitle)}`}
                    </Button>
                  </div>
                ) : null}
              </form>
              {details ? (
                <div className="flex-shrink-0 order-1 flex flex-col gap-4 w-96 static xl:order-1 xl:sticky xl:top-24 xl:self-start z-0">
                  <div className="text-2xl font-semibold">
                    Additional Information
                  </div>
                  <div className="flex flex-col gap-2 pl-3">
                    <div className="text-base text-foreground flex items-center">
                      Client Id
                    </div>
                    <div className="text-sm leading-none text-muted-foreground break-all">
                      <span className="leading-5">{details?.client_id}</span>
                      <CopyButton textToCopy={details?.client_id} />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 pl-3">
                    <div className="text-base text-foreground flex items-center">
                      Client Secret
                    </div>
                    <div className="text-sm leading-none text-muted-foreground break-all">
                      <span className="leading-5">
                        {details?.client_secret}
                      </span>
                      <CopyButton textToCopy={details?.client_secret} />
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
