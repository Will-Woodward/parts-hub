import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/admin-auth';
export async function GET(request: NextRequest) {
 if(!isAdmin(request)) return NextResponse.json({error:'Unauthorized'},{status:401});
 const rows=await prisma.product.findMany({include:{inventory:true},orderBy:{updatedAt:'desc'},take:500});
 return NextResponse.json(rows);
}
