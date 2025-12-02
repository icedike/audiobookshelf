/**
 * Sitemap XML Builder Utilities
 * @see https://www.sitemaps.org/protocol.html
 */

/**
 * Build Sitemap Index XML
 * @param {Array<{loc: string, lastmod: Date}>} sitemaps
 * @returns {string}
 */
function buildSitemapIndex(sitemaps) {
  const items = sitemaps
    .map(
      (sitemap) => `  <sitemap>
    <loc>${escapeXml(sitemap.loc)}</loc>
    <lastmod>${formatDate(sitemap.lastmod)}</lastmod>
  </sitemap>`
    )
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${items}
</sitemapindex>`
}

/**
 * Build URL Set XML
 * @param {Array<{loc: string, lastmod?: Date, changefreq?: string, priority?: number}>} urls
 * @returns {string}
 */
function buildUrlset(urls) {
  const items = urls
    .map((url) => {
      const elements = [`    <loc>${escapeXml(url.loc)}</loc>`]
      if (url.lastmod) {
        elements.push(`    <lastmod>${formatDate(url.lastmod)}</lastmod>`)
      }
      if (url.changefreq) {
        elements.push(`    <changefreq>${url.changefreq}</changefreq>`)
      }
      if (url.priority !== undefined) {
        elements.push(`    <priority>${url.priority}</priority>`)
      }
      return `  <url>\n${elements.join('\n')}\n  </url>`
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${items}
</urlset>`
}

/**
 * Format date to ISO 8601 (W3C Datetime format)
 * @param {Date|string} date
 * @returns {string}
 */
function formatDate(date) {
  if (!date) return ''
  const d = new Date(date)
  return d.toISOString()
}

/**
 * Escape XML special characters
 * @param {string} str
 * @returns {string}
 */
function escapeXml(str) {
  if (!str) return ''
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
}

module.exports = {
  buildSitemapIndex,
  buildUrlset,
  formatDate,
  escapeXml
}
