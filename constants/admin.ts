

export enum OPERATION_TYPE {
  CREATE = "create",
  EDIT = "edit",
}

export enum SCOPE_OPTION {
  EMAIL = "email",
  OPENID = "openid",
  PROFILE = "profile",
  SHOPIFY = "shopify",
  SHOPLAZZA = "shoplazza"
}

export const scopeOptions = [SCOPE_OPTION.EMAIL, SCOPE_OPTION.OPENID, SCOPE_OPTION.PROFILE, SCOPE_OPTION.SHOPIFY, SCOPE_OPTION.SHOPLAZZA]; //允许的权限范围。


export const defaultClientInfo = { redirect_uris: [""], scope: [], name: '', signout_url: '' };
