import {
  findAccessToken,
  findClientByClientId,
  getAccountsByUserIdAndProviders,
  getUser,
} from "@/lib/database";
import { formateError, formatSuccess } from "@/lib/request";
import { encodeJwt } from "@/lib/secret";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const access_token = request.headers.get("access-token");

  console.log({ id, access_token });
  // 如果没有id或access_token则报错
  if (!access_token) {
    return NextResponse.json(formateError({}));
  }
  if (!id) {
    return NextResponse.json(formateError({ message: "没有id" }));
  }

  const user = await getUser({ id });

  console.log({ user });

  if (!user) {
    return NextResponse.json(formateError({}));
  }

  // 验证accessToken;并拿到scope
  try {
    const token = await findAccessToken(access_token);
    const client = await findClientByClientId(token.client_id);
    const scope = client.scope;

    const userInfo = {} as {
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
      shoplazza?: {
        access_token: string | null;
        refresh_token: string | null;
        expires_at: number | null;
        shop_domain: string | null;
        shop_domain_display: string | null;
        user_name: string | null;
      }[];
    };

    if (scope.includes("email")) {
      userInfo.email = { email: user?.email! };
    }

    if (scope.includes("openid")) {
      userInfo.openid = {
        id_token: encodeJwt({
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
      console.log({ userInfo });
    }

    if (scope.includes("shoplazza")) {
      const accounts = await getAccountsByUserIdAndProviders(id, ["shoplazza"]);
      userInfo.shoplazza = accounts.map((item) => {
        return {
          access_token: item.access_token,
          refresh_token: item.refresh_token,
          expires_at: item.expires_at,
          shop_domain: item.shop_domain,
          shop_domain_display: item.shop_domain_display,
          user_name: item.user_name,
        };
      });
    }

    return NextResponse.json(userInfo);
  } catch {
    return NextResponse.json(formateError({}));
  }
}
