export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() || '';

type MetaPixelEventPayload = Record<string, string | number | boolean | string[] | undefined>;

export function isMetaPixelEnabled() {
  return META_PIXEL_ID.length > 0;
}

export function getMetaPixelBootstrapScript(pixelId: string = META_PIXEL_ID) {
  if (!pixelId) return '';

  return `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${pixelId}');
fbq('track', 'PageView');`;
}

export function trackMetaPixelEvent(eventName: string, payload: MetaPixelEventPayload = {}) {
  if (typeof window === 'undefined') return;

  const fbq = (window as typeof window & {
    fbq?: (...args: Array<unknown>) => void;
  }).fbq;

  if (!fbq) return;

  fbq('track', eventName, payload);
}

export function trackMetaPixelPageView() {
  trackMetaPixelEvent('PageView');
}
