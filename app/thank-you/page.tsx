import Link from 'next/link';
import { ArrowRightIcon, CheckIcon } from '@/components/icons';
import { formatMoney, getPricing, siteConfig } from '@/lib/site';

type ThankYouSearchParams = {
  orderId?: string | string[];
  productName?: string | string[];
  quantity?: string | string[];
  totalPrice?: string | string[];
};

function toFirstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function toPositiveInteger(value: string | string[] | undefined, fallback: number) {
  const raw = Number(toFirstValue(value));
  if (!Number.isFinite(raw) || raw < 1) return fallback;
  return Math.max(1, Math.floor(raw));
}

function toPositiveNumber(value: string | string[] | undefined, fallback: number) {
  const raw = Number(toFirstValue(value));
  if (!Number.isFinite(raw) || raw < 0) return fallback;
  return raw;
}

export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: Promise<ThankYouSearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const quantity = toPositiveInteger(resolvedSearchParams.quantity, 1);
  const totalPrice = toPositiveNumber(resolvedSearchParams.totalPrice, getPricing(quantity).total);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(217,164,58,0.16),_transparent_30%),linear-gradient(180deg,_#f8f3eb_0%,_#f8f3eb_100%)] py-12">
      <div className="section-shell">
        <div className="mx-auto max-w-3xl premium-card overflow-hidden p-8 text-center sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-ink-900 text-white">
            <CheckIcon className="h-7 w-7" />
          </div>
          <h1 className="section-title mt-6">Thank you for your order!</h1>
          <p className="section-lead mx-auto max-w-2xl">
            Our sales representative will call you soon to confirm your order.
          </p>

          <div className="mt-8 grid gap-4 rounded-[1.6rem] bg-sand-50 p-5 text-left sm:grid-cols-2">
            <Info label="Order ID" value={toFirstValue(resolvedSearchParams.orderId) || 'Pending'} />
            <Info label="Product ordered" value={toFirstValue(resolvedSearchParams.productName) || siteConfig.productName} />
            <Info label="Quantity" value={String(quantity)} />
            <Info label="Total price" value={formatMoney(totalPrice)} />
            <Info label="Payment method" value="Cash On Delivery" />
            <Info label="Next step" value="Our sales representative will call you soon to confirm your order." />
          </div>

          <div className="mt-8 flex justify-center">
            <Link href="/" className="primary-button">
              Back to Home <ArrowRightIcon className="ml-2 h-4 w-4 rotate-180" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white px-4 py-4 shadow-sm">
      <div className="text-xs uppercase tracking-[0.22em] text-ink-500">{label}</div>
      <div className="mt-2 text-sm font-semibold leading-6 text-ink-900">{value}</div>
    </div>
  );
}
