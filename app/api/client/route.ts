import { NextRequest, NextResponse } from "next/server";

// 新建client
export function POST(request: NextRequest) {
  return NextResponse.json({});
}

// 修改client
export function PUT(request: NextRequest) {
  return NextResponse.json({});
}

// 查询所有client列表
export function GET() {
  return NextResponse.json([]);
}
