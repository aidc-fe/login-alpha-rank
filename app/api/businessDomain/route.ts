import { createBusinessDomain, getAllBusinessDomains } from "@/lib/database";
import { formateError, formatSuccess } from "@/lib/request";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request:NextRequest){
  const data = await request.json();
  const { name, description, active, sso } = data;
  const newBusinessDomain = await createBusinessDomain(name, description, active, sso);
  return NextResponse.json(newBusinessDomain);
}

export async function GET(){
 try {
  const businessDomains = await getAllBusinessDomains();
  return NextResponse.json(formatSuccess({
    data: businessDomains
  }));
 } catch (error) {
  return NextResponse.json(formateError({ message: error as string }));
 }
}