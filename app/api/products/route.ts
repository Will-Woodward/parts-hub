import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/admin-auth';

const productSchema = z.object({
  partNumber: z.string().trim().min(1).max(100),
  manufacturer: z.string().trim().min(1).max(120),
  category: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  dateCode: z.string().optional().nullable(),
  packageType: z.string().optional().nullable(),
  moq: z.coerce.number().int().min(1).default(1),
  unitPriceFen: z.coerce.number().int().min(0),
  status: z.enum(['DRAFT','ACTIVE','HIDDEN','SOLD_OUT']).default('ACTIVE'),
  stockType: z.enum(['OWN','CONSIGNMENT']).default('OWN'),
  supplierName: z.string().optional().nullable(),
  physicalLocation: z.string().optional().nullable(),
  physicalQty: z.coerce.number().int().min(0).default(0),
  dateCodeNote: z.string().optional().nullable(),
  imageUrl: z.string().url().optional().or(z.literal('')),
});

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim();
  const products = await prisma.product.findMany({
    where: { status: 'ACTIVE', ...(q ? { OR: [{ partNumber: { contains: q, mode: 'insensitive' as const } }, { manufacturer: { contains: q, mode: 'insensitive' as const } }] } : {}) },
    include: { images: { orderBy: { sortOrder: 'asc' } }, inventory: true },
    orderBy: { updatedAt: 'desc' }, take: 100,
  });
  return NextResponse.json(products.map(({ inventory, ...p }) => ({ ...p, availableQty: inventory ? Math.max(0, inventory.physicalQty - inventory.reservedQty) : 0 })));
}

export async function POST(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const parsed = productSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const d = parsed.data;
  try {
    const product = await prisma.product.create({
      data: {
        partNumber: d.partNumber, manufacturer: d.manufacturer, category: d.category, description: d.description,
        dateCode: d.dateCode, packageType: d.packageType, moq: d.moq, unitPriceFen: d.unitPriceFen, status: d.status,
        images: d.imageUrl ? { create: [{ url: d.imageUrl }] } : undefined,
        inventory: { create: { stockType: d.stockType, supplierName: d.supplierName, physicalLocation: d.physicalLocation, physicalQty: d.physicalQty } },
      }, include: { inventory: true, images: true },
    });
    return NextResponse.json(product, { status: 201 });
  } catch { return NextResponse.json({ error: 'Part number already exists or data is invalid.' }, { status: 409 }); }
}
