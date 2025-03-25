import { User } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import {
  findAccessToken,
  findClientByClientId,
  getAccountsByUserIdAndProviders,
  getUser,
} from "@/lib/database";
import { encodeJwt } from "@/lib/secret";

type UserInfoType = {
  email?: { email: string };
  profile?: {
    name?: string | null;
    image: string | null;
    sub: string;
    from?: string | null;
  };
  openid?: {
    id_token: string;
  };
  shoplazza?: Partial<{
    access_token: string | null;
    refresh_token: string | null;
    expires_at: number | null;
    shop_domain: string | null;
    shop_domain_display: string | null;
    user_name: string | null;
  }>[];
};

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const access_token = request.headers.get("access-token");

    // 参数校验
    if (!access_token) {
      return NextResponse.json({ message: "access_token missing" }, { status: 400 });
    }
    if (!id) {
      return NextResponse.json({ message: "user id missing" }, { status: 400 });
    }

    // 获取用户信息
    const user = (await getUser({ id })) as User;

    if (!user) {
      return NextResponse.json({ message: "user not exist" }, { status: 404 });
    }

    // 验证 Access Token 并获取 scope
    const token = await findAccessToken(access_token);
    const client = await findClientByClientId(token.client_id);
    const scope = client.scope;

    const userInfo: UserInfoType = {};

    // 处理不同的 scope
    if (scope.includes("email")) {
      userInfo.email = { email: user.email };
    }

    if (scope.includes("openid")) {
      userInfo.openid = {
        id_token: await encodeJwt({
          token: {
            email: user.email,
            name: user.name,
            image: user.image,
            sub: user.id,
            from: user.from,
          },
          secret: process.env.NEXT_AUTH_SECRET!,
        }),
      };
    }

    if (scope.includes("profile")) {
      userInfo.profile = {
        name: user.name,
        image: user.image,
        sub: user.id,
        from: user.from,
      };
    }

    if (scope.includes("shoplazza")) {
      const accounts = await getAccountsByUserIdAndProviders(id, ["shoplazza"]);

      userInfo.shoplazza = accounts.map(item => ({
        access_token: item.access_token,
        refresh_token: item.refresh_token,
        expires_at: item.expires_at,
        shop_domain: item.shop_domain,
        shop_domain_display: item.shop_domain_display,
        user_name: item.user_name,
      }));
    }

    return NextResponse.json(userInfo);
  } catch (e: any) {
    return NextResponse.json({ message: e.message || "Error fetching user info" }, { status: 500 });
  }
}
