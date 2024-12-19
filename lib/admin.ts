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

export const scopeOptions = [
  SCOPE_OPTION.EMAIL,
  SCOPE_OPTION.OPENID,
  SCOPE_OPTION.PROFILE,
  SCOPE_OPTION.SHOPIFY,
  SCOPE_OPTION.SHOPLAZZA,
]; //允许的权限范围。

export type ClientDataType = Omit<Client, "materials" | "redirect_uris" | "scope"> & {
  redirect_uris: string[];
  materials?: {
    description: string;
    title: string;
    image: string;
  }[];
  scope: string[];
}

export type BusinessDomainDataType = {
  id: string;
  name: string;
  description: string | null;
  created_at: Date;
  updated_at: Date;
  active: boolean;
  sso: boolean;
}
