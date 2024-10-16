import { findClientByClientId } from "@/lib/database";
import { formateError, formatSuccess } from "@/lib/request";
import { generateClientId, generateClientSecret } from "@/lib/secret";
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
  console.log(client_id, 'client_id');
  try {
    return NextResponse.json(
      formatSuccess({
        data: {
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
      })
    );
    const client = await findClientByClientId(client_id);
    return NextResponse.json(formatSuccess({ data: client }));
  } catch {
    return NextResponse.json(formateError({}));
  }
}
