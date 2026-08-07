import { CheckoutForm } from '@/components/checkout-form';
import { getPricing, siteConfig } from '@/lib/site';

type CheckoutSearchParams = {
  productName?: string | string[];
  quantity?: string | string[];
  pricePerPiece?: string | string[];
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

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<CheckoutSearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const quantity = toPositiveInteger(resolvedSearchParams.quantity, 1);
  const pricing = getPricing(quantity);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(217,164,58,0.16),_transparent_30%),linear-gradient(180deg,_#f8f3eb_0%,_#f8f3eb_100%)] py-10">
      <div className="section-shell">
        <CheckoutForm
          initialProductName={toFirstValue(resolvedSearchParams.productName) || siteConfig.productName}
          initialQuantity={pricing.quantity}
          initialPricePerPiece={pricing.unitPrice}
          initialTotalPrice={pricing.total}
        />
      </div>
    </main>
  );
}
