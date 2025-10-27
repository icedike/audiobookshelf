/**
 * Apple Podcasts iTunes Categories
 * Reference: https://podcasters.apple.com/support/1691-apple-podcasts-categories
 */

const ITUNES_CATEGORIES = {
  Arts: ['Books', 'Design', 'Fashion & Beauty', 'Food', 'Performing Arts', 'Visual Arts'],
  Business: ['Careers', 'Entrepreneurship', 'Investing', 'Management', 'Marketing', 'Non-Profit'],
  Comedy: ['Comedy Interviews', 'Improv', 'Stand-Up'],
  Education: ['Courses', 'How To', 'Language Learning', 'Self-Improvement'],
  Fiction: ['Comedy Fiction', 'Drama', 'Science Fiction'],
  Government: [],
  History: [],
  'Health & Fitness': ['Alternative Health', 'Fitness', 'Medicine', 'Mental Health', 'Nutrition', 'Sexuality'],
  'Kids & Family': ['Education for Kids', 'Parenting', 'Pets & Animals', 'Stories for Kids'],
  Leisure: ['Animation & Manga', 'Automotive', 'Aviation', 'Crafts', 'Games', 'Hobbies', 'Home & Garden', 'Video Games'],
  Music: ['Music Commentary', 'Music History', 'Music Interviews'],
  News: ['Business News', 'Daily News', 'Entertainment News', 'News Commentary', 'Politics', 'Sports News', 'Tech News'],
  'Religion & Spirituality': ['Buddhism', 'Christianity', 'Hinduism', 'Islam', 'Judaism', 'Religion', 'Spirituality'],
  Science: ['Astronomy', 'Chemistry', 'Earth Sciences', 'Life Sciences', 'Mathematics', 'Natural Sciences', 'Nature', 'Physics', 'Social Sciences'],
  'Society & Culture': ['Documentary', 'Personal Journals', 'Philosophy', 'Places & Travel', 'Relationships'],
  Sports: ['Baseball', 'Basketball', 'Cricket', 'Fantasy Sports', 'Football', 'Golf', 'Hockey', 'Rugby', 'Running', 'Soccer', 'Swimming', 'Tennis', 'Volleyball', 'Wilderness', 'Wrestling'],
  Technology: [],
  'True Crime': [],
  'TV & Film': ['After Shows', 'Film History', 'Film Interviews', 'Film Reviews', 'TV Reviews']
}

/**
 * Default category for podcast feeds (suitable for blockchain/investing/news content)
 */
const DEFAULT_PODCAST_CATEGORY = { category: 'Business', subcategory: 'Investing' }

/**
 * Default category for audiobook/collection/series feeds
 */
const DEFAULT_BOOK_CATEGORY = { category: 'Arts', subcategory: 'Books' }

/**
 * Map podcast genres to iTunes categories
 * @param {string[]} genres - Array of genre strings
 * @returns {{category: string, subcategory: string}|null}
 */
function mapGenresToCategory(genres) {
  if (!genres || !Array.isArray(genres) || genres.length === 0) {
    return null
  }

  const genresLower = genres.map((g) => g.toLowerCase())

  // Business/Investing/Finance/Crypto mapping
  if (genresLower.some((g) => ['business', 'investing', 'investment', 'finance', 'crypto', 'cryptocurrency', 'blockchain', 'defi', 'bitcoin', 'ethereum'].some((keyword) => g.includes(keyword)))) {
    return { category: 'Business', subcategory: 'Investing' }
  }

  // News mapping
  if (genresLower.some((g) => ['news', 'daily news', 'current events'].some((keyword) => g.includes(keyword)))) {
    // Check for business news specifically
    if (genresLower.some((g) => g.includes('business'))) {
      return { category: 'News', subcategory: 'Business News' }
    }
    // Check for tech news
    if (genresLower.some((g) => g.includes('tech'))) {
      return { category: 'News', subcategory: 'Tech News' }
    }
    return { category: 'News', subcategory: null }
  }

  // Technology mapping
  if (genresLower.some((g) => ['technology', 'tech', 'software', 'programming', 'coding'].some((keyword) => g.includes(keyword)))) {
    return { category: 'Technology', subcategory: null }
  }

  // Education mapping
  if (genresLower.some((g) => ['education', 'educational', 'learning', 'tutorial'].some((keyword) => g.includes(keyword)))) {
    return { category: 'Education', subcategory: null }
  }

  // Comedy mapping
  if (genresLower.some((g) => ['comedy', 'humor', 'funny'].some((keyword) => g.includes(keyword)))) {
    return { category: 'Comedy', subcategory: null }
  }

  // True Crime mapping
  if (genresLower.some((g) => ['true crime', 'crime', 'mystery', 'detective'].some((keyword) => g.includes(keyword)))) {
    return { category: 'True Crime', subcategory: null }
  }

  // Science mapping
  if (genresLower.some((g) => ['science', 'physics', 'chemistry', 'biology'].some((keyword) => g.includes(keyword)))) {
    return { category: 'Science', subcategory: null }
  }

  // History mapping
  if (genresLower.some((g) => ['history', 'historical'].some((keyword) => g.includes(keyword)))) {
    return { category: 'History', subcategory: null }
  }

  // Sports mapping
  if (genresLower.some((g) => ['sports', 'sport', 'football', 'basketball', 'baseball', 'soccer'].some((keyword) => g.includes(keyword)))) {
    return { category: 'Sports', subcategory: null }
  }

  // Arts mapping
  if (genresLower.some((g) => ['arts', 'art', 'books', 'literature'].some((keyword) => g.includes(keyword)))) {
    return { category: 'Arts', subcategory: 'Books' }
  }

  return null
}

/**
 * Validate that a category exists in iTunes categories
 * @param {string} category - Category name
 * @param {string} subcategory - Subcategory name (optional)
 * @returns {boolean}
 */
function validateCategory(category, subcategory = null) {
  if (!category || !ITUNES_CATEGORIES[category]) {
    return false
  }

  if (subcategory) {
    return ITUNES_CATEGORIES[category].includes(subcategory)
  }

  return true
}

/**
 * Get default category for a feed type
 * @param {string} feedType - 'podcast' or 'book'
 * @returns {{category: string, subcategory: string}}
 */
function getDefaultCategory(feedType) {
  if (feedType === 'podcast') {
    return DEFAULT_PODCAST_CATEGORY
  }
  return DEFAULT_BOOK_CATEGORY
}

module.exports = {
  ITUNES_CATEGORIES,
  DEFAULT_PODCAST_CATEGORY,
  DEFAULT_BOOK_CATEGORY,
  mapGenresToCategory,
  validateCategory,
  getDefaultCategory
}
