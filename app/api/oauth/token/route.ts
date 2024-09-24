import {
  createAccessToken,
  createRefreshToken,
  findAndUseAuthorizationCode,
  findClientByClientId,
} from "@/lib/database";
import { formateError, formatSuccess } from "@/lib/request";
import { generateTokens } from "@/lib/secret";
import { NextRequest, NextResponse } from "next/server";

// 返回accessToken
export async function POST(request: NextRequest) {
  const { client_id, client_secret, code } =
    ((await request.json()) as {
      client_id: string;
      client_secret: string;
      code: string;
    }) || {};

  try {
    const client = await findClientByClientId(client_id);

    if (client.client_secret !== client_secret) {
      return NextResponse.json(formateError({}));
    }

    // 查找并校验code的准确性
    try {
      // const authorizationCode = await findAndUseAuthorizationCode(code);
      // if (authorizationCode.client_id !== client_id) {
      //   return NextResponse.json(formateError({}));
      // }

      const { accessToken, refreshToken } = generateTokens(client_id);

      // try {
      //   // 数据库中插入 accessToken, refreshToken
      //   await createAccessToken({
      //     token: accessToken,
      //     client_id,
      //     refresh_token: refreshToken,
      //   });
      //   await createRefreshToken({ token: refreshToken, client_id });
      // } catch (e) {
      //   return NextResponse.json(formateError({}));
      // }

      return NextResponse.json(formatSuccess({ data: { accessToken } }));
    } catch {
      return NextResponse.json(formateError({}));
    }
  } catch {
    return NextResponse.json(formateError({}));
  }
}
