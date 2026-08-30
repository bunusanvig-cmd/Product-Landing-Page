# Product Landing Page Funnel

This project is a Next.js App Router funnel for cash on delivery products. It is currently configured for Dhara Pure Mustard Oil:

- Product landing page
- Checkout page
- Thank-you page
- `/api/order` submission endpoint
- Google Sheets order storage
- Business Gmail notification email
- Customer order receipt email
- Brand logo and product imagery

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Google Sheets API via service account
- Nodemailer with SMTP for email delivery

## How the flow works

1. A visitor lands on `/` and sees the product landing page.
2. CTA buttons send them to `/checkout` with the selected product, quantity, and price encoded in the URL.
3. The checkout form posts to `POST /api/order`.
4. The API validates the payload on the server.
5. The order is appended to Google Sheets.
6. The business receives a notification email.
7. The customer receives a confirmation email.
8. The customer is redirected to `/thank-you`.

## Environment Variables

Create a `.env.local` file from `.env.example` and fill in:

- `NEXT_PUBLIC_SITE_URL`
- `BUSINESS_EMAIL`
- `EMAIL_FROM`
- `BRAND_NAME`
- `GOOGLE_SHEET_ID`
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_PRIVATE_KEY`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `EMAIL_SERVICE_API_KEY`
- `FRONTEND_URL`

## Google Sheets setup

1. Create a new Google Sheet.
2. Ensure the first tab in the workbook is the order sheet used by the backend.
3. Add these header columns in row 1:
   - Order ID
   - Date & Time
   - Customer Name
   - Phone Number
   - Email Address
   - Exact Location
   - Product Name
   - Quantity
   - Price Per Piece
   - Total Price
   - Payment Method
   - Order Status
   - Notes
4. Apply filters to the header row.
5. Add a dropdown to the `Order Status` column with:
   - New Order
   - Order Confirmed
   - Order Ongoing
   - Delivered
   - Cancelled
6. Copy the sheet ID from the Google Sheet URL.
7. Create a Google service account and add its email to the sheet share list with Editor access.
8. Paste the private key into `GOOGLE_PRIVATE_KEY` and keep the newline escapes intact.

## Email setup

This project uses Nodemailer + SMTP.

If you want Gmail SMTP:

- Set `SMTP_HOST=smtp.gmail.com`
- Set `SMTP_PORT=465`
- Set `SMTP_USER=your-gmail-address`
- Set `SMTP_PASS=your-app-password`

Use a Gmail app password, not your normal password.

## Testing the order flow

1. Fill in your environment variables.
2. Run `npm install`.
3. Start the dev server with `npm run dev`.
4. Open the home page.
5. Place a test order.
6. Confirm the row appears in Google Sheets.
7. Confirm both emails are delivered.
8. Confirm the thank-you page shows the order summary.

## Deployment on Vercel

1. Push the project to GitHub.
2. Import it into Vercel.
3. Add the same environment variables in the Vercel project settings.
4. Set `NEXT_PUBLIC_SITE_URL` and `FRONTEND_URL` to your production domain.
5. Deploy.

## Editing content

Most content lives in `lib/site.ts`, including:

- Brand name
- Product name
- Prices
- Gallery images
- Testimonials
- FAQs
- Optional reel links
- Delivery note and support contact

If you add reel URLs to `reelLinks`, the reels section will appear automatically. If the array stays empty, the reels section will not render.

The uploaded product images live in `/public/product` and the logo lives in `/public/logo.svg`.

## Notes

- The design uses placeholder imagery so the project can run before you upload real product photos.
- Replace the placeholder images with high-quality PNGs when your product assets are ready.
- Keep order processing server-side so credentials never reach the browser.
