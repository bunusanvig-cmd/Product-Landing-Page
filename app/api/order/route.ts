import { NextRequest, NextResponse } from 'next/server';
import { createOrderId } from '@/lib/id';
import { fulfillOrder } from '@/lib/order-fulfillment';
import { getCorsHeaders, isAllowedOrigin } from '@/lib/cors';
import { getPricing, siteConfig } from '@/lib/site';
import { orderRequestSchema } from '@/lib/validation';
import type { StoredOrder } from '@/lib/types';

export const runtime = 'nodejs';

export async function OPTIONS(request: NextRequest) {
  if (!isAllowedOrigin(request)) {
    return NextResponse.json({ ok: false, error: 'Origin not allowed' }, { status: 403 });
  }

  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(request),
  });
}

export async function POST(request: NextRequest) {
  try {
    if (!isAllowedOrigin(request)) {
      return NextResponse.json(
        { ok: false, error: 'Origin not allowed' },
        { status: 403, headers: getCorsHeaders(request) },
      );
    }

    const payload = await request.json();
    const parsed = orderRequestSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: parsed.error.issues[0]?.message || 'Invalid order details',
        },
        { status: 400 },
      );
    }

    const pricing = getPricing(parsed.data.quantity);
    if (parsed.data.pricePerPiece !== pricing.unitPrice) {
      return NextResponse.json({ ok: false, error: 'Price per piece is invalid' }, { status: 400 });
    }

    if (Math.abs(parsed.data.totalPrice - pricing.total) > 0.01) {
      return NextResponse.json({ ok: false, error: 'Total price is invalid' }, { status: 400 });
    }

    if (parsed.data.productName.trim() !== siteConfig.productName) {
      return NextResponse.json({ ok: false, error: 'Product name is invalid' }, { status: 400 });
    }

    const orderId = createOrderId();
    const order: StoredOrder = {
      ...parsed.data,
      productName: siteConfig.productName,
      pricePerPiece: pricing.unitPrice,
      totalPrice: pricing.total,
      orderId,
      dateTime: new Date().toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'medium',
      }),
      paymentMethod: 'Cash On Delivery',
      orderStatus: 'New Order',
    };

    await fulfillOrder(order);

    return NextResponse.json({
      ok: true,
      orderId,
      productName: order.productName,
      quantity: order.quantity,
      totalPrice: order.totalPrice,
      queued: true,
    }, {
      headers: getCorsHeaders(request),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Unable to process order',
      },
      { status: 500, headers: getCorsHeaders(request) },
    );
  }
}
