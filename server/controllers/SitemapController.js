const { Op } = require('sequelize')
const Database = require('../Database')
const { buildSitemapIndex, buildUrlset } = require('../utils/sitemapBuilder')

class SitemapController {
  constructor() {}

  /**
   * GET /sitemap.xml
   * Returns Sitemap Index listing all sub-sitemaps
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  async getSitemapIndex(req, res) {
    const hostPrefix = req.originalHostPrefix

    try {
      // Query all indexable feeds
      const feeds = await Database.feedModel.findAll({
        where: {
          preventIndexing: {
            [Op.ne]: true
          }
        },
        attributes: ['slug', 'updatedAt']
      })

      // If no feeds, return empty sitemap index
      if (!feeds.length) {
        res.set('Content-Type', 'application/xml')
        return res.send(buildSitemapIndex([]))
      }

      // Find the most recent update time across all feeds
      const mostRecentUpdate = feeds.reduce((latest, feed) => {
        return feed.updatedAt > latest ? feed.updatedAt : latest
      }, feeds[0].updatedAt)

      const sitemaps = [
        { loc: `${hostPrefix}/sitemap/podcasts.xml`, lastmod: mostRecentUpdate }
      ]

      // Add individual sitemap for each podcast
      for (const feed of feeds) {
        sitemaps.push({
          loc: `${hostPrefix}/sitemap/podcast/${feed.slug}.xml`,
          lastmod: feed.updatedAt
        })
      }

      res.set('Content-Type', 'application/xml')
      res.send(buildSitemapIndex(sitemaps))
    } catch (error) {
      console.error('[SitemapController] Error generating sitemap index:', error)
      res.status(500).send('Error generating sitemap')
    }
  }

  /**
   * GET /sitemap/podcasts.xml
   * Returns sitemap with all podcast main pages
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  async getPodcastsSitemap(req, res) {
    const hostPrefix = req.originalHostPrefix

    try {
      const feeds = await Database.feedModel.findAll({
        where: {
          preventIndexing: {
            [Op.ne]: true
          }
        },
        attributes: ['slug', 'updatedAt']
      })

      const urls = feeds.map((feed) => ({
        loc: `${hostPrefix}/p/${feed.slug}`,
        lastmod: feed.updatedAt,
        changefreq: 'weekly',
        priority: 0.8
      }))

      res.set('Content-Type', 'application/xml')
      res.send(buildUrlset(urls))
    } catch (error) {
      console.error('[SitemapController] Error generating podcasts sitemap:', error)
      res.status(500).send('Error generating sitemap')
    }
  }

  /**
   * GET /sitemap/podcast/:slug.xml
   * Returns sitemap with all episodes for a specific podcast
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  async getPodcastEpisodesSitemap(req, res) {
    const { slug } = req.params
    const hostPrefix = req.originalHostPrefix

    try {
      const feed = await Database.feedModel.findOne({
        where: {
          slug,
          preventIndexing: {
            [Op.ne]: true
          }
        },
        include: [
          {
            model: Database.feedEpisodeModel,
            attributes: ['id', 'updatedAt', 'pubDate']
          }
        ]
      })

      if (!feed) {
        return res.status(404).send('Sitemap not found')
      }

      const urls = feed.feedEpisodes.map((episode) => ({
        loc: `${hostPrefix}/p/${slug}/episode/${episode.id}`,
        lastmod: episode.updatedAt || episode.pubDate,
        changefreq: 'monthly',
        priority: 0.6
      }))

      res.set('Content-Type', 'application/xml')
      res.send(buildUrlset(urls))
    } catch (error) {
      console.error('[SitemapController] Error generating podcast episodes sitemap:', error)
      res.status(500).send('Error generating sitemap')
    }
  }

  /**
   * GET /robots.txt
   * Returns dynamically generated robots.txt with correct router base path
   * Note: This route is registered on app (not router) so originalHostPrefix may not be set
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  getRobotsTxt(req, res) {
    // Build host prefix manually since this route is outside the RouterBasePath middleware
    const host = req.get('host')
    const protocol = req.secure || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http'
    const hostPrefix = `${protocol}://${host}${global.RouterBasePath}`

    const robotsTxt = `User-Agent: *
# Block most of the site for privacy
Disallow: /config/
Disallow: /login
Disallow: /account
Disallow: /batch
Disallow: /upload

# Allow public RSS feeds and podcast content
Allow: /feed/
Allow: /item/
Allow: /p/
Allow: /sitemap.xml
Allow: /sitemap/
Allow: /robots.txt

Sitemap: ${hostPrefix}/sitemap.xml
`

    res.set('Content-Type', 'text/plain')
    res.send(robotsTxt)
  }
}

module.exports = new SitemapController()
