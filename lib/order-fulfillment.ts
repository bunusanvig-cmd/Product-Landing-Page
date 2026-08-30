import { appendOrderToSheet } from './google-sheets';
import { sendBusinessNotification, sendCustomerReceipt } from './mailer';
import type { StoredOrder } from './types';

function logStageFailure(stage: string, error: unknown, order: StoredOrder) {
  console.error(`[order-fulfillment] ${stage} failed`, {
    orderId: order.orderId,
    productName: order.productName,
    quantity: order.quantity,
    error: error instanceof Error ? { message: error.message, stack: error.stack } : error,
  });
}

export async function fulfillOrder(order: StoredOrder) {
  try {
    console.info('[order-fulfillment] Writing order to Google Sheets', {
      orderId: order.orderId,
      sheet: 'Sheet 1',
    });
    await appendOrderToSheet(order);
    console.info('[order-fulfillment] Order written to Google Sheets', {
      orderId: order.orderId,
    });
  } catch (error) {
    logStageFailure('Google Sheets write', error, order);
    throw error;
  }

  try {
    console.info('[order-fulfillment] Sending business order email', {
      orderId: order.orderId,
      to: process.env.BUSINESS_EMAIL,
    });
    await sendBusinessNotification(order);
    console.info('[order-fulfillment] Business order email sent', {
      orderId: order.orderId,
    });
  } catch (error) {
    logStageFailure('Business email', error, order);
    throw error;
  }

  try {
    console.info('[order-fulfillment] Sending customer receipt email', {
      orderId: order.orderId,
      to: order.emailAddress,
    });
    await sendCustomerReceipt(order);
    console.info('[order-fulfillment] Customer receipt email sent', {
      orderId: order.orderId,
    });
  } catch (error) {
    logStageFailure('Customer email', error, order);
    throw error;
  }
}
