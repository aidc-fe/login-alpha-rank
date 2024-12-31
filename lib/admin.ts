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
    label: 'Magic Link',
    value: AUTH_METHOD.EMAIL,
  },
  {
    label: 'Account Password',
    value: AUTH_METHOD.PASSWORD,
  },
  {
    label: 'Google OAuth',
    value: AUTH_METHOD.GOOGLE,
  },
]; //允许的登录方式

export type ClientDataType = {
  businessDomainId:string;
  active?: boolean;
  title?: string;
  favicon?: string;
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
  mail_server_host: string;
  mail_server_port: string;
  mail_server_user: string;
  mail_server_password: string;
  mail_template_image?: string;
  login_methods: string[];
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
