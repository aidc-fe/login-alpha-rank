import { Client } from "@prisma/client";

export enum OPERATION_TYPE {
  CREATE = "add",
  EDIT = "update",
  DETAIL = "detail",
}

export enum SCOPE_OPTION {
  EMAIL = "email",
  OPENID = "openid",
  PROFILE = "profile",
  SHOPIFY = "shopify",
  SHOPLAZZA = "shoplazza",
}

export enum AUTH_METHOD {
  EMAIL = "MAGIC_LINK",
  PASSWORD = "ACCOUNT_PASSWORD",
  GOOGLE = "GOOGLE_OAUTH",
}

export const scopeOptions = [
  SCOPE_OPTION.EMAIL,
  SCOPE_OPTION.OPENID,
  SCOPE_OPTION.PROFILE,
  SCOPE_OPTION.SHOPIFY,
  SCOPE_OPTION.SHOPLAZZA,
]; //允许的权限范围。

export const authMethodOptions = [
  {
    label: "Magic Link",
    value: AUTH_METHOD.EMAIL,
  },
  {
    label: "Account Password",
    value: AUTH_METHOD.PASSWORD,
  },
  {
    label: "Google OAuth",
    value: AUTH_METHOD.GOOGLE,
  },
]; //允许的登录方式

export type ClientDataType = Omit<Client, "materials" | "redirect_uris" | "scope"> & {
  redirect_uris: string[];
  materials?: {
    description: string;
    title: string;
    image: string;
  }[];
  scope: string[];
};

export type BusinessDomainDataType = {
  id: string;
  name: string;
  description: string | null;
  created_at: Date;
  updated_at: Date;
  active: boolean;
  sso: boolean;
};
