/**
 * 提供接口供接入方查询accessToken
 */
import {
  createAccessToken,
  createRefreshToken,
  findAndUseAuthorizationCode,
  findClientByClientId,
} from "@/lib/database";
import { generateTokens } from "@/lib/secret";
import { NextRequest, NextResponse } from "next/server";

// 定义请求体的类型
interface OAuthRequestBody {
  client_id: string;
  client_secret: string;
  code: string;
}

// 返回 accessToken
export async function POST(request: NextRequest) {
  try {
    const { client_id, client_secret, code }: OAuthRequestBody =
      (await request.json()) || {};

    const client = await findClientByClientId(client_id);

    if (client.client_secret !== client_secret) {
      throw { message: "client_secret not match" };
    }

    // 查找并校验 code 的准确性
    const authorizationCode = await findAndUseAuthorizationCode(code);
    if (authorizationCode.client_id !== client_id) {
      throw { message: "client_id not match" };
    }

    const { access_token, refresh_token } = generateTokens(client_id);

    // 并发创建 refresh_token 和 access_token
    await Promise.all([
      createRefreshToken({
        token: refresh_token,
        client_id,
      }),
      createAccessToken({
        token: access_token,
        client_id,
        refresh_token,
      }),
    ]);

    return NextResponse.json({ access_token, refresh_token });
  } catch (e) {
    return NextResponse.json(e, { status: 401 });
  }
}
