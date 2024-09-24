import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { hmacValidator } from "@/lib/auth";
import { formateError } from "@/lib/request";
import { ERROR_CONFIG } from "@/constants/errors";

const scopes = [
  "read_product write_product",
  "read_collection",
  "write_collection",
  "read_script_tags",
  "write_script_tags",
  "read_app_proxy",
  "write_app_proxy",
  "read_data",
  "write_data",
  "read_shop",
  "read_comments",
  "write_comments",
  "read_shop_navigation",
  "write_shop_navigation",
  "read_search_api",
  "write_search_api",
  "read_themes",
  "unauthenticated_read_checkouts",
  "unauthenticated_write_checkouts",
  "unauthenticated_read_customers",
  "unauthenticated_write_customers",
  "unauthenticated_read_customer_tags",
  "unauthenticated_read_content",
  "unauthenticated_read_product_listings",
  "unauthenticated_read_product_tags",
  "unauthenticated_read_selling_plans",
];

export function GET(request: NextRequest) {
  // Validate HMAC
  if (!hmacValidator(request)) {
    return NextResponse.json(formateError(ERROR_CONFIG.AUTH.SHOPLAZZA.HMAC));
  }

  const shop = request.nextUrl.searchParams.get("shop");

  // 下面的几个参数暂时用不到
  const hmac = request.nextUrl.searchParams.get("hmac");
  const install_from = request.nextUrl.searchParams.get("install_from");
  const store_id = request.nextUrl.searchParams.get("store_id");

  // Generate a random state parameter
  const state = randomBytes(16).toString("hex");

  // Store the state in a way that you can verify it later
  // For example, you might store it in a session or database associated with the user

  return NextResponse.redirect(
    `https://${shop}/admin/oauth/authorize?client_id=${process.env
      .SHOPLAZZA_CLIENT_ID!}&scope=${scopes.join("+")}&redirect_uri=https://${
      process.env.BASE_DOMAIN
    }/api/auth/shoplazza/callback&response_type=code&state=${state}`,
    302
  );
}
