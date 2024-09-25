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

    console.log("client", client);
    if (client.client_secret !== client_secret) {
      return NextResponse.json(formateError({}));
    }

    // 查找并校验code的准确性
    try {
      const authorizationCode = await findAndUseAuthorizationCode(code);
      console.log("authorizationCode", authorizationCode);
      if (authorizationCode.client_id !== client_id) {
        return NextResponse.json(formateError({}));
      }

      const { access_token, refresh_token } = generateTokens(client_id);

      console.log({ access_token, refresh_token });
      try {
        const refreshToken = await createRefreshToken({
          token: refresh_token,
          client_id,
        });

        // 数据库中插入 accessToken, refreshToken
        const accessToken = await createAccessToken({
          token: access_token,
          client_id,
          refresh_token,
        });

        console.log({ refreshToken, accessToken });
        return NextResponse.json({ access_token, refresh_token });
      } catch (e) {
        return NextResponse.json(formateError({}));
      }
    } catch {
      return NextResponse.json(formateError({}));
    }
  } catch {
    return NextResponse.json(formateError({}));
  }
}
