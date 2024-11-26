import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decodeJwt } from "@/lib/secret";
import { formateError, formatSuccess } from "@/lib/request";
import { createClient, getClients } from "@/lib/database";

const getClientsWhite = ['hedyli1018+39@gmail.com', 'yuyuqueenlovemyself@gmail.com'];

// 新建client
export async function POST(request: NextRequest) {
  const cookieStore = cookies();
  const user = await decodeJwt({
    token: cookieStore.get("next-auth.session-token")?.value,
    secret: process.env.NEXT_AUTH_SECRET!,
  });

  if (!user?.email) {
    return NextResponse.json(formateError({}));
  }

  const data = await request.json();

  const req = await createClient({
    ...data,
    owner_email: user.email, // 用户的email
  });
  return NextResponse.json(formatSuccess({ data: req }));
}

// 查询所有client列表
export async function GET(req: NextRequest, res: NextResponse) {
  const cookieStore = cookies();
  const user = await decodeJwt({
    token: cookieStore.get("next-auth.session-token")?.value,
    secret: process.env.NEXT_AUTH_SECRET!,
  });

  if (!user?.email) {
    return NextResponse.json(formateError({}));
  }

  const current = req.nextUrl.searchParams.get('current');
  const pageSize = req.nextUrl.searchParams.get('pageSize');

  const pageNumber = parseInt(current as string, 10);
  const itemsPerPage = parseInt(pageSize as string, 10);
  const skip = (pageNumber - 1) * itemsPerPage;

  try {
    const { clients, totalClients } = await getClients({
      email: getClientsWhite.includes(user.email) ? '' : user.email,
      skip,
      itemsPerPage,
    });

    return NextResponse.json(
      formatSuccess({
        data: {
          list: clients,
          current: pageNumber,
          pageSize: itemsPerPage,
          totals: totalClients,
          totalPage: Math.ceil(totalClients / itemsPerPage),
        },
      })
    );
  } catch (error) {
    return NextResponse.json(formateError({ message: error as string }));
  }
}
