import { NextRequest, NextResponse } from "next/server";

import { findClientByClientId, updateClient } from "@/lib/database";
import { formateError, formatSuccess } from "@/lib/request";

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: { client_id: string };
  }
) {
  const { client_id } = params;

  try {
    // 查询数据库，获取客户端详情
    const client = await findClientByClientId(client_id);

    // 如果客户端不存在，返回错误
    if (!client) {
      return NextResponse.json(
        formateError({
          code: "CLIENT_NOT_FOUND",
          message: "Client not found",
        }),
        {
          status: 404,
        }
      );
    }

    // 返回客户端详情
    return NextResponse.json(formatSuccess({ data: client }));
  } catch (error) {
    return NextResponse.json(
      formateError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Internal Server Error",
      }),
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  {
    params,
  }: {
    params: { client_id: string };
  }
) {
  const { client_id } = params;
  const updateData = await request.json();

  try {
    const updatedClient = await updateClient({
      client_id,
      ...updateData,
    });

    return NextResponse.json(formatSuccess({ data: updatedClient }));
  } catch (error) {
    return NextResponse.json(
      formateError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Internal Server Error",
      })
    );
  }
}
