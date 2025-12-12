import { NextRequest, NextResponse } from "next/server";

import { formateError, formatSuccess } from "@/lib/request";
import { createClient, getClients } from "@/lib/database";

function sanitizeClient<T extends Record<string, any>>(client: T) {
  const {
    support_email,
    mail_server_host,
    mail_server_port,
    mail_server_user,
    mail_server_password,
    ...safeClient
  } = client;
  return safeClient;
}

// 新建client
export async function POST(request: NextRequest) {
  const data = await request.json();
  const req = await createClient({
    ...data,
  });

  return NextResponse.json(formatSuccess({ data: sanitizeClient(req as any) }));
}

// 查询所有client列表
export async function GET(req: NextRequest, res: NextResponse) {
  const current = req.nextUrl.searchParams.get("current");
  const pageSize = req.nextUrl.searchParams.get("pageSize");

  const pageNumber = parseInt(current as string, 10);
  const itemsPerPage = parseInt(pageSize as string, 10);
  const skip = (pageNumber - 1) * itemsPerPage;

  try {
    const { clients, totalClients } = await getClients({
      skip,
      itemsPerPage,
    });

    return NextResponse.json(
      formatSuccess({
        data: {
          list: clients.map(c => sanitizeClient(c as any)),
          current: pageNumber,
          pageSize: itemsPerPage,
          totals: totalClients,
          totalPage: Math.ceil(totalClients / itemsPerPage),
        },
      })
    );
  } catch (error) {
    return NextResponse.json(
      formateError({
        code: "CLIENT_LIST_ERROR",
        message: error as string,
      })
    );
  }
}
