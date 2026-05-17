import { useEffect } from 'react';

const APP_NAME = 'Marketplace';

function setMeta(name, content, attr = 'name') {
  if (!content) return;
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) { el = document.createElement('meta'); el.setAttribute(attr, name); document.head.appendChild(el); }
  el.setAttribute('content', content);
}

export function useMeta({ title, description, image, url } = {}) {
  useEffect(() => {
    const fullTitle = title ? `${title} — ${APP_NAME}` : APP_NAME;
    document.title = fullTitle;
    if (description) {
      setMeta('description', description);
      setMeta('og:description', description, 'property');
      setMeta('twitter:description', description, 'name');
    }
    if (image) {
      setMeta('og:image', image, 'property');
      setMeta('twitter:image', image, 'name');
    }
    setMeta('og:title', fullTitle, 'property');
    setMeta('twitter:title', fullTitle, 'name');
    setMeta('og:url', url || window.location.href, 'property');
  }, [title, description, image, url]);
}
