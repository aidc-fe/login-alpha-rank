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

    if (!client || client.client_secret !== client_secret) {
      return NextResponse.json(
        { message: "client_secret not match or client not found" },
        { status: 401 }
      );
    }

    // 查找并校验 code 的准确性
    const authorizationCode = await findAndUseAuthorizationCode(code);
    if (!authorizationCode || authorizationCode.client_id !== client_id) {
      return NextResponse.json(
        { message: "Invalid authorization code" },
        { status: 401 }
      );
    }

    // 生成 tokens
    const { access_token, refresh_token } = generateTokens(client_id);

    // 按顺序创建 refresh_token 和 access_token
    const createdRefreshToken = await createRefreshToken({
      token: refresh_token,
      client_id,
    });

    await createAccessToken({
      token: access_token,
      client_id,
      refresh_token: createdRefreshToken.token,
    });

    return NextResponse.json({ access_token, refresh_token });
  } catch (e: any) {
    console.error("Error creating tokens:", e);
    return NextResponse.json(
      { message: e.message || "Failed to create tokens" },
      { status: 500 }
    );
  }
}
