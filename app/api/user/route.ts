import { NextRequest, NextResponse } from "next/server";

export function GET(request: NextRequest) {
  return NextResponse.json([
    {
      id: "",
      name: "",
      email: "",
      picture: "",
    },
  ]);
}

export function POST(request: NextRequest) {
  return NextResponse.json({});
}
