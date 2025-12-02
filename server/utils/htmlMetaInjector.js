/**
 * HTML Meta Tag Injector for SEO
 * Injects meta tags into HTML for public podcast pages
 */

/**
 * Escape HTML special characters to prevent XSS
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  if (!str) return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/**
 * Strip HTML tags from a string
 * @param {string} html
 * @returns {string}
 */
function stripHtml(html) {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, '').trim()
}

/**
 * Truncate text to a maximum length
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
function truncate(text, maxLength = 160) {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength - 3) + '...'
}

/**
 * Generate meta tags for a podcast page
 * @param {Object} podcast - Podcast data from RssFeedManager
 * @param {string} hostPrefix - Host prefix (e.g., https://example.com/ai)
 * @returns {string} - HTML meta tags string
 */
function generatePodcastMetaTags(podcast, hostPrefix) {
  const title = escapeHtml(podcast.title || 'Podcast')
  const description = escapeHtml(truncate(stripHtml(podcast.description), 160))
  const author = escapeHtml(podcast.author || 'Unknown')
  const coverUrl = podcast.coverUrl || `${hostPrefix}/Logo.png`
  const pageUrl = `${hostPrefix}/p/${podcast.slug}`
  const feedUrl = podcast.feedURL

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'PodcastSeries',
    name: podcast.title || 'Podcast',
    description: stripHtml(podcast.description) || '',
    image: coverUrl,
    author: {
      '@type': 'Person',
      name: podcast.author || 'Unknown'
    },
    url: pageUrl,
    webFeed: feedUrl
  }

  return `
    <title>${title}</title>
    <meta data-n-head="ssr" name="description" content="${description}">
    <meta data-n-head="ssr" name="author" content="${author}">
    <meta data-n-head="ssr" name="robots" content="index, follow">
    <meta data-n-head="ssr" property="og:title" content="${title}">
    <meta data-n-head="ssr" property="og:description" content="${description}">
    <meta data-n-head="ssr" property="og:image" content="${escapeHtml(coverUrl)}">
    <meta data-n-head="ssr" property="og:type" content="website">
    <meta data-n-head="ssr" property="og:url" content="${escapeHtml(pageUrl)}">
    <meta data-n-head="ssr" property="og:site_name" content="TFHPpodcast">
    <meta data-n-head="ssr" name="twitter:card" content="summary_large_image">
    <meta data-n-head="ssr" name="twitter:title" content="${title}">
    <meta data-n-head="ssr" name="twitter:description" content="${description}">
    <meta data-n-head="ssr" name="twitter:image" content="${escapeHtml(coverUrl)}">
    <link data-n-head="ssr" rel="alternate" type="application/rss+xml" title="${title}" href="${escapeHtml(feedUrl)}">
    <script data-n-head="ssr" type="application/ld+json">${JSON.stringify(jsonLd)}</script>
  `
}

/**
 * Generate meta tags for an episode page
 * @param {Object} podcast - Podcast data from RssFeedManager
 * @param {Object} episode - Episode data
 * @param {string} hostPrefix - Host prefix (e.g., https://example.com/ai)
 * @returns {string} - HTML meta tags string
 */
function generateEpisodeMetaTags(podcast, episode, hostPrefix) {
  const episodeTitle = escapeHtml(episode.title || 'Episode')
  const fullTitle = escapeHtml(`${episode.title || 'Episode'} - ${podcast.title || 'Podcast'}`)
  const description = escapeHtml(truncate(stripHtml(episode.description), 160))
  const author = escapeHtml(podcast.author || 'Unknown')
  const coverUrl = podcast.coverUrl || `${hostPrefix}/Logo.png`
  const pageUrl = `${hostPrefix}/p/${podcast.slug}/episode/${episode.id}`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'PodcastEpisode',
    name: episode.title || 'Episode',
    description: stripHtml(episode.description) || '',
    image: coverUrl,
    url: pageUrl,
    partOfSeries: {
      '@type': 'PodcastSeries',
      name: podcast.title || 'Podcast',
      url: `${hostPrefix}/p/${podcast.slug}`
    }
  }

  return `
    <title>${fullTitle}</title>
    <meta data-n-head="ssr" name="description" content="${description}">
    <meta data-n-head="ssr" name="author" content="${author}">
    <meta data-n-head="ssr" name="robots" content="index, follow">
    <meta data-n-head="ssr" property="og:title" content="${episodeTitle}">
    <meta data-n-head="ssr" property="og:description" content="${description}">
    <meta data-n-head="ssr" property="og:image" content="${escapeHtml(coverUrl)}">
    <meta data-n-head="ssr" property="og:type" content="website">
    <meta data-n-head="ssr" property="og:url" content="${escapeHtml(pageUrl)}">
    <meta data-n-head="ssr" property="og:site_name" content="TFHPpodcast">
    <meta data-n-head="ssr" name="twitter:card" content="summary_large_image">
    <meta data-n-head="ssr" name="twitter:title" content="${episodeTitle}">
    <meta data-n-head="ssr" name="twitter:description" content="${description}">
    <meta data-n-head="ssr" name="twitter:image" content="${escapeHtml(coverUrl)}">
    <script data-n-head="ssr" type="application/ld+json">${JSON.stringify(jsonLd)}</script>
  `
}

/**
 * Inject meta tags into HTML
 * Replaces existing title and adds meta tags before </head>
 * @param {string} html - Original HTML string
 * @param {string} metaTags - Meta tags to inject
 * @returns {string} - Modified HTML string
 */
function injectMetaTags(html, metaTags) {
  // Remove the existing <title> tag
  html = html.replace(/<title>[^<]*<\/title>/, '')

  // Remove existing meta tags that we're replacing
  html = html.replace(/<meta[^>]*data-hid="description"[^>]*>/g, '')
  html = html.replace(/<meta[^>]*data-hid="robots"[^>]*>/g, '')
  html = html.replace(/<meta[^>]*data-hid="og:title"[^>]*>/g, '')
  html = html.replace(/<meta[^>]*data-hid="og:type"[^>]*>/g, '')
  html = html.replace(/<meta[^>]*data-hid="og:site_name"[^>]*>/g, '')

  // Inject meta tags before </head>
  return html.replace('</head>', metaTags + '\n</head>')
}

module.exports = {
  generatePodcastMetaTags,
  generateEpisodeMetaTags,
  injectMetaTags,
  escapeHtml,
  stripHtml,
  truncate
}
