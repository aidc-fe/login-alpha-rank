import { createAuthorizationCode, findClientByClientId } from "@/lib/database";
import { formateError } from "@/lib/request";
import { generateAuthorizationCode, generateHmac } from "@/lib/secret";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const client_id = request.nextUrl.searchParams.get("client_id") || "";
  const redirect_uri = request.nextUrl.searchParams.get("redirect_uri") || "";
  const state = request.nextUrl.searchParams.get("state") || "";
  const userId = request.nextUrl.searchParams.get("userId") || "";
  const systemDomain = request.nextUrl.searchParams.get("systemDomain") || "";
  // if (!client_id) {
  //   return NextResponse.json(formateError({}));
  // }
  try {
    // 查询client_id对应的client信息
    // const client = await findClientByClientId(client_id);
    // let redirect_uris = [];
    // try {
    //   redirect_uris = JSON.parse(client.redirect_uris);
    // } catch {
    //   return NextResponse.json(formateError({}));
    // }

    // // 如果redirect_uri不在配置的url中，则抛出异常或跳转到错误兜底页面
    // if (!redirect_uris.includes(redirect_uri)) {
    //   return NextResponse.json(formateError({}));
    // }

    // 生成授权码
    const code = generateAuthorizationCode();
    // 生成hmac
    const hmac = generateHmac(
      { code, state, userId, systemDomain, jumpFrom: "shoplazza" },
      ""
    );

    // 创建一条授权码数据
    try {
      // const authorizationCode = await createAuthorizationCode({
      //   code,
      //   client_id,
      //   redirect_uri,
      // });
      return NextResponse.redirect(
        // 带上request search
        `${redirect_uri}?hmac=${hmac}&code=${code}&state=${state}&userId=${userId}&systemDomain=${systemDomain}&jumpFrom=shoplazza`,
        302
      );
    } catch {
      return NextResponse.json(formateError({}));
    }
  } catch {
    return NextResponse.json(formateError({}));
  }
}
