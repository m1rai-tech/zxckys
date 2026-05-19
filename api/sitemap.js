import { createClient } from '@supabase/supabase-js';

const SITE_URL = process.env.APP_URL;
if (!SITE_URL) throw new Error('APP_URL environment variable is not set');

// static pages that should always be in the sitemap
const STATIC_PATHS = [
  ['/', '1.0', 'hourly'],
  ['/c/tech', '0.8', 'daily'],
  ['/c/auto', '0.8', 'daily'],
  ['/c/realestate', '0.8', 'daily'],
  ['/c/clothes', '0.8', 'daily'],
  ['/c/furniture', '0.8', 'daily'],
  ['/c/sports', '0.8', 'daily'],
  ['/c/kids', '0.8', 'daily'],
  ['/c/jobs', '0.8', 'daily'],
  ['/c/services', '0.8', 'daily'],
  ['/c/books', '0.8', 'daily'],
  ['/c/gaming', '0.8', 'daily'],
  ['/c/free', '0.8', 'daily'],
  ['/privacy', '0.3', 'monthly'],
  ['/terms', '0.3', 'monthly'],
  ['/help', '0.4', 'monthly'],
];

export default async function handler(req, res) {
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY,
  );

  // grab all active listing IDs — no content needed, just IDs + dates
  const { data: listings } = await supabase
    .from('listings')
    .select('id, updated_at')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(10000);

  const staticXml = STATIC_PATHS.map(([path, priority, freq]) =>
    `  <url>\n    <loc>${SITE_URL}${path}</loc>\n    <changefreq>${freq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`
  ).join('\n');

  const listingXml = (listings || []).map(l => {
    const date = new Date(l.updated_at).toISOString().split('T')[0];
    return `  <url>\n    <loc>${SITE_URL}/listing/${l.id}</loc>\n    <lastmod>${date}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.6</priority>\n  </url>`;
  }).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${staticXml}\n${listingXml}\n</urlset>`;

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
  res.status(200).send(xml);
}
