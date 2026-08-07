import { NextRequest, NextResponse } from 'next/server';
import { createOrderId } from '@/lib/id';
import { fulfillOrder } from '@/lib/order-fulfillment';
import { getPricing, siteConfig } from '@/lib/site';
import { orderRequestSchema } from '@/lib/validation';
import type { StoredOrder } from '@/lib/types';

export const runtime = 'nodejs';

function isAllowedOrigin(request: NextRequest) {
  const expectedOrigin = process.env.FRONTEND_URL?.trim();
  if (!expectedOrigin) return true;

  const origin = request.headers.get('origin');
  if (!origin) return true;

  if (origin === expectedOrigin) return true;

  try {
    const actual = new URL(origin);
    const expected = new URL(expectedOrigin);
    const actualHost = actual.hostname.toLowerCase();
    const expectedHost = expected.hostname.toLowerCase();
    const loopbackHosts = new Set(['localhost', '127.0.0.1', '::1']);

    return (
      actual.protocol === expected.protocol &&
      actual.port === expected.port &&
      loopbackHosts.has(actualHost) &&
      loopbackHosts.has(expectedHost)
    );
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isAllowedOrigin(request)) {
      return NextResponse.json({ ok: false, error: 'Origin not allowed' }, { status: 403 });
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

    void fulfillOrder(order).catch((error) => {
      console.error('Background order fulfillment failed', error);
    });

    return NextResponse.json({
      ok: true,
      orderId,
      productName: order.productName,
      quantity: order.quantity,
      totalPrice: order.totalPrice,
      queued: true,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Unable to process order',
      },
      { status: 500 },
    );
  }
}
