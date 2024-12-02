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
  business_domain_id?: string;
  active?: boolean;
  client_id?: string;
  client_secret?: string;
  created_at?: string;
  description?: string;
  grant_types?: string;
  name?: string;
  owner_email?: string;
  redirect_uris?: string[];
  scope?: string[];
  signout_uri?: string;
  updated_at?: string;
  auth_domain?: string;
  brand_color?: string;
  materials?: {
    description: string;
    title: string;
    image: string;
  }[];
  tos_doc?: string;
  pp_doc?: string;
}

export const defaultClientInfo: ClientDataType = {
  redirect_uris: [""],
  scope: [],
  name: "",
  signout_uri: "",
  description: "",
  auth_domain: '',
  brand_color: '',
  materials: [{
    description: "",
    title: "",
    image: ""
  }],
  tos_doc: '',
  pp_doc: '',
};
