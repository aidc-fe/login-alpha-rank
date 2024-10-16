import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  decodeJwt,
  generateClientId,
  generateClientSecret,
} from "@/lib/secret";
import { formatSuccess } from "@/lib/request";
import { createClient } from "@/lib/database";

// 新建client
export async function POST(request: NextRequest) {
  const cookieStore = cookies();
  const user = decodeJwt({
    token: cookieStore.get("next-auth.session-token")?.value,
    secret: process.env.NEXT_AUTH_SECRET!,
  });

  console.log(await request.json(), 1111111);

  return NextResponse.json(formatSuccess({
    data: true
  }));

  const data = await createClient({
    redirect_uris: [
      "https://pre-blog.alpha-rank.com/web/api/auth/callback/authorize",
    ], // 数组
    scope: ["email", "openid", "profile", "shopify", "shoplazza"], // 数组
    name: "app.alpha-rank",
    description: "app.alpha-rank",
    signout_uri: "https://pre-blog.alpha-rank.com/web/api/auth/callback/logout",
    owner_email: user.email, // 用户的email
  });
  console.log(data);
  return NextResponse.json(formatSuccess({ data }));
}

// 修改client
export function PUT(request: NextRequest) {
  return NextResponse.json(formatSuccess({
    data: true
  }));
}

// 查询所有client列表
export function GET() {
  return NextResponse.json(
    formatSuccess({
      data: {
        list: [
          {
            id: "1",
            client_id: generateClientId(),
            client_secret: generateClientSecret(),
            redirect_uris: [],
            grant_types: ["authorization_code"],
            scope: ["email", "openid"],
            created_at: Date.now(),
            updated_at: Date.now(),
            active: true,
            default: true,
            name: "name",
            description: "description",
          },
          {
            id: "2",
            client_id: generateClientId(),
            client_secret: generateClientSecret(),
            redirect_uris: [],
            grant_types: ["authorization_code"],
            scope: ["profile", "shopify", "shoplazza"],
            created_at: Date.now(),
            updated_at: Date.now(),
            active: true,
            default: false,
            name: "name",
            description: "description",
          },
          {
            id: "2",
            client_id: generateClientId(),
            client_secret: generateClientSecret(),
            redirect_uris: [],
            grant_types: ["authorization_code"],
            scope: ["profile", "shopify", "shoplazza"],
            created_at: Date.now(),
            updated_at: Date.now(),
            active: true,
            default: false,
            name: "name",
            description: "description",
          },
        ],
        currentPage: 1,
        pageSize: 10,
        totals: 3,
      },
    })
  );
}
