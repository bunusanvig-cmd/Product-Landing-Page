import { appendOrderToSheet } from './google-sheets';
import { sendBusinessNotification, sendCustomerReceipt } from './mailer';
import { storePendingOrder } from './order-store';
import type { StoredOrder } from './types';

export async function fulfillOrder(order: StoredOrder) {
  let sheetWarning: string | null = null;

  try {
    await appendOrderToSheet(order);
  } catch (error) {
    sheetWarning =
      error instanceof Error
        ? error.message
        : 'Google Sheets sync failed, so the order was stored locally for later recovery';

    console.error('Google Sheets sync failed, storing order locally instead', error);
    await storePendingOrder(order, sheetWarning);
  }

  const emailResults = await Promise.allSettled([
    sendBusinessNotification(order),
    sendCustomerReceipt(order),
  ]);

  const rejected = emailResults.find((result) => result.status === 'rejected') as
    | PromiseRejectedResult
    | undefined;

  if (rejected) {
    console.error('Order emails failed to send', rejected.reason);
  }

  return {
    sheetWarning,
    emailWarning: rejected
      ? rejected.reason instanceof Error
        ? rejected.reason.message
        : 'One or more emails failed to send'
      : null,
  };
}
