import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/admin-auth';
const schema = z.object({ manufacturer: z.string().min(1).optional(), category: z.string().nullable().optional(), description: z.string().nullable().optional(), dateCode: z.string().nullable().optional(), moq: z.number().int().min(1).optional(), unitPriceFen: z.number().int().min(0).optional(), status: z.enum(['DRAFT','ACTIVE','HIDDEN','SOLD_OUT']).optional(), physicalQty: z.number().int().min(0).optional(), reservedQty: z.number().int().min(0).optional(), stockType: z.enum(['OWN','CONSIGNMENT']).optional(), supplierName: z.string().nullable().optional(), physicalLocation: z.string().nullable().optional() });
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params; const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { physicalQty, reservedQty, stockType, supplierName, physicalLocation, ...productData } = parsed.data;
  try {
    const updated = await prisma.product.update({ where: { id }, data: { ...productData, inventory: { upsert: { create: { physicalQty: physicalQty ?? 0, reservedQty: reservedQty ?? 0, stockType: stockType ?? 'OWN', supplierName, physicalLocation }, update: { physicalQty, reservedQty, stockType, supplierName, physicalLocation } } } }, include: { inventory: true } });
    return NextResponse.json(updated);
  } catch { return NextResponse.json({ error: 'Product not found or update failed.' }, { status: 404 }); }
}
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  try { await prisma.product.update({ where: { id }, data: { status: 'HIDDEN' } }); return NextResponse.json({ ok: true }); }
  catch { return NextResponse.json({ error: 'Product not found.' }, { status: 404 }); }
}
