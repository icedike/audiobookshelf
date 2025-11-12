<template>
  <div>
    <button @click="showModal = true" class="flex items-center gap-2 px-4 py-2 bg-success hover:bg-success-hover text-white rounded-md transition-colors">
      <span class="material-symbols text-base">rss_feed</span>
      <span>Subscribe</span>
    </button>

    <!-- Subscribe Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" @click.self="showModal = false">
      <div class="bg-primary rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto" @click.stop>
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-semibold">Subscribe to Podcast</h3>
          <button @click="showModal = false" class="text-gray-400 hover:text-white">
            <span class="material-symbols text-2xl">close</span>
          </button>
        </div>

        <!-- Platform Links (if configured) -->
        <div v-if="hasPlatformLinks" class="mb-6">
          <p class="text-sm text-gray-300 mb-3">Subscribe on your favorite platform:</p>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <a
              v-for="platform in configuredPlatforms"
              :key="platform.key"
              :href="platform.url"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center gap-2 px-3 py-2 bg-bg hover:bg-primary rounded text-sm transition-colors border border-gray-600"
            >
              <span class="text-base">{{ platform.icon }}</span>
              <span>{{ platform.name }}</span>
            </a>
          </div>
        </div>

        <!-- RSS Feed URL Section -->
        <div :class="{ 'pt-6 border-t border-gray-700': hasPlatformLinks }">
          <p class="text-sm text-gray-300 mb-2">
            {{ hasPlatformLinks ? 'Or subscribe with RSS:' : 'Copy the RSS feed URL below to subscribe in your podcast app:' }}
          </p>

          <!-- RSS Feed URL -->
          <div class="bg-bg rounded-md p-3 mb-4 flex items-center gap-2">
            <input
              ref="feedUrlInput"
              :value="feedUrl"
              readonly
              class="flex-1 bg-transparent text-sm outline-none text-gray-300"
              @click="selectAll"
            />
            <button @click="copyFeedUrl" class="px-3 py-1 bg-primary hover:bg-primary-hover rounded text-sm transition-colors border border-gray-600">
              {{ copied ? 'Copied!' : 'Copy' }}
            </button>
          </div>

          <!-- Instructions -->
          <div class="bg-bg rounded-md p-3 text-xs text-gray-400 border border-gray-700">
            <p class="font-semibold mb-1">How to subscribe with RSS:</p>
            <ol class="list-decimal list-inside space-y-1 ml-2">
              <li>Copy the RSS feed URL above</li>
              <li>Open your podcast app (Apple Podcasts, Spotify, etc.)</li>
              <li>Look for "Add by URL" or "Subscribe by RSS"</li>
              <li>Paste the URL and subscribe</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    feedUrl: {
      type: String,
      required: true
    },
    platformLinks: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      showModal: false,
      copied: false,
      platformInfo: {
        applepodcasts: { name: 'Apple Podcasts', icon: '🎙️' },
        spotify: { name: 'Spotify', icon: '🎵' },
        googlepodcasts: { name: 'Google Podcasts', icon: '🔍' },
        youtube: { name: 'YouTube', icon: '▶️' },
        stitcher: { name: 'Stitcher', icon: '📻' },
        overcast: { name: 'Overcast', icon: '☁️' },
        pocketcasts: { name: 'Pocket Casts', icon: '📱' },
        castro: { name: 'Castro', icon: '📡' }
      }
    }
  },
  computed: {
    hasPlatformLinks() {
      return this.configuredPlatforms.length > 0
    },
    configuredPlatforms() {
      const platforms = []
      if (this.platformLinks && typeof this.platformLinks === 'object') {
        Object.keys(this.platformLinks).forEach(key => {
          const url = this.platformLinks[key]
          if (url && url.trim() && this.platformInfo[key]) {
            platforms.push({
              key,
              name: this.platformInfo[key].name,
              icon: this.platformInfo[key].icon,
              url: url.trim()
            })
          }
        })
      }
      return platforms
    }
  },
  watch: {
    copied(newVal) {
      if (newVal) {
        setTimeout(() => {
          this.copied = false
        }, 2000)
      }
    }
  },
  methods: {
    selectAll() {
      if (this.$refs.feedUrlInput) {
        this.$refs.feedUrlInput.select()
      }
    },
    async copyFeedUrl() {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(this.feedUrl)
          this.copied = true
        } else {
          // Fallback for older browsers
          this.selectAll()
          document.execCommand('copy')
          this.copied = true
        }
      } catch (error) {
        console.error('Failed to copy:', error)
      }
    }
  }
}
</script>
