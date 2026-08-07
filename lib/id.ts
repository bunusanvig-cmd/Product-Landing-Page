export function createOrderId() {
  const now = new Date();
  const stamp = now
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\..+/, '')
    .slice(0, 14);
  const random = crypto.randomUUID().slice(0, 8).toUpperCase();

  return `ORD-${stamp}-${random}`;
}
