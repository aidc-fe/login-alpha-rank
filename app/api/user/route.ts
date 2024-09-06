import { NextRequest, NextResponse } from "next/server";

export function GET(request: NextRequest) {
  console.log(111, request);
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
  console.log(222, request);
  return NextResponse.json({});
}
