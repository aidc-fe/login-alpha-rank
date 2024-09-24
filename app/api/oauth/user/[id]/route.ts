import { findAccessToken, findClientByClientId } from "@/lib/database";
import { formateError } from "@/lib/request";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, params: { id: string }) {
  const { id } = params;
  const accessToken = request.headers.get("access-token");

  // 如果没有id或access_token则报错
  if (!accessToken) {
    return NextResponse.json(formateError({}));
  }
  if (!id) {
    return NextResponse.json(formateError({}));
  }

  // 验证accessToken;并拿到scope
  try {
    const token = await findAccessToken(accessToken);
    const client = await findClientByClientId(token.client_id);
  } catch {
    return NextResponse.json(formateError({}));
  }
}
