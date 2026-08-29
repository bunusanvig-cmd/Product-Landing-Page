"use client";

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { isMetaPixelEnabled, trackMetaPixelPageView } from '@/lib/meta-pixel';

type WindowWithMetaPixelState = Window & {
  __metaPixelLastPageView?: {
    key: string;
    timestamp: number;
  };
};

export function MetaPixelEvents() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const didMountRef = useRef(false);

  useEffect(() => {
    if (!isMetaPixelEnabled() || !pathname) return;

    const queryString = searchParams?.toString() || '';
    const routeKey = queryString ? `${pathname}?${queryString}` : pathname;
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }

    const currentWindow = window as WindowWithMetaPixelState;
    const now = Date.now();
    const lastPageView = currentWindow.__metaPixelLastPageView;

    if (lastPageView && lastPageView.key === routeKey && now - lastPageView.timestamp < 1500) {
      return;
    }

    currentWindow.__metaPixelLastPageView = {
      key: routeKey,
      timestamp: now,
    };

    trackMetaPixelPageView();
  }, [pathname, searchParams]);

  return null;
}
