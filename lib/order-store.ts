import { appendFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import type { StoredOrder } from './types';

const FALLBACK_FILE = resolve(process.cwd(), 'data', 'pending-orders.jsonl');

export async function storePendingOrder(order: StoredOrder, reason: string) {
  const record = {
    ...order,
    fallbackReason: reason,
    savedAt: new Date().toISOString(),
  };

  await mkdir(dirname(FALLBACK_FILE), { recursive: true });
  await appendFile(FALLBACK_FILE, `${JSON.stringify(record)}\n`, 'utf8');
}
