import { readFileSync } from 'node:fs';
import { isAbsolute, resolve } from 'node:path';
import { google } from 'googleapis';
import type { StoredOrder } from './types';

const ORDER_HEADERS = [
  'Order ID',
  'Date & Time',
  'Customer Name',
  'Phone Number',
  'Email Address',
  'Exact Location',
  'Product Name',
  'Quantity',
  'Price Per Piece',
  'Total Price',
  'Payment Method',
  'Order Status',
  'Notes',
] as const;

const ORDER_COLUMN_COUNT = ORDER_HEADERS.length;
const ORDER_STATUS_VALUES = ['New Order', 'Order Confirmed', 'Order Ongoing', 'Delivered', 'Cancelled'] as const;

let sheetLayoutPromise: Promise<void> | null = null;

function assertGoogleConfig() {
  const missing: string[] = [];
  const jsonPath = process.env.GOOGLE_SERVICE_ACCOUNT_JSON_PATH?.trim();

  if (jsonPath) return;

  if (!process.env.GOOGLE_SHEET_ID) missing.push('GOOGLE_SHEET_ID');
  if (!process.env.GOOGLE_SHEET_TAB_NAME) missing.push('GOOGLE_SHEET_TAB_NAME');
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) missing.push('GOOGLE_SERVICE_ACCOUNT_EMAIL');
  if (!process.env.GOOGLE_PRIVATE_KEY) missing.push('GOOGLE_PRIVATE_KEY');

  if (missing.length > 0) {
    throw new Error(`Missing Google Sheets environment variables: ${missing.join(', ')}`);
  }
}

function normalizePrivateKey(value: string) {
  const trimmed = value.trim().replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
  return trimmed.replace(/\\n/g, '\n').replace(/\r\n/g, '\n').trim();
}

type ServiceAccountFile = {
  client_email: string;
  private_key: string;
};

function loadGoogleServiceAccount() {
  const jsonPath = process.env.GOOGLE_SERVICE_ACCOUNT_JSON_PATH?.trim();
  if (jsonPath) {
    const absolutePath = isAbsolute(jsonPath) ? jsonPath : resolve(process.cwd(), jsonPath);
    const raw = readFileSync(absolutePath, 'utf8');
    const parsed = JSON.parse(raw) as Partial<ServiceAccountFile>;

    if (!parsed.client_email || !parsed.private_key) {
      throw new Error(
        'GOOGLE_SERVICE_ACCOUNT_JSON_PATH must point to a JSON file with client_email and private_key',
      );
    }

    return {
      clientEmail: parsed.client_email,
      privateKey: normalizePrivateKey(parsed.private_key),
    };
  }

  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim();
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!clientEmail) throw new Error('Missing GOOGLE_SERVICE_ACCOUNT_EMAIL');
  if (!privateKey) throw new Error('Missing GOOGLE_PRIVATE_KEY');

  return {
    clientEmail,
    privateKey: normalizePrivateKey(privateKey),
  };
}

function isGoogleAuthFailure(error: unknown) {
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  return (
    message.includes('oauth2/v4/token') ||
    message.includes('invalid_grant') ||
    message.includes('unauthorized') ||
    message.includes('forbidden')
  );
}

function getGoogleAuthHelp(error: unknown) {
  if (!isGoogleAuthFailure(error)) return null;

  return [
    'Google Sheets authentication failed.',
    'Check that the spreadsheet is shared with the service account email.',
    'Verify the Sheets API is enabled for the Google Cloud project.',
    'Confirm the private key in .env.local is the exact JSON private_key for the service account.',
  ].join(' ');
}

function getGoogleClient() {
  assertGoogleConfig();

  const { clientEmail, privateKey } = loadGoogleServiceAccount();

  const client = new google.auth.JWT(
    clientEmail,
    undefined,
    privateKey,
    ['https://www.googleapis.com/auth/spreadsheets'],
  );

  return client;
}

function quoteSheetName(name: string) {
  return `'${name.replace(/'/g, "''")}'`;
}

function getSheetValuesRange(tabName: string) {
  return `${quoteSheetName(tabName)}!A1:M1`;
}

async function ensureSheetLayout() {
  if (!sheetLayoutPromise) {
    sheetLayoutPromise = (async () => {
      const auth = getGoogleClient();
      try {
        await auth.authorize();
      } catch (error) {
        const help = getGoogleAuthHelp(error);
        throw new Error(help ? `${help} Original error: ${error instanceof Error ? error.message : String(error)}` : error instanceof Error ? error.message : 'Failed to authorize Google Sheets client');
      }

      const sheets = google.sheets({ version: 'v4', auth });
      const spreadsheetId = process.env.GOOGLE_SHEET_ID as string;
      const tabName = process.env.GOOGLE_SHEET_TAB_NAME as string;

      let spreadsheet;
      try {
        spreadsheet = await sheets.spreadsheets.get({
          spreadsheetId,
        });
      } catch (error) {
        const help = getGoogleAuthHelp(error);
        throw new Error(help ? `${help} Original error: ${error instanceof Error ? error.message : String(error)}` : error instanceof Error ? error.message : 'Failed to read Google Sheet metadata');
      }

      let targetSheet = spreadsheet.data.sheets?.find(
        (sheet) => sheet.properties?.title === tabName,
      );

      if (!targetSheet?.properties?.sheetId) {
        const created = await sheets.spreadsheets.batchUpdate({
          spreadsheetId,
          requestBody: {
            requests: [
              {
                addSheet: {
                  properties: {
                    title: tabName,
                  },
                },
              },
            ],
          },
        });

        const createdSheet = created.data.replies?.[0]?.addSheet?.properties;
        if (!createdSheet?.sheetId) {
          throw new Error(`Google Sheet tab "${tabName}" could not be created`);
        }

        targetSheet = {
          properties: {
            sheetId: createdSheet.sheetId,
            title: tabName,
          },
        };
      }

      const sheetId = targetSheet.properties?.sheetId;
      if (!sheetId) {
        throw new Error(`Google Sheet tab "${tabName}" is missing a sheet ID`);
      }
      const headerRange = getSheetValuesRange(tabName);
      const headerValues = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: headerRange,
        majorDimension: 'ROWS',
      });

      const firstRow = headerValues.data.values?.[0] ?? [];
      if (firstRow.length === 0) {
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: headerRange,
          valueInputOption: 'RAW',
          requestBody: { values: [Array.from(ORDER_HEADERS)] },
        });
      }

      const requests = [
        {
          updateSheetProperties: {
            properties: {
              sheetId,
              gridProperties: {
                frozenRowCount: 1,
                rowCount: 1000,
                columnCount: ORDER_COLUMN_COUNT,
              },
              tabColor: {
                red: 0.89,
                green: 0.71,
                blue: 0.29,
              },
            },
            fields:
              'gridProperties.frozenRowCount,gridProperties.rowCount,gridProperties.columnCount,tabColor',
          },
        },
        {
          repeatCell: {
            range: {
              sheetId,
              startRowIndex: 0,
              endRowIndex: 1,
              startColumnIndex: 0,
              endColumnIndex: ORDER_COLUMN_COUNT,
            },
            cell: {
              userEnteredFormat: {
                backgroundColor: {
                  red: 0.09,
                  green: 0.11,
                  blue: 0.16,
                },
                textFormat: {
                  foregroundColor: {
                    red: 0.97,
                    green: 0.84,
                    blue: 0.55,
                  },
                  bold: true,
                  fontSize: 11,
                  fontFamily: 'Inter',
                },
                horizontalAlignment: 'CENTER',
                verticalAlignment: 'MIDDLE',
                wrapStrategy: 'WRAP',
              },
            },
            fields:
              'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment,wrapStrategy)',
          },
        },
        {
          repeatCell: {
            range: {
              sheetId,
              startRowIndex: 1,
              startColumnIndex: 0,
              endColumnIndex: ORDER_COLUMN_COUNT,
            },
            cell: {
              userEnteredFormat: {
                textFormat: {
                  fontFamily: 'Inter',
                  fontSize: 10,
                },
                verticalAlignment: 'MIDDLE',
                wrapStrategy: 'WRAP',
              },
            },
            fields: 'userEnteredFormat(textFormat,verticalAlignment,wrapStrategy)',
          },
        },
        {
          setBasicFilter: {
            filter: {
              range: {
                sheetId,
                startRowIndex: 0,
                startColumnIndex: 0,
                endColumnIndex: ORDER_COLUMN_COUNT,
              },
            },
          },
        },
        {
          setDataValidation: {
            range: {
              sheetId,
              startRowIndex: 1,
              endRowIndex: 1000,
              startColumnIndex: 11,
              endColumnIndex: 12,
            },
            rule: {
              condition: {
                type: 'ONE_OF_LIST',
                values: ORDER_STATUS_VALUES.map((value) => ({ userEnteredValue: value })),
              },
              strict: true,
              showCustomUi: true,
            },
          },
        },
        ...[
          150, 170, 220, 150, 220, 260, 190, 90, 130, 130, 160, 150, 240,
        ].map((pixelSize, index) => ({
          updateDimensionProperties: {
            range: {
              sheetId,
              dimension: 'COLUMNS' as const,
              startIndex: index,
              endIndex: index + 1,
            },
            properties: {
              pixelSize,
            },
            fields: 'pixelSize',
          },
        })),
      ];

      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: { requests },
      });
    })().catch((error) => {
      sheetLayoutPromise = null;
      throw error;
    });
  }

  return sheetLayoutPromise;
}

export async function appendOrderToSheet(order: StoredOrder) {
  await ensureSheetLayout();

  const auth = getGoogleClient();
  const sheets = google.sheets({ version: 'v4', auth });
  const tabName = process.env.GOOGLE_SHEET_TAB_NAME as string;

  const values = [
    [
      order.orderId,
      order.dateTime,
      order.customerName,
      order.phoneNumber,
      order.emailAddress,
      order.exactLocation,
      order.productName,
      order.quantity,
      order.pricePerPiece,
      order.totalPrice,
      order.paymentMethod,
      order.orderStatus,
      order.notes || '',
    ],
  ];

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: `'${tabName.replace(/'/g, "''")}'!A:M`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values },
    });
  } catch (error) {
    const help = getGoogleAuthHelp(error);
    throw new Error(help ? `${help} Original error: ${error instanceof Error ? error.message : String(error)}` : error instanceof Error ? error.message : 'Failed to append order to Google Sheet');
  }
}
