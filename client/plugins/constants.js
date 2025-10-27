const SupportedFileTypes = {
  image: ['png', 'jpg', 'jpeg', 'webp'],
  audio: ['m4b', 'mp3', 'm4a', 'flac', 'opus', 'ogg', 'oga', 'mp4', 'aac', 'wma', 'aiff', 'aif','wav', 'webm', 'webma', 'mka', 'awb', 'caf', 'mpeg', 'mpg'],
  ebook: ['epub', 'pdf', 'mobi', 'azw3', 'cbr', 'cbz'],
  info: ['nfo'],
  text: ['txt'],
  metadata: ['opf', 'abs', 'xml', 'json']
}

const DownloadStatus = {
  PENDING: 0,
  READY: 1,
  EXPIRED: 2,
  FAILED: 3
}

const BookCoverAspectRatio = {
  STANDARD: 0,
  SQUARE: 1
}

const BookshelfView = {
  STANDARD: 0,
  DETAIL: 1,
  AUTHOR: 2 // Books shown on author page
}

const PlayMethod = {
  DIRECTPLAY: 0,
  DIRECTSTREAM: 1,
  TRANSCODE: 2,
  LOCAL: 3
}

const SleepTimerTypes = {
  COUNTDOWN: 'countdown',
  CHAPTER: 'chapter'
}

// iTunes Podcast Categories for RSS Feeds
// Reference: https://podcasters.apple.com/support/1691-apple-podcasts-categories
const iTunesCategories = {
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

const Constants = {
  SupportedFileTypes,
  DownloadStatus,
  BookCoverAspectRatio,
  BookshelfView,
  PlayMethod,
  SleepTimerTypes,
  iTunesCategories
}

const KeyNames = {
  27: 'Escape',
  32: 'Space',
  37: 'ArrowLeft',
  38: 'ArrowUp',
  39: 'ArrowRight',
  40: 'ArrowDown',
  76: 'KeyL',
  77: 'KeyM'
}
const Hotkeys = {
  AudioPlayer: {
    PLAY_PAUSE: 'Space',
    JUMP_FORWARD: 'ArrowRight',
    JUMP_BACKWARD: 'ArrowLeft',
    VOLUME_UP: 'ArrowUp',
    VOLUME_DOWN: 'ArrowDown',
    MUTE_UNMUTE: 'KeyM',
    SHOW_CHAPTERS: 'KeyL',
    INCREASE_PLAYBACK_RATE: 'Shift-ArrowUp',
    DECREASE_PLAYBACK_RATE: 'Shift-ArrowDown',
    CLOSE: 'Escape'
  },
  EReader: {
    NEXT_PAGE: 'ArrowRight',
    PREV_PAGE: 'ArrowLeft',
    CLOSE: 'Escape'
  },
  Modal: {
    NEXT_PAGE: 'ArrowRight',
    PREV_PAGE: 'ArrowLeft',
    CLOSE: 'Escape'
  }
}

export { Constants }
export default ({ app }, inject) => {
  inject('constants', Constants)
  inject('keynames', KeyNames)
  inject('hotkeys', Hotkeys)
}
