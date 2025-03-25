import { NextRequest, NextResponse } from "next/server";

import { formateError, formatSuccess } from "@/lib/request";
import { createClient, getClients } from "@/lib/database";

// 新建client
export async function POST(request: NextRequest) {
  const data = await request.json();
  const req = await createClient({
    ...data,
  });

  return NextResponse.json(formatSuccess({ data: req }));
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
