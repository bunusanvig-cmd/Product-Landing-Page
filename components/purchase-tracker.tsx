"use client";

import { useEffect } from 'react';
import { isMetaPixelEnabled, trackMetaPixelEvent } from '@/lib/meta-pixel';

type PurchaseTrackerProps = {
  orderId: string;
  productName: string;
  quantity: number;
  totalPrice: number;
};

type WindowWithPurchaseState = Window & {
  __metaPixelTrackedPurchases?: Set<string>;
};

export function PurchaseTracker({ orderId, productName, quantity, totalPrice }: PurchaseTrackerProps) {
  useEffect(() => {
    if (!isMetaPixelEnabled()) return;

    const dedupeKey = orderId || `${productName}:${quantity}:${totalPrice}`;
    const currentWindow = window as WindowWithPurchaseState;
    const trackedPurchases = currentWindow.__metaPixelTrackedPurchases ?? new Set<string>();

    if (trackedPurchases.has(dedupeKey)) return;

    trackedPurchases.add(dedupeKey);
    currentWindow.__metaPixelTrackedPurchases = trackedPurchases;

    trackMetaPixelEvent('Purchase', {
      content_name: productName,
      content_type: 'product',
      currency: 'NPR',
      num_items: quantity,
      order_id: orderId || undefined,
      value: totalPrice,
    });
  }, [orderId, productName, quantity, totalPrice]);

  return null;
}
