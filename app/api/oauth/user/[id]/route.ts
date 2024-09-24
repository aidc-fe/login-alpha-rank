import { findAccessToken, findClientByClientId } from "@/lib/database";
import { formateError, formatSuccess } from "@/lib/request";
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
    // const token = await findAccessToken(accessToken);
    // const client = await findClientByClientId(token.client_id);
    return NextResponse.json(
      formatSuccess({
        data: {
          email: { email: "xushi.zt@alibaba-inc.com" },
          openid: {
            id_token:
              "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoieHVzaGkuenRAYWxpYmFiYS1pbmMuY29tIiwiZW1haWwiOiJ4dXNoaS56dEBhbGliYWJhLWluYy5jb20iLCJwaWN0dXJlIjpudWxsLCJzdWIiOiJjbTFlYzZiazcwMDAwbW4yamEwZDAzdmcyIiwiaWF0IjoxNzI3MDU1NDc4LCJleHAiOjE3Mjk2NDc0Nzh9.uUbApZhKv7qreGcgdjEEQ0hQUNXJp0dJ6K1KIfyKNgE",
          },
          profile: {
            name: "xushi.zt@alibaba-inc.com",
            image: null,
            sub: "cm1ec6bk70000mn2ja0d03vg2",
            from: "shoplazza",
          },
          shoplazza: [
            {
              access_token: "uNPhmgHfeOlfhyWDPG70SilrRbsGvJyL1OuxnSA7y6U",
              shop_domain: "alpharank.myshoplaza.com",
            },
          ],
        },
      })
    );
  } catch {
    return NextResponse.json(formateError({}));
  }
}
