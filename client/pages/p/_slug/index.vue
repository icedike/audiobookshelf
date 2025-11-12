<template>
  <div class="w-full min-h-screen bg-bg text-white">
    <!-- Show child route (episode page) if accessing episode -->
    <nuxt-child v-if="$route.params.episodeId" />

    <!-- Show podcast info and episodes list only when NOT on episode page -->
    <template v-else>
      <!-- Header with Podcast Info -->
      <div class="w-full bg-primary bg-opacity-30">
        <div class="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div class="flex flex-col md:flex-row gap-6">
            <!-- Cover Image -->
            <div class="flex-shrink-0">
              <div class="w-48 h-48 sm:w-64 sm:h-64 mx-auto md:mx-0 rounded-lg overflow-hidden shadow-lg">
                <img :src="coverUrl" :alt="podcast.title" class="w-full h-full object-cover" />
              </div>
            </div>

            <!-- Podcast Info -->
            <div class="flex-1 flex flex-col justify-center">
              <h1 class="text-3xl sm:text-4xl font-bold mb-2 line-clamp-2">{{ podcast.title }}</h1>
              <p v-if="podcast.author" class="text-lg text-gray-300 mb-4">{{ podcast.author }}</p>

              <div v-if="podcast.description" class="text-sm text-gray-400 mb-4 line-clamp-3 md:line-clamp-4">
                <div v-html="podcast.description"></div>
              </div>

              <!-- Categories -->
              <div v-if="podcast.categories && podcast.categories.length" class="flex flex-wrap gap-2 mb-4">
                <span v-for="(cat, idx) in podcast.categories" :key="idx" class="px-3 py-1 bg-primary text-gray-200 rounded-full text-xs border border-gray-600">
                  {{ cat.category }}<span v-if="cat.subcategory"> › {{ cat.subcategory }}</span>
                </span>
              </div>

              <!-- Action Buttons -->
              <div class="flex flex-wrap gap-3">
                <podcast-subscribe-button :feed-url="podcast.feedURL" :platform-links="podcast.platformLinks" />
                <podcast-share-button :podcast-title="podcast.title" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Episodes List -->
      <div class="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div class="mb-6">
          <h2 class="text-2xl font-bold">Episodes ({{ podcast.episodes.length }})</h2>
        </div>

        <podcast-episode-list
          :episodes="podcast.episodes"
          :podcast-slug="podcast.slug"
          :session-progress="podcast.sessionProgress"
          @play="handlePlay"
          @pause="handlePause"
          @progress="handleProgress"
        />
      </div>
    </template>
  </div>
</template>

<script>
export default {
  layout: 'blank',
  async asyncData({ params, error, app }) {
    const podcast = await app.$axios.$get(`/public/p/${params.slug}`, { timeout: 10000 }).catch((err) => {
      console.error('Failed to fetch podcast', err)
      return null
    })

    if (!podcast) {
      return error({ statusCode: 404, message: 'Podcast not found' })
    }

    return {
      podcast
    }
  },
  head() {
    return {
      title: this.podcast.title,
      meta: [
        // Basic meta tags
        { hid: 'description', name: 'description', content: this.podcastDescription },
        { hid: 'author', name: 'author', content: this.podcast.author || 'Unknown' },

        // Open Graph tags
        { hid: 'og:title', property: 'og:title', content: this.podcast.title },
        { hid: 'og:description', property: 'og:description', content: this.podcastDescription },
        { hid: 'og:image', property: 'og:image', content: this.coverUrl },
        { hid: 'og:type', property: 'og:type', content: 'website' },
        { hid: 'og:url', property: 'og:url', content: this.pageUrl },

        // Twitter Card tags
        { hid: 'twitter:card', name: 'twitter:card', content: 'summary_large_image' },
        { hid: 'twitter:title', name: 'twitter:title', content: this.podcast.title },
        { hid: 'twitter:description', name: 'twitter:description', content: this.podcastDescription },
        { hid: 'twitter:image', name: 'twitter:image', content: this.coverUrl }
      ],
      link: [
        // RSS feed link
        { rel: 'alternate', type: 'application/rss+xml', title: this.podcast.title, href: this.podcast.feedURL }
      ],
      script: [
        // JSON-LD for Podcast
        {
          type: 'application/ld+json',
          json: {
            '@context': 'https://schema.org',
            '@type': 'PodcastSeries',
            name: this.podcast.title,
            description: this.podcastDescription,
            image: this.coverUrl,
            author: {
              '@type': 'Person',
              name: this.podcast.author || 'Unknown'
            },
            url: this.pageUrl,
            webFeed: this.podcast.feedURL
          }
        }
      ]
    }
  },
  computed: {
    coverUrl() {
      return this.podcast.coverUrl || this.$store.getters['globals/getPlaceholderCoverSrc']
    },
    podcastDescription() {
      if (!this.podcast.description) return ''
      // Strip HTML tags for meta description
      const div = document.createElement('div')
      div.innerHTML = this.podcast.description
      return (div.textContent || div.innerText || '').substring(0, 200)
    },
    pageUrl() {
      if (process.client) {
        return window.location.href
      }
      return `${this.$config.serverUrl}${this.$config.routerBasePath}/p/${this.podcast.slug}`
    }
  },
  methods: {
    handlePlay(episodeId) {
      console.log('Playing episode:', episodeId)
    },
    handlePause(episodeId) {
      console.log('Paused episode:', episodeId)
    },
    handleProgress({ episodeId, currentTime }) {
      // Save progress to server
      this.$axios
        .$patch(`/public/p/${this.podcast.slug}/episode/${episodeId}/progress`, { currentTime }, { progress: false })
        .catch((error) => {
          console.error('Failed to save progress', error)
        })
    }
  }
}
</script>

<style scoped>
/* Custom styles for podcast page */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-4 {
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
