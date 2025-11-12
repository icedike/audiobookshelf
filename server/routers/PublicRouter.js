const express = require('express')
const ShareController = require('../controllers/ShareController')
const SessionController = require('../controllers/SessionController')
const PublicController = require('../controllers/PublicController')

class PublicRouter {
  constructor(playbackSessionManager) {
    /** @type {import('../managers/PlaybackSessionManager')} */
    this.playbackSessionManager = playbackSessionManager

    this.router = express()
    this.router.disable('x-powered-by')
    this.init()
  }

  init() {
    // Share routes
    this.router.get('/share/:slug', ShareController.getMediaItemShareBySlug.bind(this))
    this.router.get('/share/:slug/track/:index', ShareController.getMediaItemShareAudioTrack.bind(this))
    this.router.get('/share/:slug/cover', ShareController.getMediaItemShareCoverImage.bind(this))
    this.router.get('/share/:slug/download', ShareController.downloadMediaItemShare.bind(this))
    this.router.patch('/share/:slug/progress', ShareController.updateMediaItemShareProgress.bind(this))

    // Session routes
    this.router.get('/session/:id/track/:index', SessionController.getTrack.bind(this))

    // Public podcast routes
    this.router.get('/p/:slug', PublicController.getPublicPodcast.bind(this))
    this.router.get('/p/:slug/episode/:episodeId', PublicController.getPublicEpisode.bind(this))
    this.router.patch('/p/:slug/episode/:episodeId/progress', PublicController.updateEpisodeProgress.bind(this))
  }
}
module.exports = PublicRouter
