"use client";

import { Plus, Trash2 } from "lucide-react";
import { FormEventHandler, useEffect, useState } from "react";
import { scopeOptions, BusinessDomainDataType, ClientDataType } from "@/lib/admin";
import { cn } from "@/lib/utils";
import request from "@/lib/request";
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
  Select,
  SelectItem,
} from "@nextui-org/react";

export type FormMode = "create" | "edit" | "view";

interface ClientFormProps {
  mode: FormMode;
  initialData?: ClientDataType;
  onSubmit: (data: any) => Promise<any>;
  onCancel?: () => void;
}

export default function ClientForm({ mode, initialData, onSubmit, onCancel }: ClientFormProps) {
  const [loading, setLoading] = useState(false);
  const [materials, setMaterials] = useState<Array<{ title: string; image: string; description: string }>>(initialData?.materials ?? []);
  const [redirectUris, setRedirectUris] = useState<string[]>(initialData?.redirect_uris ?? [""]);
  const [brandColor, setBrandColor] = useState(initialData?.brand_color ?? "#000000");
  const [businessDomains, setBusinessDomains] = useState<BusinessDomainDataType[]>([]);

  const isReadOnly = mode === "view";

  useEffect(() => {
    getBusinessDomains();
    if (initialData) {
      setMaterials(initialData.materials || [{ title: "", image: "", description: "" }]);
      setRedirectUris(initialData.redirect_uris || [""]);
      setBrandColor(initialData.brand_color || "#000000");
    }
  }, [initialData]);

  const getBusinessDomains = () => {
    request("/api/businessDomain").then((res) => {
      setBusinessDomains(res);
    });
  };

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
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

    const scope = formData.getAll("scope");
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
      title: formData.get("title"),
      favicon: formData.get("favicon"),
      materials,
      scope,
      redirect_uris,
    };

    try {
      await onSubmit(params);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className="mt-8 flex-auto flex flex-col gap-4 w-full max-w-7xl m-auto"
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col gap-4">
        <Select
          label="Business Domain ID"
          className="max-w-xs"
          name="businessDomainId"
          isDisabled={isReadOnly}
          required
          defaultSelectedKeys={initialData?.businessDomainId ? [initialData.businessDomainId] : []}
        >
          {businessDomains.map((item) => (
            <SelectItem key={item.id}>{item.name}</SelectItem>
          ))}
        </Select>

        <Input
          name="name"
          label="Name"
          isReadOnly={isReadOnly}
          required
          defaultValue={initialData?.name}
        />

        <Textarea
          name="description"
          label="Description"
          rows={2}
          isReadOnly={isReadOnly}
          defaultValue={initialData?.description}
        />

        <Input
          name="auth_domain"
          label="Auth Domain"
          isReadOnly={isReadOnly}
          defaultValue={initialData?.auth_domain}
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
              isDisabled={isReadOnly}
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
          <div className="flex flex-col gap-4">
            <Table
              aria-label="Materials table"
              classNames={{
                wrapper: cn("border rounded-xl", {
                  "bg-content1": !isReadOnly,
                }),
              }}
            >
              <TableHeader>
                <TableColumn>Title</TableColumn>
                <TableColumn>Description</TableColumn>
                <TableColumn>Image Url</TableColumn>
                <TableColumn hidden={isReadOnly} width={65}>
                  Operation
                </TableColumn>
              </TableHeader>
              <TableBody>
                {materials.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Input
                        name="material_title"
                        isReadOnly={isReadOnly}
                        defaultValue={item.title}
                        isClearable={!isReadOnly}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        name="material_description"
                        isReadOnly={isReadOnly}
                        defaultValue={item.description}
                        isClearable={!isReadOnly}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        name="material_image"
                        isReadOnly={isReadOnly}
                        type="url"
                        defaultValue={item.image}
                        isClearable={!isReadOnly}
                      />
                    </TableCell>
                    <TableCell hidden={isReadOnly}>
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
            </Table>

            {!isReadOnly && (
              <div className="text-right">
                <Button
                  type="button"
                  startContent={<Plus size={20} />}
                  isDisabled={loading}
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

        <div className="w-full flex flex-col gap-1">
          <span className="capitalize text-sm">Redirect URL:</span>
          <div
            className={cn("flex flex-col gap-4 border border-border rounded-xl px-4 py-6")}
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
                  isReadOnly={isReadOnly}
                  defaultValue={item}
                  type="url"
                  pattern="^(https?|ftp)://.+"
                  required
                />
                <Button
                  isIconOnly
                  color="danger"
                  className={cn({ hidden: !index || isReadOnly })}
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
            {!isReadOnly && (
              <div className="text-right">
                <Button
                  type="button"
                  startContent={<Plus size={20} />}
                  isDisabled={loading}
                  onClick={() => setRedirectUris([...redirectUris, ""])}
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
          isReadOnly={isReadOnly}
          required
          type="url"
          pattern="^(https?|ftp)://.+"
          defaultValue={initialData?.signout_uri}
        />

        <Input
          name="tos_doc"
          label="Terms of Service URL"
          isReadOnly={isReadOnly}
          type="url"
          pattern="^(https?|ftp)://.+"
          defaultValue={initialData?.tos_doc}
        />

        <Input
          name="pp_doc"
          label="Privacy Policy URL"
          isReadOnly={isReadOnly}
          type="url"
          pattern="^(https?|ftp)://.+"
          defaultValue={initialData?.pp_doc}
        />

        <div className="flex flex-col gap-2">
          <label className="text-sm">Scope:</label>
          {!isReadOnly ? (
            <CheckboxGroup
              name="scope"
              orientation="horizontal"
              defaultValue={initialData?.scope ?? []}
            >
              {scopeOptions.map((key) => (
                <div className="inline-flex items-center gap-2" key={key}>
                  <Checkbox id={key} value={key}>
                    {key}
                  </Checkbox>
                </div>
              ))}
            </CheckboxGroup>
          ) : (
            <div className="text-sm text-muted-foreground leading-10">
              {initialData?.scope?.join(", ")}
            </div>
          )}
        </div>
      </div>

      {!isReadOnly && (
        <div className="flex mt-8 w-full justify-center xl:justify-end gap-3">
          {mode === "edit" && onCancel && (
            <Button type="button" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" isLoading={loading}>
            {mode === "create" ? "Add" : "Update"}
          </Button>
        </div>
      )}
    </form>
  );
} 