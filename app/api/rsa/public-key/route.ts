import { NextResponse } from "next/server";
import { getRSAKeyPair } from "@/lib/rsa";

export async function GET() {
  const { publicKey } = getRSAKeyPair();
  return NextResponse.json({ publicKey });
}
