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

export type ClientDataType = {
  businessDomainId:string;
  active?: boolean;
  client_id?: string;
  client_secret?: string;
  created_at?: string;
  description: string;
  grant_types?: string;
  name: string;
  owner_email: string;
  redirect_uris: string[];
  scope: string[];
  signout_uri: string;
  updated_at?: string;
  auth_domain: string;
  brand_color?: string;
  materials?: {
    description: string;
    title: string;
    image: string;
  }[];
  tos_doc?: string;
  pp_doc?: string;
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
