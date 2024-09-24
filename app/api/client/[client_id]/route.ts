import { findClientByClientId } from "@/lib/database";
import { formateError, formatSuccess } from "@/lib/request";
import { NextRequest, NextResponse } from "next/server";

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
    const client = await findClientByClientId(client_id);
    return NextResponse.json(formatSuccess({ data: client }));
  } catch {
    return NextResponse.json(formateError({}));
  }
}
