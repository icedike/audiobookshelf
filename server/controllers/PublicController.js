const { Request, Response } = require('express')
const uuid = require('uuid')
const Logger = require('../Logger')

const RssFeedManager = require('../managers/RssFeedManager')
const PlaybackSession = require('../objects/PlaybackSession')

/**
 * In-memory storage for public podcast playback sessions
 */
class PodcastSessionManager {
  constructor() {
    /** @type {Map<string, PlaybackSession>} */
    this.sessions = new Map()
  }

  /**
   * Get or create a playback session
   * @param {string} sessionId
   * @returns {PlaybackSession|null}
   */
  getSession(sessionId) {
    return this.sessions.get(sessionId) || null
  }

  /**
   * Create a new session
   * @param {string} sessionId
   * @param {PlaybackSession} session
   */
  setSession(sessionId, session) {
    this.sessions.set(sessionId, session)
  }

  /**
   * Update session progress
   * @param {string} sessionId
   * @param {string} episodeId
   * @param {number} currentTime
   */
  updateProgress(sessionId, episodeId, currentTime) {
    const session = this.sessions.get(sessionId)
    if (session) {
      session.currentTime = currentTime
      session.currentEpisodeId = episodeId
      session.updatedAt = Date.now()
    }
  }

  /**
   * Clean up old sessions (older than 7 days)
   */
  cleanup() {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.updatedAt < sevenDaysAgo) {
        this.sessions.delete(sessionId)
      }
    }
  }
}

const podcastSessionManager = new PodcastSessionManager()

// Cleanup old sessions every hour
setInterval(() => {
  podcastSessionManager.cleanup()
}, 60 * 60 * 1000)

class PublicController {
  constructor() {}

  /**
   * Public route
   * GET: /p/:slug
   * Get public podcast page data by slug
   *
   * @this {import('../routers/PublicRouter')}
   *
   * @param {Request} req
   * @param {Response} res
   */
  async getPublicPodcast(req, res) {
    const { slug } = req.params

    try {
      const serverAddress = req.originalHostPrefix || `${req.protocol}://${req.get('host')}${global.RouterBasePath}`
      const feedData = await RssFeedManager.getFeedDataAsJson(slug, serverAddress)

      if (!feedData) {
        Logger.warn(`[PublicController] Podcast feed not found with slug ${slug}`)
        return res.status(404).send('Podcast not found')
      }

      // Get or create session for progress tracking
      let sessionId = req.cookies.podcast_session_id
      let sessionProgress = null

      if (sessionId && uuid.validate(sessionId)) {
        const session = podcastSessionManager.getSession(sessionId)
        if (session) {
          sessionProgress = {
            currentEpisodeId: session.currentEpisodeId,
            currentTime: session.currentTime
          }
        }
      }

      if (!sessionId) {
        sessionId = uuid.v4()
        // 30 day cookie
        res.cookie('podcast_session_id', sessionId, {
          maxAge: 1000 * 60 * 60 * 24 * 30,
          httpOnly: true,
          sameSite: 'lax'
        })
      }

      const response = {
        ...feedData,
        sessionProgress
      }

      res.json(response)
    } catch (error) {
      Logger.error(`[PublicController] Failed to get public podcast`, error)
      res.status(500).send('Internal server error')
    }
  }

  /**
   * Public route
   * PATCH: /p/:slug/episode/:episodeId/progress
   * Update episode playback progress
   *
   * @param {Request} req
   * @param {Response} res
   */
  async updateEpisodeProgress(req, res) {
    const { slug, episodeId } = req.params
    const { currentTime } = req.body

    if (currentTime === null || currentTime === undefined || isNaN(currentTime) || currentTime < 0) {
      return res.status(400).send('Invalid current time')
    }

    const sessionId = req.cookies.podcast_session_id
    if (!sessionId) {
      return res.status(400).send('No session cookie found')
    }

    try {
      podcastSessionManager.updateProgress(sessionId, episodeId, currentTime)
      Logger.debug(`[PublicController] Updated progress for session ${sessionId}, episode ${episodeId}: ${currentTime}s`)
      res.sendStatus(204)
    } catch (error) {
      Logger.error(`[PublicController] Failed to update progress`, error)
      res.status(500).send('Internal server error')
    }
  }
}

module.exports = new PublicController()
