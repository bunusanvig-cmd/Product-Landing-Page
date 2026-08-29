"use client";

import type { FormEvent, ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRightIcon, CheckIcon } from './icons';
import { isMetaPixelEnabled, trackMetaPixelEvent } from '@/lib/meta-pixel';
import { buildThankYouHref, formatMoney, getPricing, siteConfig } from '@/lib/site';

type CheckoutFormProps = {
  initialProductName: string;
  initialQuantity: number;
  initialPricePerPiece: number;
  initialTotalPrice: number;
};

export function CheckoutForm({
  initialProductName,
  initialQuantity,
  initialPricePerPiece,
  initialTotalPrice,
}: CheckoutFormProps) {
  const router = useRouter();
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [exactLocation, setExactLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const pricing = getPricing(initialQuantity);
  const quantity = pricing.quantity;
  const pricePerPiece = initialPricePerPiece;
  const productName = initialProductName;
  const totalPrice = pricing.total;

  useEffect(() => {
    if (!isMetaPixelEnabled()) return;

    trackMetaPixelEvent('InitiateCheckout', {
      content_name: productName,
      content_type: 'product',
      currency: 'NPR',
      num_items: quantity,
      value: totalPrice,
    });
  }, [productName, quantity, totalPrice]);

  const summary = useMemo(() => {
    return [
      { label: 'Product', value: productName },
      { label: 'Quantity', value: String(quantity) },
      { label: 'Price per piece', value: formatMoney(pricePerPiece) },
      { label: 'Delivery fee', value: formatMoney(pricing.deliveryFee) },
      { label: 'Discount', value: pricing.discount > 0 ? `- ${formatMoney(pricing.discount)}` : 'N/A' },
      { label: 'Total', value: formatMoney(totalPrice) },
    ];
  }, [pricePerPiece, pricing.deliveryFee, pricing.discount, productName, quantity, totalPrice]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName,
          phoneNumber,
          emailAddress,
          exactLocation,
          productName,
          quantity,
          pricePerPiece,
          totalPrice,
          notes,
        }),
      });

      const data = (await response.json()) as
        | { ok: true; orderId: string; totalPrice: number; quantity: number; productName: string }
        | { ok: false; error: string };

      if (!response.ok || !data.ok) {
        throw new Error('error' in data ? data.error : 'Order submission failed');
      }

      if (isMetaPixelEnabled()) {
        trackMetaPixelEvent('AddPaymentInfo', {
          content_name: productName,
          content_type: 'product',
          currency: 'NPR',
          num_items: quantity,
          value: totalPrice,
        });
      }

      router.push(
        buildThankYouHref({
          orderId: data.orderId,
          productName: data.productName,
          quantity: data.quantity,
          totalPrice: data.totalPrice,
        }),
      );
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="premium-card p-6 sm:p-8">
        <div className="eyebrow text-ink-900">Checkout</div>
        <h1 className="section-title mt-4">{siteConfig.brandName} order form</h1>
        <p className="section-lead">
          Product name, quantity, price per piece, and total are carried over automatically from the landing page.
        </p>

        <div className="mt-8 grid gap-5">
          <Field label="Full Name">
            <input
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              className="w-full rounded-2xl border border-ink-900/10 bg-white px-4 py-3 text-ink-900 outline-none transition placeholder:text-ink-400 focus:border-ink-900/30"
              placeholder="Enter your full name"
              required
            />
          </Field>
          <Field label="Phone Number">
            <input
              value={phoneNumber}
              onChange={(event) => setPhoneNumber(event.target.value)}
              className="w-full rounded-2xl border border-ink-900/10 bg-white px-4 py-3 text-ink-900 outline-none transition placeholder:text-ink-400 focus:border-ink-900/30"
              placeholder="Enter your phone number"
              required
            />
          </Field>
          <Field label="Email Address">
            <input
              value={emailAddress}
              onChange={(event) => setEmailAddress(event.target.value)}
              className="w-full rounded-2xl border border-ink-900/10 bg-white px-4 py-3 text-ink-900 outline-none transition placeholder:text-ink-400 focus:border-ink-900/30"
              placeholder="Enter your email address"
              type="email"
              required
            />
          </Field>
          <Field label="Exact Location">
            <textarea
              value={exactLocation}
              onChange={(event) => setExactLocation(event.target.value)}
              className="min-h-28 w-full rounded-2xl border border-ink-900/10 bg-white px-4 py-3 text-ink-900 outline-none transition placeholder:text-ink-400 focus:border-ink-900/30"
              placeholder="Kindly share your exact location"
              required
            />
          </Field>
          <Field label="Order Notes">
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="min-h-24 w-full rounded-2xl border border-ink-900/10 bg-white px-4 py-3 text-ink-900 outline-none transition placeholder:text-ink-400 focus:border-ink-900/30"
              placeholder="Optional order notes"
            />
          </Field>
        </div>

        <div className="mt-8 rounded-[1.6rem] border border-ink-900/10 bg-sand-50 p-5">
          <div className="text-sm font-semibold uppercase tracking-[0.24em] text-ink-700">Auto-filled product details</div>
          <div className="mt-4 grid gap-4">
            <ReadOnlyField label="Product Name" value={productName} />
            <ReadOnlyField label="Quantity" value={String(quantity)} />
            <ReadOnlyField label="Price Per Piece" value={formatMoney(pricePerPiece)} />
            <ReadOnlyField label="Total Price" value={formatMoney(totalPrice)} />
          </div>
        </div>

        {error ? (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        ) : null}

        <button disabled={submitting} className="primary-button mt-6 w-full disabled:cursor-not-allowed disabled:opacity-70" type="submit">
          {submitting ? 'Submitting Order...' : 'Order Now'}
          {!submitting ? <ArrowRightIcon className="ml-2 h-4 w-4" /> : null}
        </button>

        <div className="mt-6 flex flex-wrap gap-3 text-xs text-ink-600">
          <span className="inline-flex items-center gap-2 rounded-full bg-sand-100 px-3 py-2">
            <CheckIcon className="h-4 w-4 text-ink-900" /> Cash on delivery
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-sand-100 px-3 py-2">
            <CheckIcon className="h-4 w-4 text-ink-900" /> Secure submission
          </span>
        </div>
      </div>

      <aside className="premium-card h-fit p-6 sm:p-8">
        <div className="text-sm font-semibold uppercase tracking-[0.24em] text-ink-700">Order summary</div>
        <div className="mt-6 grid gap-4">
          {summary.map((item) => (
            <div key={item.label} className="flex items-center justify-between rounded-2xl bg-sand-50 px-4 py-3">
              <span className="text-sm text-ink-600">{item.label}</span>
              <span className="text-sm font-semibold text-ink-900">{item.value}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-3xl bg-ink-900 p-6 text-white">
          <div className="text-xs uppercase tracking-[0.24em] text-gold-300">What happens next</div>
          <ol className="mt-4 grid gap-3 text-sm leading-7 text-sand-100/90">
            <li>1. Your order is validated on the server.</li>
            <li>2. It is saved to Google Sheets.</li>
            <li>3. You and the business receive email notifications.</li>
            <li>4. You are redirected to the thank-you page.</li>
          </ol>
          <div className="mt-4 rounded-2xl bg-white/10 p-4 text-xs leading-6 text-sand-100/85">
            {siteConfig.deliveryNote}
          </div>
        </div>
      </aside>
    </form>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-ink-700">{label}</span>
      {children}
    </label>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-2">
      <span className="text-xs uppercase tracking-[0.18em] text-ink-600">{label}</span>
      <div className="rounded-2xl border border-ink-900/10 bg-white px-4 py-3 text-sm font-semibold text-ink-900">
        {value}
      </div>
    </div>
  );
}
