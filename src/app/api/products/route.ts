import { NextResponse } from 'next/server';
import productData from '@/data/products.json';

export async function GET() {
  return NextResponse.json(productData.products);
}
