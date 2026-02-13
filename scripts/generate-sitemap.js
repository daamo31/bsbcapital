import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.join(__dirname, '../public');
const SITEMAP_PATH = path.join(PUBLIC_DIR, 'sitemap.xml');

const BASE_URL = 'https://bsbcapital.io';

// Define static routes with priorities
const routes = [
  // Main Pages
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/empresa', priority: '0.8', changefreq: 'monthly' },
  { path: '/contacto', priority: '0.5', changefreq: 'monthly' },

  // Services
  { path: '/consultoria-cripto', priority: '0.9', changefreq: 'weekly' },
  { path: '/formacion-criptoactivos', priority: '0.9', changefreq: 'weekly' },
  { path: '/paquetes-cripto', priority: '0.8', changefreq: 'weekly' },
  { path: '/servicios-adicionales-cripto', priority: '0.7', changefreq: 'monthly' },

  // Tools & Content
  { path: '/bsb-maker', priority: '0.7', changefreq: 'monthly' },
  { path: '/blog', priority: '0.6', changefreq: 'weekly' },
  { path: '/guia-inversion', priority: '0.6', changefreq: 'monthly' },
];

const generateSitemap = () => {
  const currentDate = new Date().toISOString().split('T')[0];

  const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (route) => `  <url>
    <loc>${BASE_URL}${route.path}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  fs.writeFileSync(SITEMAP_PATH, sitemapContent);
  console.log(`✅ Sitemap created at ${SITEMAP_PATH}`);
};

generateSitemap();
