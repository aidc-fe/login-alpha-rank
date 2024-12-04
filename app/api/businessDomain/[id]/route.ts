import { NextRequest, NextResponse } from 'next/server';
import { getBusinessDomainById } from '@/lib/database';
import { formatSuccess } from '@/lib/request';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!id || typeof id !== 'string') {
    return NextResponse.json({ error: 'Invalid or missing id' }, { status: 400 });
  }

  try {
    const businessDomain = await getBusinessDomainById(id);
    if (!businessDomain) {
      return NextResponse.json({ error: 'Business domain not found' }, { status: 404 });
    }
    return NextResponse.json(formatSuccess({ data: businessDomain }));
  } catch (error) {
    console.error('Error fetching business domain:', error);
    return NextResponse.json({ error: 'Failed to fetch business domain' }, { status: 500 });
  }
}
