"use client";

import Image from 'next/image';
import type { ReactNode } from 'react';
import { useMemo, useRef, useState } from 'react';
import { ArrowRightIcon, CheckIcon, HeartIcon, ShieldIcon, SparkIcon, TruckIcon } from './icons';
import { buildCheckoutHref, formatMoney, getPricing, siteConfig } from '@/lib/site';

function SectionHeading({
  eyebrow,
  title,
  lead,
}: {
  eyebrow: string;
  title: string;
  lead: string;
}) {
  return (
    <div className="mb-10 max-w-3xl">
      <div className="eyebrow text-ink-900">{eyebrow}</div>
      <h2 className="section-title mt-4">{title}</h2>
      <p className="section-lead">{lead}</p>
    </div>
  );
}

function SectionBadge({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/90 px-4 py-2 shadow-sm backdrop-blur">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-900 text-white">{icon}</span>
      <span className="text-sm font-medium text-ink-800">{text}</span>
    </div>
  );
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1 text-gold-500">
      {Array.from({ length: 5 }).map((_, index) => (
        <span key={index} aria-hidden="true">
          {index < rating ? <span>&#9733;</span> : <span>&#9734;</span>}
        </span>
      ))}
    </div>
  );
}

function PriceBlock({ quantity }: { quantity: number }) {
  const pricing = getPricing(quantity);

  return (
    <div className="rounded-3xl border border-ink-900/10 bg-ink-900 p-6 text-white shadow-panel">
      <div className="text-sm uppercase tracking-[0.24em] text-sand-100/70">Today&apos;s offer</div>
      <div className="mt-3 flex flex-wrap items-end gap-3">
        <span className="font-[family-name:var(--font-display)] text-4xl font-semibold">{formatMoney(pricing.unitPrice)}</span>
        {pricing.discount > 0 ? (
          <span className="rounded-full bg-white/10 px-3 py-1 text-sm text-sand-100 line-through">
            {formatMoney(pricing.subtotal)}
          </span>
        ) : null}
      </div>
      <div className="mt-4 grid gap-2 text-sm text-sand-100/85">
        <div className="flex items-center justify-between">
          <span>Quantity</span>
          <span>{quantity}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Delivery fee</span>
          <span>{formatMoney(pricing.deliveryFee)}</span>
        </div>
        {pricing.discount > 0 ? (
          <div className="flex items-center justify-between">
            <span>5+ liter discount</span>
            <span>-{formatMoney(pricing.discount)}</span>
          </div>
        ) : null}
        <div className="border-t border-white/10 pt-3" />
        <div className="flex items-center justify-between text-base font-semibold">
          <span>Total</span>
          <span>{formatMoney(pricing.total)}</span>
        </div>
      </div>
    </div>
  );
}

function ImageCarousel() {
  const trackRef = useRef<HTMLDivElement | null>(null);

  const move = (direction: 'left' | 'right') => {
    if (!trackRef.current) return;
    trackRef.current.scrollBy({
      left: direction === 'right' ? 360 : -360,
      behavior: 'smooth',
    });
  };

  return (
    <div className="relative">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold uppercase tracking-[0.24em] text-ink-700">Gallery</div>
          <div className="mt-1 text-sm text-ink-600">Swipe through the product images</div>
        </div>
        <div className="flex gap-2">
          <button className="secondary-button px-4 py-2 text-sm" onClick={() => move('left')} type="button">
            Prev
          </button>
          <button className="secondary-button px-4 py-2 text-sm" onClick={() => move('right')} type="button">
            Next
          </button>
        </div>
      </div>
      <div
        ref={trackRef}
        className="grid grid-flow-col auto-cols-[82%] gap-4 overflow-x-auto pb-4 md:auto-cols-[46%] xl:auto-cols-[31%]"
        style={{ scrollbarWidth: 'none' }}
      >
        {siteConfig.galleryImages.map((src, index) => (
          <div key={src + index} className="overflow-hidden rounded-[1.6rem] border border-ink-900/10 bg-white shadow-lg">
            <Image
              src={src}
              alt={`${siteConfig.productName} image ${index + 1}`}
              width={1200}
              height={1200}
              className="h-full w-full object-cover"
              unoptimized
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function ReelCard({ src, index }: { src: string; index: number }) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="mx-auto w-full max-w-[280px]">
      <div className="relative rounded-[2.5rem] border-[10px] border-ink-900 bg-ink-900 p-3 shadow-panel">
        <div className="absolute left-1/2 top-2 h-1.5 w-24 -translate-x-1/2 rounded-full bg-white/25" />
        <div
          role="button"
          tabIndex={0}
          className="relative block aspect-[9/19] w-full overflow-hidden rounded-[1.8rem] bg-black"
          onClick={() => setPlaying((value) => !value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              setPlaying((value) => !value);
            }
          }}
          aria-label={`Play reel ${index + 1}`}
        >
          <video
            className="h-full w-full object-cover"
            controls
            playsInline
            preload="metadata"
            src={src}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
          />
          {!playing ? (
            <span className="pointer-events-none absolute inset-0 grid place-items-center bg-black/30">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-white/90 text-ink-900 shadow-lg">
                <span>&#9658;</span>
              </span>
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function LandingPage() {
  const [quantity, setQuantity] = useState(1);

  const total = useMemo(() => {
    return getPricing(quantity).total;
  }, [quantity]);

  const ctaHref = buildCheckoutHref({ quantity });

  return (
    <main>
      <section className="bg-hero-radial pb-20 pt-8">
        <div className="section-shell">
          <header className="mb-8 flex items-center justify-between gap-4 rounded-full border border-white/10 bg-white/[0.08] px-5 py-3 text-white backdrop-blur">
            <div className="flex items-center gap-3">
              <Image src="/logo.svg" alt={`${siteConfig.brandName} logo`} width={44} height={44} className="h-11 w-11" />
              <div>
                <div className="text-sm font-semibold">{siteConfig.brandName}</div>
                <div className="text-xs text-sand-100/70">Cash on Delivery funnel</div>
              </div>
            </div>
            <a className="secondary-button hidden md:inline-flex" href={ctaHref}>
              Order Now
            </a>
          </header>

          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="text-white">
              <div className="eyebrow border-white/[0.15] bg-white/[0.08] text-sand-50">High-converting landing page</div>
              <h1 className="headline mt-6 max-w-3xl shadow-text">
                {siteConfig.productName}
                <span className="block text-gold-300">built for conversion.</span>
              </h1>
              <p className="mt-5 text-base font-semibold tracking-wide text-gold-300">NPR {siteConfig.price} per liter</p>
              <p className="subhead mt-6 max-w-2xl">{siteConfig.subheadline}</p>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-sand-100/80 md:text-base">{siteConfig.productDescription}</p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a className="primary-button" href={ctaHref}>
                  Purchase Now <ArrowRightIcon className="ml-2 h-4 w-4" />
                </a>
                <a className="secondary-button" href={ctaHref}>
                  Order Now
                </a>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                {siteConfig.trustPoints.map((point) => (
                  <SectionBadge key={point} icon={<CheckIcon className="h-4 w-4" />} text={point} />
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 rounded-[2.5rem] bg-gold-300/20 blur-3xl" />
              <div className="relative premium-card overflow-hidden bg-white/10 p-4 text-white shadow-panel">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-[0.28em] text-sand-100/70">Hero spotlight</div>
                    <div className="mt-1 text-lg font-semibold">{siteConfig.productName}</div>
                  </div>
                  <div className="chip">
                    <SparkIcon className="h-4 w-4" />
                    Featured
                  </div>
                </div>
                <div className="overflow-hidden rounded-[1.8rem] border border-white/10 bg-gradient-to-br from-white/10 to-white/5">
                  <Image
                    src={siteConfig.heroImage}
                    alt={`${siteConfig.productName} hero image`}
                    width={1200}
                    height={1200}
                    className="aspect-square w-full object-cover"
                    unoptimized
                    priority
                  />
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white/10 p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-sand-100/70">From</div>
                    <div className="mt-1 text-2xl font-semibold">{formatMoney(siteConfig.price)}</div>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-sand-100/70">Fast setup</div>
                    <div className="mt-1 text-sm leading-6 text-sand-100/90">
                      Dhara delivers within 24 hours and shows your customers a simple COD checkout.
                    </div>
                  </div>
                </div>
                <div className="mt-4 rounded-2xl bg-white/10 p-4 text-sm leading-7 text-sand-100/90">
                  {siteConfig.deliveryNote}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-24 pt-6">
        <div className="section-shell">
          <div className="premium-card grid gap-8 p-5 lg:grid-cols-[1.1fr_0.9fr] lg:p-8">
            <div>
              <ImageCarousel />
            </div>
            <div className="flex flex-col justify-between gap-6 rounded-[1.6rem] bg-ink-900 p-6 text-white">
              <div>
                <div className="text-sm uppercase tracking-[0.24em] text-gold-300">Product showcase</div>
                <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight">
                  {siteConfig.productName}
                </h2>
                <p className="mt-4 text-sm leading-7 text-sand-100/80">{siteConfig.productDescription}</p>
              </div>

              <div className="grid gap-4">
                <div className="rounded-3xl bg-white/[0.08] p-5">
                  <div className="text-sm font-semibold text-gold-300">Key benefits</div>
                  <ul className="mt-3 grid gap-3 text-sm leading-7 text-sand-100/88">
                    {siteConfig.benefits.map((benefit) => (
                      <li key={benefit} className="flex gap-3">
                        <CheckIcon className="mt-1 h-4 w-4 shrink-0 text-gold-300" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <PriceBlock quantity={quantity} />
                  <div className="rounded-3xl border border-white/10 bg-white/[0.08] p-6">
                    <div className="text-sm uppercase tracking-[0.24em] text-sand-100/70">Order details</div>
                    <div className="mt-4 grid gap-4">
                      <label className="grid gap-2 text-sm">
                        <span className="text-sand-100/80">Quantity</span>
                        <input
                          type="range"
                          min={1}
                          max={10}
                          value={quantity}
                          onChange={(event) => setQuantity(Number(event.target.value))}
                          className="accent-gold-400"
                        />
                        <div className="flex items-center justify-between text-xs text-sand-100/70">
                          <span>1</span>
                          <span>{quantity}</span>
                          <span>10</span>
                        </div>
                      </label>
                    <div className="rounded-2xl bg-black/20 p-4 text-sm leading-7 text-sand-100/90">
                        Select a quantity and continue to checkout. The product name, price per piece, discount, and total are
                        passed automatically.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <a className="primary-button" href={ctaHref}>
                    Buy Now <ArrowRightIcon className="ml-2 h-4 w-4" />
                  </a>
                  <a className="secondary-button" href={ctaHref}>
                    Order Now
                  </a>
                  <a className="secondary-button" href={ctaHref}>
                    Purchase Now
                  </a>
                </div>
                <div className="text-xs text-sand-100/70">Live total: {formatMoney(total)}</div>
                <div className="text-xs text-sand-100/60">{siteConfig.deliveryNote}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {siteConfig.reelLinks.length > 0 ? (
        <section className="pb-24">
          <div className="section-shell">
            <SectionHeading
              eyebrow="Product reels"
              title="Watch the product in action"
              lead="This section appears only when reel links are supplied. Each video is framed inside a premium iPhone-style mockup and only plays when clicked."
            />
            <div className="grid gap-8 lg:grid-cols-3">
              {siteConfig.reelLinks.slice(0, 3).map((src, index) => (
                <ReelCard key={src} src={src} index={index} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="pb-24">
        <div className="section-shell">
          <SectionHeading
            eyebrow="Why buy"
            title="Clear reasons to choose this product"
            lead="Use this area to reinforce the value proposition, remove hesitation, and make the purchasing decision feel obvious."
          />
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {[
              {
                icon: <ShieldIcon className="h-5 w-5" />,
                title: 'Trust built in',
                text: 'The funnel highlights COD, support, and a clean checkout to reduce uncertainty.',
              },
              {
                icon: <TruckIcon className="h-5 w-5" />,
                title: 'Fast delivery',
                text: 'Delivery and fulfillment messaging stay visible throughout the experience.',
              },
              {
                icon: <SparkIcon className="h-5 w-5" />,
                title: 'Premium presentation',
                text: 'The layout is intentionally polished so the product feels more desirable.',
              },
              {
                icon: <HeartIcon className="h-5 w-5" />,
                title: 'Easy to edit',
                text: 'Change the product details, prices, testimonials, and FAQs from one config file.',
              },
            ].map((item) => (
              <article key={item.title} className="premium-card p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ink-900 text-white">{item.icon}</div>
                <h3 className="mt-5 text-xl font-semibold text-ink-900">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-ink-700">{item.text}</p>
              </article>
            ))}
          </div>
          <div className="mt-8">
            <a className="primary-button" href={ctaHref}>
              Order Now <ArrowRightIcon className="ml-2 h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="section-shell">
          <SectionHeading
            eyebrow="Testimonials"
            title="Build trust with social proof"
            lead="Replace these examples with real customer testimonials once you have them. The layout is designed to look credible on mobile and desktop."
          />
          <div className="grid gap-5 lg:grid-cols-3">
            {siteConfig.testimonials.map((testimonial) => (
              <article key={testimonial.name} className="premium-card p-6">
                <StarRow rating={testimonial.rating} />
                <p className="mt-4 text-sm leading-7 text-ink-700">&ldquo;{testimonial.quote}&rdquo;</p>
                <div className="mt-6 border-t border-ink-900/10 pt-4">
                  <div className="font-semibold text-ink-900">{testimonial.name}</div>
                  <div className="text-sm text-ink-600">{testimonial.role}</div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="section-shell">
          <SectionHeading
            eyebrow="FAQ"
            title="Frequently asked questions"
            lead="Accordion-style answers keep the page tidy while handling the common objections that slow down COD purchases."
          />
          <div className="grid gap-4">
            {siteConfig.faqs.map((faq) => (
              <details key={faq.question} className="premium-card group p-6">
                <summary className="cursor-pointer list-none text-lg font-semibold text-ink-900">
                  <span className="flex items-center justify-between gap-4">
                    <span>{faq.question}</span>
                    <span className="rounded-full bg-ink-900 px-3 py-1 text-xs text-white transition group-open:rotate-45">+</span>
                  </span>
                </summary>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-ink-700">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="section-shell">
          <div className="premium-card overflow-hidden bg-ink-900 p-8 text-white shadow-panel sm:p-10">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <div className="eyebrow border-white/10 bg-white/[0.08] text-sand-50">Final call to action</div>
                <h2 className="mt-5 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight sm:text-5xl">
                  Ready to place your order?
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-7 text-sand-100/85">
                  Keep the message simple, clear, and persuasive. Multiple CTA buttons are repeated so users can order at the
                  moment they feel ready.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 lg:justify-end">
                <a className="primary-button" href={ctaHref}>
                  Purchase Now <ArrowRightIcon className="ml-2 h-4 w-4" />
                </a>
                <a className="secondary-button" href={ctaHref}>
                  Order Now
                </a>
                <a className="secondary-button" href={ctaHref}>
                  Buy Now
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

