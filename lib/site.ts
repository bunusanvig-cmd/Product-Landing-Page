export type FAQItem = {
  question: string;
  answer: string;
};

export type Testimonial = {
  name: string;
  role: string;
  quote: string;
  rating: number;
};

export type SiteConfig = {
  siteUrl: string;
  brandName: string;
  supportEmail: string;
  supportPhone: string;
  productName: string;
  productDescription: string;
  headline: string;
  subheadline: string;
  price: number;
  currency: string;
  heroImage: string;
  galleryImages: string[];
  reelLinks: string[];
  benefits: string[];
  testimonials: Testimonial[];
  faqs: FAQItem[];
  trustPoints: string[];
  customerEmailSignature: string;
  deliveryNote: string;
};

function createPlaceholderImage(label: string, accent = '#d9a43a') {
  const svg = `
    <svg width="1200" height="1200" viewBox="0 0 1200 1200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1200" y2="1200">
          <stop offset="0%" stop-color="#1a1a12"/>
          <stop offset="100%" stop-color="#4d3b17"/>
        </linearGradient>
        <radialGradient id="glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(620 320) rotate(90) scale(520 560)">
          <stop stop-color="${accent}" stop-opacity="0.55"/>
          <stop offset="1" stop-color="${accent}" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="1200" height="1200" rx="120" fill="url(#bg)"/>
      <circle cx="620" cy="320" r="430" fill="url(#glow)"/>
      <rect x="210" y="230" width="780" height="740" rx="90" fill="white" fill-opacity="0.05" stroke="white" stroke-opacity="0.14"/>
      <rect x="325" y="350" width="550" height="470" rx="46" fill="white" fill-opacity="0.07" stroke="white" stroke-opacity="0.08"/>
      <rect x="390" y="415" width="420" height="180" rx="36" fill="${accent}" fill-opacity="0.22"/>
      <text x="600" y="935" text-anchor="middle" fill="white" fill-opacity="0.9" font-size="54" font-family="Arial, sans-serif" font-weight="700">${label}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export const siteConfig: SiteConfig = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  brandName: process.env.BRAND_NAME || 'Dhara',
  supportEmail: process.env.EMAIL_FROM || process.env.BUSINESS_EMAIL || 'digitaldk939@gmail.com',
  supportPhone: '9805835865',
  productName: 'Pure Mustard Oil',
  productDescription:
    'Experience the rich taste and natural goodness of our Pure Mustard Oil, carefully made from high-quality mustard seeds. Its strong aroma and rich golden color make it perfect for everyday cooking.',
  headline: 'Bring home the natural taste of pure mustard oil.',
  subheadline:
    'A premium COD funnel for Dhara with a warm, trusted Nepali kitchen feel, clean checkout flow, and simple order confirmation.',
  price: 450,
  currency: 'NPR',
  heroImage: '/product/oil-4.png',
  galleryImages: [
    '/product/oil-1.png',
    '/product/oil-2.png',
    '/product/oil-3.png',
    '/product/oil-4.png',
  ],
  reelLinks: [],
  benefits: [
    '100% Pure Mustard Oil made from carefully selected mustard seeds.',
    'Rich natural aroma and authentic flavor for daily cooking.',
    'Perfect for vegetables, meat, fish, curries, and pickles.',
    'No artificial colors or preservatives.',
    'Trusted choice for everyday family cooking.',
  ],
  testimonials: [
    {
      name: 'Sita Gurung',
      role: 'Butwal, Sukhanagar',
      quote:
        "I've been using this Pure Mustard Oil for my family's daily cooking, and the aroma is wonderful. It gives vegetables and meat a delicious traditional taste. I'm very happy with the quality.",
      rating: 5,
    },
    {
      name: 'Ram Bahadur Thapa',
      role: 'Bhairahwa',
      quote:
        'I was looking for pure mustard oil without any strange smell or impurities. This oil exceeded my expectations. The golden color and fresh aroma show its quality. I will definitely buy it again.',
      rating: 5,
    },
    {
      name: 'Maya Rai',
      role: 'Butwal, Golpark',
      quote:
        'I use this mustard oil for cooking vegetables, fish, and pickles. The food tastes rich and authentic, just like homemade meals from my childhood. I highly recommend it to anyone who loves traditional cooking.',
      rating: 5,
    },
  ],
  faqs: [
    {
      question: 'Is this 100% pure mustard oil?',
      answer: 'Yes. Our mustard oil is made from carefully selected mustard seeds to provide pure quality and authentic taste.',
    },
    {
      question: 'What can I use this mustard oil for?',
      answer:
        'Our mustard oil is ideal for cooking vegetables, meat, fish, curries, and traditional Nepali recipes. It can also be used for making pickles.',
    },
    {
      question: 'Does the oil have a strong mustard aroma?',
      answer: 'Yes. Pure mustard oil naturally has a rich, distinctive aroma that enhances the flavor of your food.',
    },
    {
      question: 'How should I store the oil?',
      answer: 'Store the bottle in a cool, dry place away from direct sunlight. Always keep the cap tightly closed after use.',
    },
    {
      question: 'Do you offer home delivery?',
      answer: 'Yes. We provide home delivery across Nepal. Delivery time may vary depending on your location.',
    },
  ],
  trustPoints: ['Cash on Delivery available', 'Delivery within 24 hours', 'Customer support', 'Easy order process'],
  customerEmailSignature: 'Thank you for shopping with Dhara.',
  deliveryNote:
    'Butwal delivery is free. Outside Butwal Sub Metropolitan, delivery is based on distance and will be confirmed before dispatch.',
};

export function formatMoney(amount: number, currency = siteConfig.currency) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function getPricing(quantity: number) {
  const normalizedQuantity = Math.max(1, Math.floor(quantity));
  const unitPrice = siteConfig.price;
  const subtotal = unitPrice * normalizedQuantity;
  const discount = normalizedQuantity >= 5 ? subtotal * 0.1 : 0;
  const deliveryFee = 0;
  const total = subtotal - discount + deliveryFee;

  return {
    quantity: normalizedQuantity,
    unitPrice,
    subtotal,
    discount,
    deliveryFee,
    total,
  };
}

export function buildCheckoutHref(params?: { quantity?: number }) {
  const quantity = Math.max(1, params?.quantity ?? 1);
  const pricing = getPricing(quantity);
  const query = new URLSearchParams({
    productName: siteConfig.productName,
    quantity: String(pricing.quantity),
    pricePerPiece: String(pricing.unitPrice),
    totalPrice: String(pricing.total),
  });

  return `/checkout?${query.toString()}`;
}

export function buildThankYouHref(order: {
  orderId: string;
  productName: string;
  quantity: number;
  totalPrice: number;
}) {
  const query = new URLSearchParams({
    orderId: order.orderId,
    productName: order.productName,
    quantity: String(order.quantity),
    totalPrice: String(order.totalPrice),
  });

  return `/thank-you?${query.toString()}`;
}
