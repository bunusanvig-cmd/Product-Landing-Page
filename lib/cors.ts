import type { NextRequest } from 'next/server';

const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);

function normalizeOrigin(value: string | undefined | null) {
  const trimmed = value?.trim();
  if (!trimmed) return null;

  try {
    const url = new URL(trimmed);
    return `${url.protocol}//${url.host}`;
  } catch {
    return null;
  }
}

function getConfiguredOrigins() {
  const rawOrigins = [
    process.env.FRONTEND_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.ORDER_ALLOWED_ORIGINS,
  ];

  const origins = new Set<string>();

  for (const raw of rawOrigins) {
    if (!raw) continue;
    for (const part of raw.split(',')) {
      const normalized = normalizeOrigin(part);
      if (normalized) origins.add(normalized);
    }
  }

  return origins;
}

export function isAllowedOrigin(request: NextRequest) {
  const origin = request.headers.get('origin');
  if (!origin) return true;

  const normalizedOrigin = normalizeOrigin(origin);
  if (!normalizedOrigin) return false;

  if (normalizedOrigin === request.nextUrl.origin) return true;

  const configuredOrigins = getConfiguredOrigins();
  if (configuredOrigins.has(normalizedOrigin)) return true;

  if (process.env.NODE_ENV !== 'production') {
    try {
      const url = new URL(normalizedOrigin);
      if (LOOPBACK_HOSTS.has(url.hostname.toLowerCase())) {
        return true;
      }
    } catch {
      return false;
    }
  }

  return false;
}

export function getCorsHeaders(request: NextRequest) {
  const origin = request.headers.get('origin');
  const headers: Record<string, string> = {};

  if (!origin || !isAllowedOrigin(request)) return headers;

  headers['Access-Control-Allow-Origin'] = normalizeOrigin(origin) ?? origin;
  headers.Vary = 'Origin';
  headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS';
  headers['Access-Control-Allow-Headers'] = 'Content-Type';
  headers['Access-Control-Max-Age'] = '86400';

  return headers;
}
