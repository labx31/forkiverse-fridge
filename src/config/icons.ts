import {
  faRobot,
  faCode,
  faGamepad,
  faMusic,
  faCamera,
  faHeart,
  faRocket,
  faStar,
  faBolt,
  faCloud,
  faBook,
  faPaintBrush,
  faLightbulb,
  faFire,
  faMagicWandSparkles,
  faChartLine,
  faDatabase,
  faServer,
  faMobile,
  faDesktop,
  faTerminal,
  faBrain,
  faComments,
  faEnvelope,
  faCalendar,
  faMap,
  faDollarSign,
  faLock,
  faSearch,
  faWrench,
  faNetworkWired,
  faGear,
  faCirclePlay,
  faImage,
  faVideo,
  faHeadphones,
  faPodcast,
  faNewspaper,
  faGraduationCap,
  faUsers,
  faPlane,
  faUtensils,
  faDumbbell,
  faGem,
  faThumbsUp,
  faFolder,
} from '@fortawesome/free-solid-svg-icons';

import {
  faGithub,
  faTwitter,
  faDiscord,
  faYoutube,
  faSpotify,
  faTwitch,
  faReact,
  faVuejs,
  faAngular,
  faNodeJs,
  faPython,
  faRust,
  faJs,
  faHtml5,
  faCss3Alt,
  faFigma,
  faAws,
  faDocker,
  faApple,
  faAndroid,
  faLinux,
  faSlack,
  faReddit,
  faMastodon,
} from '@fortawesome/free-brands-svg-icons';

import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

// Color palettes for magnet backgrounds
export const MAGNET_COLORS = [
  '#FF6B6B', // Coral red
  '#4ECDC4', // Teal
  '#45B7D1', // Sky blue
  '#96CEB4', // Sage green
  '#FFEAA7', // Soft yellow
  '#DDA0DD', // Plum
  '#F8B500', // Golden
  '#FF6F61', // Living coral
  '#6B5B95', // Ultra violet
  '#88B04B', // Greenery
  '#F7CAC9', // Rose quartz
  '#92A8D1', // Serenity blue
  '#955251', // Marsala
  '#B565A7', // Radiant orchid
  '#009B77', // Emerald
  '#DD4124', // Tangerine
  '#D65076', // Honeysuckle
  '#45B8AC', // Turquoise
  '#EFC050', // Mimosa
  '#5B5EA6', // Blue iris
];

// Background shapes for variety
export type MagnetShape = 'circle' | 'rounded-square' | 'hexagon' | 'star' | 'blob';

export const MAGNET_SHAPES: MagnetShape[] = [
  'circle',
  'rounded-square',
  'rounded-square',
  'circle',
  'hexagon',
  'blob',
];

// Keyword to icon mapping
export const KEYWORD_ICON_MAP: Record<string, IconDefinition> = {
  // AI & ML
  ai: faRobot,
  ml: faBrain,
  gpt: faRobot,
  llm: faRobot,
  chatgpt: faRobot,
  claude: faRobot,
  openai: faRobot,
  anthropic: faRobot,
  bot: faRobot,
  neural: faBrain,
  model: faBrain,

  // Programming languages & frameworks
  react: faReact,
  vue: faVuejs,
  angular: faAngular,
  node: faNodeJs,
  python: faPython,
  rust: faRust,
  javascript: faJs,
  typescript: faJs,
  html: faHtml5,
  css: faCss3Alt,
  code: faCode,
  programming: faCode,
  developer: faCode,
  coding: faCode,

  // Gaming
  game: faGamepad,
  gaming: faGamepad,
  play: faCirclePlay,
  unity: faGamepad,
  godot: faGamepad,

  // Music & Audio
  music: faMusic,
  audio: faHeadphones,
  sound: faHeadphones,
  podcast: faPodcast,
  spotify: faSpotify,

  // Visual & Design
  design: faPaintBrush,
  art: faPaintBrush,
  figma: faFigma,
  ui: faPaintBrush,
  ux: faPaintBrush,
  photo: faCamera,
  image: faImage,
  video: faVideo,
  camera: faCamera,

  // Infrastructure & DevOps
  cloud: faCloud,
  aws: faAws,
  docker: faDocker,
  server: faServer,
  database: faDatabase,
  api: faNetworkWired,

  // Platforms
  ios: faApple,
  apple: faApple,
  android: faAndroid,
  mobile: faMobile,
  desktop: faDesktop,
  linux: faLinux,
  terminal: faTerminal,
  cli: faTerminal,

  // Social & Communication
  chat: faComments,
  social: faUsers,
  community: faUsers,
  discord: faDiscord,
  twitter: faTwitter,
  mastodon: faMastodon,
  reddit: faReddit,
  slack: faSlack,

  // Media & Content
  youtube: faYoutube,
  twitch: faTwitch,
  stream: faVideo,
  blog: faNewspaper,
  news: faNewspaper,

  // Business & Productivity
  productivity: faGear,
  todo: faGear,
  task: faGear,
  calendar: faCalendar,
  email: faEnvelope,
  analytics: faChartLine,
  dashboard: faChartLine,

  // Finance
  finance: faDollarSign,
  money: faDollarSign,
  crypto: faDollarSign,
  payment: faDollarSign,

  // Misc categories
  search: faSearch,
  map: faMap,
  travel: faPlane,
  food: faUtensils,
  eat: faUtensils,
  eating: faUtensils,
  meal: faUtensils,
  recipe: faUtensils,
  cook: faUtensils,
  kitchen: faUtensils,
  restaurant: faUtensils,
  baby: faHeart,
  family: faUsers,
  health: faHeart,
  fitness: faDumbbell,
  tracker: faChartLine,
  journal: faBook,
  diary: faBook,
  education: faGraduationCap,
  learn: faBook,
  book: faBook,
  security: faLock,
  tool: faWrench,
  automation: faGear,

  // Positive vibes
  love: faHeart,
  like: faThumbsUp,
  awesome: faStar,
  cool: faFire,
  magic: faMagicWandSparkles,
  idea: faLightbulb,
  launch: faRocket,
  ship: faRocket,
  fast: faBolt,

  // GitHub specific
  github: faGithub,
  repo: faFolder,
  opensource: faCode,
};

// Fallback icons for when no keyword matches
export const FALLBACK_ICONS: IconDefinition[] = [
  faStar,
  faRocket,
  faLightbulb,
  faGem,
  faBolt,
  faFire,
  faMagicWandSparkles,
  faThumbsUp,
];

// Get deterministic but varied properties for a magnet
export function getMagnetStyle(id: string) {
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash) + id.charCodeAt(i);
    hash = hash & hash;
  }
  const absHash = Math.abs(hash);

  const color = MAGNET_COLORS[absHash % MAGNET_COLORS.length];
  const shape = MAGNET_SHAPES[absHash % MAGNET_SHAPES.length];
  const iconRotation = ((absHash % 30) - 15); // -15 to +15 degrees

  return { color, shape, iconRotation };
}

// Find the best matching icon for given keywords
export function findIconForKeywords(text: string): IconDefinition {
  const lowerText = text.toLowerCase();

  // Check each keyword
  for (const [keyword, icon] of Object.entries(KEYWORD_ICON_MAP)) {
    if (lowerText.includes(keyword)) {
      return icon;
    }
  }

  // Return a deterministic fallback based on text hash
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i);
    hash = hash & hash;
  }
  return FALLBACK_ICONS[Math.abs(hash) % FALLBACK_ICONS.length];
}
