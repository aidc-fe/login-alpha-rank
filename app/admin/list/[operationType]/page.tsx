"use client";

import { toastApi } from "@/components/ui/toaster";
import request from "@/lib/request";
import { FilePenLine, Plus, Trash2 } from "lucide-react";
import { FormEventHandler, useEffect, useState } from "react";
import {
  OPERATION_TYPE,
  scopeOptions,
  ClientDataType,
  BusinessDomainDataType,
} from "@/lib/admin";
import { upperFirst } from "lodash";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import Loader from "@/components/ui/loader";
import CopyButton from "@/components/CopyButton";
import {
  Input,
  Button,
  CheckboxGroup,
  Checkbox,
  Textarea,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Breadcrumbs,
  BreadcrumbItem,
  Select,
  SelectItem,
} from "@nextui-org/react";
import Link from "next/link";

export default function EditClient({
  params,
  searchParams,
}: {
  params: { operationType: OPERATION_TYPE };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const operationType = params.operationType;
  const [canEdit, setCanEdit] = useState(
    [OPERATION_TYPE.CREATE, OPERATION_TYPE.EDIT].includes(operationType)
  );
  const clientId = searchParams.clientId as string;
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(!!clientId);
  const [details, setDetails] = useState<ClientDataType>();

  const [materials, setMaterials] = useState<
    Array<{ title: string; image: string; description: string }>
  >([{ title: "", image: "", description: "" }]);
  const [redirectUris, setRedirectUris] = useState<string[]>([""]);
  const [brandColor, setBrandColor] = useState(
    details?.brand_color || "#000000"
  );
  const [businessDomains, setBusinessDomains] = useState<
    BusinessDomainDataType[]
  >([]);

  const pageTitle =
    details || clientId
      ? canEdit
        ? OPERATION_TYPE.EDIT
        : "Detail"
      : OPERATION_TYPE.CREATE;

  const getDetail = () => {
    request(`/api/client/${clientId}`)
      .then((res) => {
        const { brand_color, materials, redirect_uris } = res;
        setDetails(res);
        setMaterials(materials || []);
        setBrandColor(brand_color);
        setRedirectUris(redirect_uris || [""]);
      })
      .finally(() => {
        setDetailLoading(false);
      });
  };

  const getBusinessDomains = () => {
    request("/api/businessDomain").then((res) => {
      setBusinessDomains(res);
    });
  };

  useEffect(() => {
    if (clientId) {
      getDetail();
    }
    getBusinessDomains();
  }, []);

  const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    setLoading(true);

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    // 处理materials数据
    const materials = [];
    const titles = formData.getAll("material_title");
    const images = formData.getAll("material_image");
    const descriptions = formData.getAll("material_description");

    for (let i = 0; i < titles.length; i++) {
      materials.push({
        title: titles[i],
        image: images[i],
        description: descriptions[i],
      });
    }

    // 处理scope数据
    const scope = formData.getAll("scope");

    // 处理redirect_uris数据
    const redirect_uris = formData.getAll("redirect_uri").filter((uri) => uri);

    const params = {
      businessDomainId: formData.get("businessDomainId"),
      name: formData.get("name"),
      description: formData.get("description"),
      auth_domain: formData.get("auth_domain"),
      brand_color: formData.get("brand_color"),
      tos_doc: formData.get("tos_doc"),
      pp_doc: formData.get("pp_doc"),
      signout_uri: formData.get("signout_uri"),
      materials,
      scope,
      redirect_uris,
    };

    // 当clientId存在时，表示是编辑，否则是新建
    const url = clientId ? `/api/client/${clientId}` : "/api/client";

    request(url, {
      method: "POST",
      body: JSON.stringify(params),
    })
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
      <Breadcrumbs>
        <BreadcrumbItem>
          <Link href="/admin/list">My Client</Link>
        </BreadcrumbItem>
        <BreadcrumbItem className="capitalize">
          {pageTitle} Client
        </BreadcrumbItem>
      </Breadcrumbs>
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
                  <Select
                    label="Business Domain ID"
                    className="max-w-xs"
                    name="businessDomainId"
                    isDisabled={!canEdit}
                    required
                    defaultSelectedKeys={
                      details?.businessDomainId
                        ? [details.businessDomainId]
                        : []
                    }
                  >
                    {businessDomains.map((item) => (
                      <SelectItem key={item.id}>{item.name}</SelectItem>
                    ))}
                  </Select>
                  <Input
                    name="name"
                    label="Name"
                    readOnly={!canEdit}
                    required
                    defaultValue={details?.name}
                  />

                  <Textarea
                    name="description"
                    label="Description"
                    rows={2}
                    readOnly={!canEdit}
                    defaultValue={details?.description}
                  />

                  <Input
                    name="auth_domain"
                    label="Auth Domain"
                    readOnly={!canEdit}
                    defaultValue={details?.auth_domain}
                  />

                  <div className="flex w-full items-center gap-2">
                    <span className="capitalize text-sm">Brand Color:</span>
                    <label
                      htmlFor="brand_color"
                      className="h-10 w-10 p-2 rounded-xl border-1 cursor-pointer relative"
                    >
                      <Input
                        id="brand_color"
                        label="Brand Color"
                        type="color"
                        name="brand_color"
                        disabled={!canEdit}
                        value={brandColor}
                        onChange={(e) => setBrandColor(e.target.value)}
                        className="absolute inset-0 pointer-events-none opacity-0"
                      />
                      <div
                        className="rounded-md w-full h-full"
                        style={{ backgroundColor: brandColor }}
                      />
                    </label>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="capitalize text-sm">Materials:</div>
                    <div className={cn("flex flex-col gap-4")}>
                      <Table
                        aria-label="Materials table"
                        classNames={{
                          wrapper: cn("border rounded-xl", {
                            "bg-content1": canEdit,
                          }),
                        }}
                      >
                        <TableHeader>
                          <TableColumn>Title</TableColumn>
                          <TableColumn>Description</TableColumn>
                          <TableColumn>Image Url</TableColumn>
                          <TableColumn hidden={!canEdit} width={65}>
                            Operation
                          </TableColumn>
                        </TableHeader>
                        {materials.length ? (
                          <TableBody>
                            {materials.map((item, index) => (
                              <TableRow key={index}>
                                <TableCell>
                                  <Input
                                    name="material_title"
                                    readOnly={!canEdit}
                                    defaultValue={item.title}
                                    isClearable={canEdit}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Input
                                    name="material_description"
                                    readOnly={!canEdit}
                                    defaultValue={item.description}
                                    isClearable={canEdit}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Input
                                    name="material_image"
                                    readOnly={!canEdit}
                                    type="url"
                                    pattern="^(https?|ftp)://.+"
                                    defaultValue={item.image}
                                    isClearable={canEdit}
                                  />
                                </TableCell>
                                <TableCell hidden={!canEdit}>
                                  <Button
                                    isIconOnly
                                    color="danger"
                                    variant="light"
                                    onClick={() => {
                                      const newMaterials = [...materials];
                                      newMaterials.splice(index, 1);
                                      setMaterials(newMaterials);
                                    }}
                                  >
                                    <Trash2 size={20} />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        ) : (
                          <></>
                        )}
                      </Table>

                      {canEdit && (
                        <div className="text-right">
                          <Button
                            type="button"
                            startContent={<Plus size={20} />}
                            disabled={loading}
                            onClick={() =>
                              setMaterials([
                                ...materials,
                                { title: "", description: "", image: "" },
                              ])
                            }
                          >
                            Add Material
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <Input
                    name="tos_doc"
                    label="Terms of Service URL"
                    readOnly={!canEdit}
                    type="url"
                    pattern="^(https?|ftp)://.+"
                    defaultValue={details?.tos_doc}
                  />

                  <Input
                    name="pp_doc"
                    label="Privacy Policy URL"
                    readOnly={!canEdit}
                    type="url"
                    pattern="^(https?|ftp)://.+"
                    defaultValue={details?.pp_doc}
                  />

                  <div className="w-full flex flex-col gap-1">
                    <span className="capitalize text-sm">Redirect URL:</span>
                    <div
                      className={cn("flex flex-col gap-4", {
                        "border border-border rounded-xl px-4 py-6": canEdit,
                      })}
                    >
                      {redirectUris.map((item, index) => (
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
                            name="redirect_uri"
                            readOnly={!canEdit}
                            defaultValue={item}
                            type="url"
                            pattern="^(https?|ftp)://.+"
                            required
                          />
                          <Button
                            isIconOnly
                            color="danger"
                            className={cn({ hidden: !index || !canEdit })}
                            onClick={() => {
                              const newUris = [...redirectUris];
                              newUris.splice(index, 1);
                              setRedirectUris(newUris);
                            }}
                          >
                            <Trash2 size={20} />
                          </Button>
                        </div>
                      ))}
                      {canEdit && (
                        <div className="text-right">
                          <Button
                            type="button"
                            startContent={<Plus size={20} />}
                            disabled={loading}
                            onClick={() =>
                              setRedirectUris([...redirectUris, ""])
                            }
                          >
                            Add
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <Input
                    name="signout_uri"
                    label="Signout URL"
                    readOnly={!canEdit}
                    required
                    type="url"
                    pattern="^(https?|ftp)://.+"
                    defaultValue={details?.signout_uri}
                  />

                  <div className="w-full text-left">
                    <div className="text-sm">Scope:</div>
                    {canEdit ? (
                      <div className="mt-2">
                        <CheckboxGroup
                          name="scope"
                          orientation="horizontal"
                          defaultValue={details?.scope ?? []}
                        >
                          {scopeOptions.map((key) => (
                            <div
                              className="inline-flex items-center gap-2"
                              key={key}
                            >
                              <Checkbox id={key} value={key}>
                                {key}
                              </Checkbox>
                            </div>
                          ))}
                        </CheckboxGroup>
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground leading-10">
                        {details?.scope?.join(",")}
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
                    <Button type="submit" isLoading={loading}>
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
