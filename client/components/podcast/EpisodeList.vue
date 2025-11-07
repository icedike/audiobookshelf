<template>
  <div class="space-y-4">
    <div v-for="episode in episodes" :key="episode.id" class="bg-primary bg-opacity-30 rounded-lg overflow-hidden transition-all">
      <!-- Episode Card -->
      <div class="p-4 sm:p-6">
        <div class="flex gap-4">
          <!-- Play Button -->
          <button @click="togglePlay(episode)" class="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-success hover:bg-success-hover flex items-center justify-center transition-colors" :class="{ 'bg-yellow-500 hover:bg-yellow-600': isPlaying(episode.id) }">
            <span class="material-symbols text-2xl sm:text-3xl text-white">
              {{ isPlaying(episode.id) ? 'pause' : 'play_arrow' }}
            </span>
          </button>

          <!-- Episode Info -->
          <div class="flex-1 min-w-0">
            <h3 class="text-lg sm:text-xl font-semibold mb-1 line-clamp-2">{{ episode.title }}</h3>

            <div class="flex flex-wrap items-center gap-2 text-sm text-gray-400 mb-2">
              <span v-if="episode.pubDate">{{ formatDate(episode.pubDate) }}</span>
              <span v-if="episode.duration">•</span>
              <span v-if="episode.duration">{{ formatDuration(episode.duration) }}</span>
              <span v-if="episode.explicit" class="px-2 py-0.5 bg-red-500 bg-opacity-20 text-red-400 rounded text-xs">Explicit</span>
            </div>

            <!-- Episode Description -->
            <div v-if="episode.description" class="text-sm text-gray-300 line-clamp-2 mb-2" :class="{ 'line-clamp-none': expandedEpisode === episode.id }">
              <div v-html="episode.description"></div>
            </div>

            <button v-if="episode.description && episode.description.length > 200" @click="expandedEpisode = expandedEpisode === episode.id ? null : episode.id" class="text-sm text-primary-light hover:text-primary-lighter">
              {{ expandedEpisode === episode.id ? 'Show less' : 'Show more' }}
            </button>

            <!-- Progress Bar (if has progress) -->
            <div v-if="hasProgress(episode.id)" class="mt-3">
              <div class="w-full bg-gray-700 rounded-full h-1.5">
                <div class="bg-success h-1.5 rounded-full transition-all" :style="{ width: getProgressPercent(episode.id) + '%' }"></div>
              </div>
              <p class="text-xs text-gray-500 mt-1">{{ formatTime(getProgress(episode.id)) }} / {{ formatDuration(episode.duration) }}</p>
            </div>
          </div>
        </div>

        <!-- Audio Player (shown when playing) -->
        <div v-if="currentEpisodeId === episode.id" class="mt-4 pt-4 border-t border-gray-700">
          <audio ref="audioPlayer" :src="episode.audioUrl" @timeupdate="handleTimeUpdate" @loadedmetadata="handleLoadedMetadata" @ended="handleEnded" @play="handlePlay" @pause="handlePause" class="w-full" controls controlsList="nodownload"></audio>

          <!-- Custom Controls (optional, using native for simplicity) -->
          <div class="mt-3 text-xs text-gray-500 text-center">Use the controls above to play, pause, and seek through the episode</div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!episodes || episodes.length === 0" class="text-center py-12 text-gray-400">
      <span class="material-symbols text-6xl mb-4">library_music</span>
      <p>No episodes available</p>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    episodes: {
      type: Array,
      required: true
    },
    podcastSlug: {
      type: String,
      required: true
    },
    sessionProgress: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      currentEpisodeId: null,
      currentTime: 0,
      duration: 0,
      isAudioPlaying: false,
      expandedEpisode: null,
      progressTracker: {},
      saveProgressInterval: null
    }
  },
  computed: {
    audioElement() {
      return this.$refs.audioPlayer?.[0] || null
    }
  },
  watch: {
    currentEpisodeId(newId, oldId) {
      if (oldId) {
        // Save progress of previous episode
        this.saveProgress(oldId, this.currentTime)
      }
    }
  },
  mounted() {
    // Initialize progress from session
    if (this.sessionProgress) {
      this.progressTracker = {
        [this.sessionProgress.currentEpisodeId]: this.sessionProgress.currentTime || 0
      }

      // Auto-resume if there was progress
      if (this.sessionProgress.currentEpisodeId && this.sessionProgress.currentTime > 0) {
        const episode = this.episodes.find((ep) => ep.id === this.sessionProgress.currentEpisodeId)
        if (episode) {
          this.currentEpisodeId = episode.id
          this.$nextTick(() => {
            if (this.audioElement) {
              this.audioElement.currentTime = this.sessionProgress.currentTime
            }
          })
        }
      }
    }

    // Auto-save progress every 10 seconds
    this.saveProgressInterval = setInterval(() => {
      if (this.currentEpisodeId && this.isAudioPlaying) {
        this.saveProgress(this.currentEpisodeId, this.currentTime)
      }
    }, 10000)
  },
  beforeDestroy() {
    // Save final progress before leaving
    if (this.currentEpisodeId) {
      this.saveProgress(this.currentEpisodeId, this.currentTime)
    }
    if (this.saveProgressInterval) {
      clearInterval(this.saveProgressInterval)
    }
  },
  methods: {
    isPlaying(episodeId) {
      return this.currentEpisodeId === episodeId && this.isAudioPlaying
    },
    togglePlay(episode) {
      if (this.currentEpisodeId === episode.id) {
        // Same episode - toggle play/pause
        if (this.audioElement) {
          if (this.isAudioPlaying) {
            this.audioElement.pause()
          } else {
            this.audioElement.play()
          }
        }
      } else {
        // Different episode - load and play
        this.currentEpisodeId = episode.id
        this.$nextTick(() => {
          if (this.audioElement) {
            // Resume from saved progress if available
            const savedProgress = this.progressTracker[episode.id] || 0
            this.audioElement.currentTime = savedProgress
            this.audioElement.play()
          }
        })
      }
    },
    handleTimeUpdate(event) {
      this.currentTime = event.target.currentTime
      // Update local progress tracker
      if (this.currentEpisodeId) {
        this.progressTracker[this.currentEpisodeId] = this.currentTime
      }
    },
    handleLoadedMetadata(event) {
      this.duration = event.target.duration
    },
    handleEnded() {
      this.isAudioPlaying = false
      // Save final progress
      if (this.currentEpisodeId) {
        this.saveProgress(this.currentEpisodeId, this.duration)
      }
      this.$emit('ended', this.currentEpisodeId)
    },
    handlePlay() {
      this.isAudioPlaying = true
      this.$emit('play', this.currentEpisodeId)
    },
    handlePause() {
      this.isAudioPlaying = false
      // Save progress on pause
      if (this.currentEpisodeId) {
        this.saveProgress(this.currentEpisodeId, this.currentTime)
      }
      this.$emit('pause', this.currentEpisodeId)
    },
    saveProgress(episodeId, currentTime) {
      this.$emit('progress', { episodeId, currentTime })
    },
    hasProgress(episodeId) {
      return this.progressTracker[episodeId] && this.progressTracker[episodeId] > 0
    },
    getProgress(episodeId) {
      return this.progressTracker[episodeId] || 0
    },
    getProgressPercent(episodeId) {
      const episode = this.episodes.find((ep) => ep.id === episodeId)
      if (!episode || !episode.duration) return 0
      const progress = this.getProgress(episodeId)
      return Math.min((progress / episode.duration) * 100, 100)
    },
    formatDate(dateString) {
      try {
        const date = new Date(dateString)
        return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
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
    }
  }
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-none {
  display: block;
}
</style>
