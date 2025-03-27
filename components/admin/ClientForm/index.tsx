"use client";

import { Plus, Trash2 } from "lucide-react";
import { FormEventHandler, useEffect, useState } from "react";
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

import {
  scopeOptions,
  BusinessDomainDataType,
  ClientDataType,
  authMethodOptions,
} from "@/lib/admin";
import { cn } from "@/lib/utils";
import request from "@/lib/request";
import PasswordInput from "@/components/PasswordInput";

export type FormMode = "create" | "edit" | "view";

interface ClientFormProps {
  mode: FormMode;
  initialData?: ClientDataType;
  onSubmit: (data: any) => Promise<any>;
  onCancel?: () => void;
}

export default function ClientForm({ mode, initialData, onSubmit, onCancel }: ClientFormProps) {
  const [loading, setLoading] = useState(false);
  const [materials, setMaterials] = useState<
    Array<{ title: string; image: string; description: string }>
  >(initialData?.materials ?? []);
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
    request("/api/businessDomain").then(res => {
      setBusinessDomains(res);
    });
  };

  const handleSubmit: FormEventHandler<HTMLFormElement> = async e => {
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
    const redirect_uris = formData.getAll("redirect_uri").filter(uri => uri);

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
      mail_server_host: formData.get("mail_server_host"),
      mail_server_port: formData.get("mail_server_port"),
      mail_server_user: formData.get("mail_server_user"),
      mail_server_password: formData.get("mail_server_password"),
      mail_template_image: formData.get("mail_template_image"),
      login_methods: formData.getAll("login_methods"),
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
          id="business-domain"
          label={<label htmlFor="business-domain">业务域名</label>}
          required
          className="max-w-xs"
          defaultSelectedKeys={initialData?.businessDomainId ? [initialData.businessDomainId] : []}
          isDisabled={isReadOnly}
          name="businessDomainId"
        >
          {businessDomains.map(item => (
            <SelectItem key={item.id}>{item.name}</SelectItem>
          ))}
        </Select>

        <Input
          id="client-name"
          label={<label htmlFor="client-name">客户端名称</label>}
          value={initialData?.name}
          isReadOnly={isReadOnly}
          name="name"
          onChange={e => {
            // handleInputChange("name", e.target.value);
          }}
        />

        <Textarea
          id="client-description"
          label={<label htmlFor="client-description">描述</label>}
          value={initialData?.description}
          isReadOnly={isReadOnly}
          name="description"
          rows={2}
          onChange={e => {
            // handleInputChange("description", e.target.value);
          }}
        />

        <Input
          id="client-domain"
          label={<label htmlFor="client-domain">授权域名</label>}
          value={initialData?.auth_domain}
          isReadOnly={isReadOnly}
          name="auth_domain"
          onChange={e => {
            // handleInputChange("auth_domain", e.target.value);
          }}
        />

        <Input
          id="client-title"
          label={<label htmlFor="client-title">标题</label>}
          defaultValue={initialData?.title || ""}
          isReadOnly={isReadOnly}
          name="title"
        />

        <Input
          id="client-favicon"
          label={<label htmlFor="client-favicon">网站图标</label>}
          required
          defaultValue={initialData?.favicon || ""}
          isReadOnly={isReadOnly}
          name="favicon"
        />

        <div className="flex w-full items-center gap-2">
          <span className="capitalize text-sm">品牌颜色:</span>
          <label
            className="h-10 w-10 p-2 rounded-xl border-1 cursor-pointer relative"
            htmlFor="brand-color"
          >
            <Input
              id="brand-color"
              type="color"
              defaultValue={brandColor}
              isReadOnly={isReadOnly}
              name="brand_color"
              className="opacity-0 absolute inset-0 cursor-pointer"
            />
            <div className="w-full h-full rounded-lg" style={{ backgroundColor: brandColor }} />
          </label>
        </div>

        <Input
          id="client-signout-uri"
          label={<label htmlFor="client-signout-uri">登出URI</label>}
          defaultValue={initialData?.signout_uri || ""}
          isReadOnly={isReadOnly}
          name="signout_uri"
        />

        <Input
          id="client-mail-server-host"
          label={<label htmlFor="client-mail-server-host">邮件服务器主机</label>}
          defaultValue={initialData?.mail_server_host || ""}
          isReadOnly={isReadOnly}
          name="mail_server_host"
        />

        <Input
          id="client-mail-server-port"
          label={<label htmlFor="client-mail-server-port">邮件服务器端口</label>}
          defaultValue={initialData?.mail_server_port || ""}
          isReadOnly={isReadOnly}
          name="mail_server_port"
        />

        <Input
          id="client-mail-server-user"
          label={<label htmlFor="client-mail-server-user">邮件服务器用户名</label>}
          defaultValue={initialData?.mail_server_user || ""}
          isReadOnly={isReadOnly}
          name="mail_server_user"
        />

        <PasswordInput
          id="client-mail-server-password"
          label={<label htmlFor="client-mail-server-password">邮件服务器密码</label>}
          defaultValue={initialData?.mail_server_password || ""}
          isReadOnly={isReadOnly}
          name="mail_server_password"
        />

        <Input
          id="client-mail-template-image"
          label={<label htmlFor="client-mail-template-image">邮件模板图片</label>}
          defaultValue={initialData?.mail_template_image || ""}
          isReadOnly={isReadOnly}
          name="mail_template_image"
        />

        <CheckboxGroup
          id="client-login-methods"
          label={<label htmlFor="client-login-methods">登录方式</label>}
          defaultValue={initialData?.login_methods || []}
          isReadOnly={isReadOnly}
          name="login_methods"
        >
          {authMethodOptions.map((option: { value: string; label: string }) => (
            <Checkbox key={option.value} value={option.value}>
              {option.label}
            </Checkbox>
          ))}
        </CheckboxGroup>

        <CheckboxGroup
          id="client-scope"
          label={<label htmlFor="client-scope">权限范围</label>}
          defaultValue={initialData?.scope || []}
          isReadOnly={isReadOnly}
          name="scope"
        >
          {scopeOptions.map(scope => (
            <Checkbox key={scope} value={scope}>
              {scope}
            </Checkbox>
          ))}
        </CheckboxGroup>

        <div className="flex flex-col gap-2">
          <label htmlFor="client-redirect-uri">重定向URI</label>
          {redirectUris.map((uri, index) => (
            <div key={index} className="flex gap-2">
              <Input
                id={`client-redirect-uri-${index}`}
                value={uri}
                isReadOnly={isReadOnly}
                name="redirect_uri"
                onChange={e => {
                  const newUris = [...redirectUris];
                  newUris[index] = e.target.value;
                  setRedirectUris(newUris);
                }}
              />
              {!isReadOnly && (
                <Button
                  color="danger"
                  isDisabled={redirectUris.length === 1}
                  onClick={() => {
                    const newUris = redirectUris.filter((_, i) => i !== index);
                    setRedirectUris(newUris);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          {!isReadOnly && (
            <Button color="primary" onClick={() => setRedirectUris([...redirectUris, ""])}>
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="client-materials">素材</label>
          <Table aria-label="Materials table">
            <TableHeader>
              {(() => {
                const columns = [
                  <TableColumn key="title">标题</TableColumn>,
                  <TableColumn key="image">图片</TableColumn>,
                  <TableColumn key="description">描述</TableColumn>,
                ];
                if (!isReadOnly) {
                  columns.push(<TableColumn key="operation">操作</TableColumn>);
                }
                return columns;
              })()}
            </TableHeader>
            <TableBody>
              {materials.map((material, index) => {
                const row = (
                  <TableRow key={index}>
                    <TableCell>
                      <Input
                        id={`client-material-title-${index}`}
                        value={material.title}
                        isReadOnly={isReadOnly}
                        name="material_title"
                        onChange={e => {
                          const newMaterials = [...materials];
                          newMaterials[index] = {
                            ...newMaterials[index],
                            title: e.target.value,
                          };
                          setMaterials(newMaterials);
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        id={`client-material-image-${index}`}
                        value={material.image}
                        isReadOnly={isReadOnly}
                        name="material_image"
                        onChange={e => {
                          const newMaterials = [...materials];
                          newMaterials[index] = {
                            ...newMaterials[index],
                            image: e.target.value,
                          };
                          setMaterials(newMaterials);
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        id={`client-material-description-${index}`}
                        value={material.description}
                        isReadOnly={isReadOnly}
                        name="material_description"
                        onChange={e => {
                          const newMaterials = [...materials];
                          newMaterials[index] = {
                            ...newMaterials[index],
                            description: e.target.value,
                          };
                          setMaterials(newMaterials);
                        }}
                      />
                    </TableCell>
                  </TableRow>
                );

                if (!isReadOnly) {
                  row.props.children.push(
                    <TableCell key="operation">
                      <Button
                        color="danger"
                        isDisabled={materials.length === 1}
                        onClick={() => {
                          const newMaterials = materials.filter((_, i) => i !== index);
                          setMaterials(newMaterials);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  );
                }

                return row;
              })}
            </TableBody>
          </Table>
          {!isReadOnly && (
            <Button
              color="primary"
              onClick={() =>
                setMaterials([...materials, { title: "", image: "", description: "" }])
              }
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button color="danger" variant="light" onClick={onCancel}>
              取消
            </Button>
          )}
          <Button color="primary" isLoading={loading} type="submit">
            {mode === "create" ? "创建" : mode === "edit" ? "更新" : "确定"}
          </Button>
        </div>
      </div>
    </form>
  );
}
