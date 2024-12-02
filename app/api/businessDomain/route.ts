import { createBusinessDomain, getAllBusinessDomains } from "@/lib/database";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request:NextRequest){
  const data = await request.json();
  const { name, description, active, sso } = data;
  const newBusinessDomain = await createBusinessDomain(name, description, active, sso);
  return NextResponse.json(newBusinessDomain);
}

export async function GET(){
  const businessDomains = await getAllBusinessDomains();
  return NextResponse.json(businessDomains);
}