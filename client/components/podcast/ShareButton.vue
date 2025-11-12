<template>
  <div>
    <button @click="showModal = true" class="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-md transition-colors border border-gray-600">
      <span class="material-symbols text-base">share</span>
      <span>Share</span>
    </button>

    <!-- Share Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" @click.self="showModal = false">
      <div class="bg-primary rounded-lg shadow-xl max-w-md w-full p-6" @click.stop>
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-semibold">Share Podcast</h3>
          <button @click="showModal = false" class="text-gray-400 hover:text-white">
            <span class="material-symbols text-2xl">close</span>
          </button>
        </div>

        <p class="text-sm text-gray-300 mb-4">Share "{{ podcastTitle }}" with others:</p>

        <!-- Page URL -->
        <div class="bg-bg rounded-md p-3 mb-4 flex items-center gap-2">
          <input ref="urlInput" :value="pageUrl" readonly class="flex-1 bg-transparent text-sm outline-none text-gray-300" @click="selectAll" />
          <button @click="copyUrl" class="px-3 py-1 bg-primary hover:bg-primary-hover rounded text-sm transition-colors border border-gray-600">
            {{ copied ? 'Copied!' : 'Copy' }}
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
        <button v-if="canUseNativeShare" @click="nativeShare" class="w-full flex items-center justify-center gap-2 px-4 py-2 bg-success hover:bg-success-hover text-white rounded-md transition-colors">
          <span class="material-symbols text-base">ios_share</span>
          <span>More sharing options...</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    podcastTitle: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      showModal: false,
      copied: false
    }
  },
  computed: {
    pageUrl() {
      if (process.client) {
        return window.location.href
      }
      return ''
    },
    canUseNativeShare() {
      return process.client && navigator.share
    },
    socialPlatforms() {
      const encodedUrl = encodeURIComponent(this.pageUrl)
      const encodedTitle = encodeURIComponent(this.podcastTitle)

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
          url: `mailto:?subject=${encodedTitle}&body=Check out this podcast: ${encodedUrl}`
        }
      ]
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
      if (this.$refs.urlInput) {
        this.$refs.urlInput.select()
      }
    },
    async copyUrl() {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(this.pageUrl)
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
    },
    async nativeShare() {
      if (!navigator.share) return

      try {
        await navigator.share({
          title: this.podcastTitle,
          text: `Check out this podcast: ${this.podcastTitle}`,
          url: this.pageUrl
        })
        this.showModal = false
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
