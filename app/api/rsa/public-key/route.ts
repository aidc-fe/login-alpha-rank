import { NextResponse } from "next/server";

export async function GET() {
  const publicKey = process.env.RSA_PUBLIC_KEY;
  if (!publicKey) {
    throw new Error("RSA public key not found in environment variables");
  }

  return NextResponse.json({ publicKey });
}
