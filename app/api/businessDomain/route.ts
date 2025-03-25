import { NextRequest, NextResponse } from "next/server";

import { createBusinessDomain, getAllBusinessDomains } from "@/lib/database";
import { formateError, formatSuccess } from "@/lib/request";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { name, description, active, sso } = data;

    const newBusinessDomain = await createBusinessDomain(name, description, active, sso);

    return NextResponse.json(
      formatSuccess({
        data: newBusinessDomain,
      })
    );
  } catch (error: any) {
    return NextResponse.json(
      formateError({
        message: error.message || "Failed to create business domain",
      })
    );
  }
}

export async function GET() {
  try {
    const businessDomains = await getAllBusinessDomains();

    return NextResponse.json(
      formatSuccess({
        data: businessDomains,
      })
    );
  } catch (error) {
    return NextResponse.json(formateError({ message: error as string }));
  }
}
