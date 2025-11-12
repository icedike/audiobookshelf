<template>
  <div class="w-full min-h-screen bg-bg text-white">
    <!-- Breadcrumb Navigation -->
    <div class="w-full bg-primary bg-opacity-20">
      <div class="max-w-6xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
        <nav class="flex items-center text-sm text-gray-400">
          <nuxt-link :to="`/p/${podcast.slug}`" class="hover:text-white transition-colors">
            {{ podcast.title }}
          </nuxt-link>
          <span class="mx-2">›</span>
          <span class="text-white">{{ episode.title }}</span>
        </nav>
      </div>
    </div>

    <!-- Episode Header -->
    <div class="w-full bg-primary bg-opacity-30">
      <div class="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div class="flex flex-col md:flex-row gap-6">
          <!-- Cover Image -->
          <div class="flex-shrink-0">
            <div class="w-48 h-48 sm:w-64 sm:h-64 mx-auto md:mx-0 rounded-lg overflow-hidden shadow-lg">
              <img :src="podcast.coverUrl" :alt="podcast.title" class="w-full h-full object-cover" />
            </div>
          </div>

          <!-- Episode Info -->
          <div class="flex-1 flex flex-col justify-center">
            <h1 class="text-3xl sm:text-4xl font-bold mb-2 line-clamp-3">{{ episode.title }}</h1>

            <div class="flex flex-wrap items-center gap-2 text-sm text-gray-400 mb-4">
              <span v-if="episode.pubDate">{{ formatDate(episode.pubDate) }}</span>
              <span v-if="episode.duration">•</span>
              <span v-if="episode.duration">{{ formatDuration(episode.duration) }}</span>
              <span v-if="episode.explicit" class="px-2 py-0.5 bg-red-500 bg-opacity-20 text-red-400 rounded text-xs">Explicit</span>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-3">
              <button @click="togglePlay" class="flex items-center gap-2 px-6 py-3 bg-success hover:bg-success-hover text-white rounded-md transition-colors" :class="{ 'bg-yellow-500 hover:bg-yellow-600': isPlaying }">
                <span class="material-symbols text-2xl">
                  {{ isPlaying ? 'pause' : 'play_arrow' }}
                </span>
                <span class="text-lg font-semibold">{{ isPlaying ? 'Pause' : 'Play' }}</span>
              </button>

              <button @click="showShareModal = true" class="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-md transition-colors border border-gray-600">
                <span class="material-symbols">share</span>
                <span>Share</span>
              </button>
            </div>

            <!-- Share Modal -->
            <div v-if="showShareModal" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" @click.self="showShareModal = false">
              <div class="bg-primary rounded-lg shadow-xl max-w-md w-full p-6" @click.stop>
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-xl font-semibold">Share Episode</h3>
                  <button @click="showShareModal = false" class="text-gray-400 hover:text-white">
                    <span class="material-symbols text-2xl">close</span>
                  </button>
                </div>

                <p class="text-sm text-gray-300 mb-4">Share "{{ episode.title }}" with others:</p>

                <!-- Page URL -->
                <div class="bg-bg rounded-md p-3 mb-4 flex items-center gap-2">
                  <input ref="urlInput" :value="episodePageUrl" readonly class="flex-1 bg-transparent text-sm outline-none text-gray-300" @click="selectAllUrl" />
                  <button @click="copyEpisodeUrl" class="px-3 py-1 bg-primary hover:bg-primary-hover rounded text-sm transition-colors border border-gray-600">
                    {{ urlCopied ? 'Copied!' : 'Copy' }}
                  </button>
                </div>

                <!-- Share on Social Media -->
                <div class="mb-4">
                  <p class="text-sm text-gray-400 mb-2">Share on:</p>
                  <div class="flex flex-wrap gap-2">
                    <a v-for="platform in socialPlatforms" :key="platform.name" :href="platform.url" target="_blank" rel="noopener noreferrer" class="flex items-center gap-2 px-3 py-2 bg-bg hover:bg-primary rounded text-sm transition-colors border border-gray-600">
                      <span>{{ platform.icon }}</span>
                      <span>{{ platform.name }}</span>
                    </a>
                  </div>
                </div>

                <!-- Native Share (if available) -->
                <button v-if="canUseNativeShare" @click="nativeShareEpisode" class="w-full flex items-center justify-center gap-2 px-4 py-2 bg-success hover:bg-success-hover text-white rounded-md transition-colors">
                  <span class="material-symbols text-base">ios_share</span>
                  <span>More sharing options...</span>
                </button>
              </div>
            </div>

            <!-- Progress Bar -->
            <div v-if="hasProgress" class="mt-4">
              <div class="w-full bg-gray-700 rounded-full h-2">
                <div class="bg-success h-2 rounded-full transition-all" :style="{ width: progressPercent + '%' }"></div>
              </div>
              <p class="text-xs text-gray-500 mt-1">{{ formatTime(currentTime) }} / {{ formatDuration(episode.duration) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Episode Content -->
    <div class="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <!-- Audio Player (shown when playing) -->
      <div v-if="showPlayer" class="mb-8 bg-primary bg-opacity-30 rounded-lg p-6">
        <audio ref="audioPlayer" :src="episode.audioUrl" @timeupdate="handleTimeUpdate" @loadedmetadata="handleLoadedMetadata" @ended="handleEnded" @play="handlePlay" @pause="handlePause" class="w-full" controls controlsList="nodownload"></audio>
      </div>

      <!-- Episode Description -->
      <div v-if="episode.description" class="bg-primary bg-opacity-20 rounded-lg p-6 mb-8">
        <h2 class="text-2xl font-bold mb-4">Episode Description</h2>
        <div class="prose prose-invert max-w-none text-gray-300" v-html="episode.description"></div>
      </div>

      <!-- Back Button -->
      <nuxt-link :to="`/p/${podcast.slug}`" class="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-md transition-colors">
        <span class="material-symbols">arrow_back</span>
        <span>Back to Podcast</span>
      </nuxt-link>
    </div>
  </div>
</template>

<script>
export default {
  layout: 'blank',
  async asyncData({ params, error, app }) {
    const data = await app.$axios.$get(`/public/p/${params.slug}/episode/${params.episodeId}`, { timeout: 10000 }).catch((err) => {
      console.error('Failed to fetch episode', err)
      return null
    })

    if (!data) {
      return error({ statusCode: 404, message: 'Episode not found' })
    }

    return {
      podcast: data.podcast,
      episode: data.episode,
      initialProgress: data.sessionProgress || 0
    }
  },
  data() {
    return {
      showPlayer: false,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      saveProgressInterval: null,
      showShareModal: false,
      urlCopied: false
    }
  },
  head() {
    return {
      title: `${this.episode.title} - ${this.podcast.title}`,
      meta: [
        { hid: 'description', name: 'description', content: this.episodeDescription },
        { hid: 'author', name: 'author', content: this.podcast.author || 'Unknown' },

        // Open Graph tags
        { hid: 'og:title', property: 'og:title', content: this.episode.title },
        { hid: 'og:description', property: 'og:description', content: this.episodeDescription },
        { hid: 'og:image', property: 'og:image', content: this.podcast.coverUrl },
        { hid: 'og:type', property: 'og:type', content: 'website' },

        // Twitter Card tags
        { hid: 'twitter:card', name: 'twitter:card', content: 'summary_large_image' },
        { hid: 'twitter:title', name: 'twitter:title', content: this.episode.title },
        { hid: 'twitter:description', name: 'twitter:description', content: this.episodeDescription },
        { hid: 'twitter:image', name: 'twitter:image', content: this.podcast.coverUrl }
      ]
    }
  },
  computed: {
    episodeDescription() {
      if (!this.episode.description) return ''
      const div = document.createElement('div')
      div.innerHTML = this.episode.description
      return (div.textContent || div.innerText || '').substring(0, 200)
    },
    hasProgress() {
      return this.currentTime > 0
    },
    progressPercent() {
      if (!this.duration) return 0
      return Math.min((this.currentTime / this.duration) * 100, 100)
    },
    audioElement() {
      return this.$refs.audioPlayer || null
    },
    episodePageUrl() {
      if (process.client) {
        return window.location.href
      }
      return ''
    },
    canUseNativeShare() {
      return process.client && navigator.share
    },
    socialPlatforms() {
      const encodedUrl = encodeURIComponent(this.episodePageUrl)
      const encodedTitle = encodeURIComponent(this.episode.title)

      return [
        {
          name: 'Twitter',
          icon: '𝕏',
          url: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`
        },
        {
          name: 'Facebook',
          icon: 'f',
          url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
        },
        {
          name: 'LinkedIn',
          icon: 'in',
          url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
        },
        {
          name: 'Email',
          icon: '📧',
          url: `mailto:?subject=${encodedTitle}&body=Check out this episode: ${encodedUrl}`
        }
      ]
    }
  },
  watch: {
    urlCopied(newVal) {
      if (newVal) {
        setTimeout(() => {
          this.urlCopied = false
        }, 2000)
      }
    }
  },
  mounted() {
    // Initialize progress from session
    if (this.initialProgress > 0) {
      this.currentTime = this.initialProgress
    }

    // Auto-save progress every 10 seconds
    this.saveProgressInterval = setInterval(() => {
      if (this.isPlaying) {
        this.saveProgress()
      }
    }, 10000)
  },
  beforeDestroy() {
    // Save final progress before leaving
    if (this.currentTime > 0) {
      this.saveProgress()
    }
    if (this.saveProgressInterval) {
      clearInterval(this.saveProgressInterval)
    }
  },
  methods: {
    togglePlay() {
      if (!this.showPlayer) {
        this.showPlayer = true
        this.$nextTick(() => {
          if (this.audioElement) {
            this.audioElement.currentTime = this.currentTime
            this.audioElement.play()
          }
        })
      } else {
        if (this.audioElement) {
          if (this.isPlaying) {
            this.audioElement.pause()
          } else {
            this.audioElement.play()
          }
        }
      }
    },
    handleTimeUpdate(event) {
      this.currentTime = event.target.currentTime
    },
    handleLoadedMetadata(event) {
      this.duration = event.target.duration
    },
    handleEnded() {
      this.isPlaying = false
      this.saveProgress()
    },
    handlePlay() {
      this.isPlaying = true
    },
    handlePause() {
      this.isPlaying = false
      this.saveProgress()
    },
    saveProgress() {
      this.$axios
        .$patch(`/public/p/${this.podcast.slug}/episode/${this.episode.id}/progress`, { currentTime: this.currentTime }, { progress: false })
        .catch((error) => {
          console.error('Failed to save progress', error)
        })
    },
    formatDate(dateString) {
      try {
        const date = new Date(dateString)
        return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
      } catch {
        return dateString
      }
    },
    formatDuration(seconds) {
      if (!seconds || isNaN(seconds)) return '0:00'
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      const secs = Math.floor(seconds % 60)

      if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      }
      return `${minutes}:${secs.toString().padStart(2, '0')}`
    },
    formatTime(seconds) {
      return this.formatDuration(seconds)
    },
    selectAllUrl() {
      if (this.$refs.urlInput) {
        this.$refs.urlInput.select()
      }
    },
    async copyEpisodeUrl() {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(this.episodePageUrl)
          this.urlCopied = true
        } else {
          // Fallback for older browsers
          this.selectAllUrl()
          document.execCommand('copy')
          this.urlCopied = true
        }
      } catch (error) {
        console.error('Failed to copy:', error)
      }
    },
    async nativeShareEpisode() {
      if (!navigator.share) return

      try {
        await navigator.share({
          title: this.episode.title,
          text: `Check out this podcast episode: ${this.episode.title}`,
          url: this.episodePageUrl
        })
        this.showShareModal = false
      } catch (error) {
        // User cancelled or error occurred
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error)
        }
      }
    }
  }
}
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.prose {
  line-height: 1.75;
}

.prose p {
  margin-bottom: 1em;
}

.prose a {
  color: #60a5fa;
  text-decoration: underline;
}

.prose a:hover {
  color: #93c5fd;
}
</style>
