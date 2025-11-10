/**
 * Site Configuration
 *
 * Site metadata, branding, SEO, and social media configuration.
 */

import { env } from './env';

// =============================================================================
// SITE METADATA
// =============================================================================

/**
 * Site metadata configuration
 */
export const SITE_CONFIG = {
  /** Site name */
  name: 'ThunderLaunch',

  /** Site title (for browser tab) */
  title: 'ThunderLaunch - Multi-Chain Token Launch Platform',

  /** Site description */
  description:
    'Launch your tokens across Solana, Base, and BNB Chain with built-in security checks, liquidity management, and instant trading. The complete DeFi launchpad for the next generation of tokens.',

  /** Site tagline */
  tagline: 'Lightning-Fast Token Launches Across Multiple Chains',

  /** Site URL */
  url: env.app.url,

  /** Site logo */
  logo: '/logo.svg',

  /** Site icon/favicon */
  icon: '/favicon.ico',

  /** Open Graph image */
  ogImage: '/og-image.png',

  /** Twitter card image */
  twitterImage: '/twitter-card.png',

  /** Site keywords */
  keywords: [
    'token launch',
    'cryptocurrency',
    'DeFi',
    'Solana',
    'Base',
    'BNB Chain',
    'token creation',
    'launchpad',
    'liquidity pool',
    'DEX',
    'blockchain',
    'multi-chain',
    'token security',
    'smart contracts',
    'Web3',
  ],

  /** Site author */
  author: {
    name: 'ThunderLaunch Team',
    url: env.app.url,
  },

  /** Site version */
  version: '1.0.0',
} as const;

// =============================================================================
// SEO CONFIGURATION
// =============================================================================

/**
 * SEO metadata configuration
 */
export const SEO_CONFIG = {
  /** Default title template */
  titleTemplate: '%s | ThunderLaunch',

  /** Default meta description */
  defaultDescription: SITE_CONFIG.description,

  /** Open Graph configuration */
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.name,
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    images: [
      {
        url: `${SITE_CONFIG.url}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'ThunderLaunch - Multi-Chain Token Launch Platform',
      },
    ],
  },

  /** Twitter card configuration */
  twitter: {
    handle: '@thunderlaunch',
    site: '@thunderlaunch',
    cardType: 'summary_large_image',
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    image: `${SITE_CONFIG.url}/twitter-card.png`,
  },

  /** Additional meta tags */
  additionalMetaTags: [
    {
      name: 'viewport',
      content: 'width=device-width, initial-scale=1, maximum-scale=5',
    },
    {
      name: 'theme-color',
      content: '#0066FF',
    },
    {
      name: 'apple-mobile-web-app-capable',
      content: 'yes',
    },
    {
      name: 'apple-mobile-web-app-status-bar-style',
      content: 'black-translucent',
    },
  ],

  /** Canonical URL */
  canonical: SITE_CONFIG.url,

  /** Robots meta */
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
} as const;

// =============================================================================
// SOCIAL MEDIA LINKS
// =============================================================================

/**
 * Social media links
 */
export const SOCIAL_LINKS = {
  twitter: 'https://twitter.com/thunderlaunch',
  telegram: 'https://t.me/thunderlaunch',
  discord: 'https://discord.gg/thunderlaunch',
  github: 'https://github.com/thunderlaunch',
  medium: 'https://medium.com/@thunderlaunch',
  youtube: 'https://youtube.com/@thunderlaunch',
  linkedin: 'https://linkedin.com/company/thunderlaunch',
} as const;

/**
 * Social media handles
 */
export const SOCIAL_HANDLES = {
  twitter: '@thunderlaunch',
  telegram: '@thunderlaunch',
  discord: 'ThunderLaunch',
  github: 'thunderlaunch',
} as const;

// =============================================================================
// NAVIGATION
// =============================================================================

/**
 * Main navigation links
 */
export const NAVIGATION_LINKS = [
  {
    name: 'Home',
    href: '/',
    icon: 'Home',
  },
  {
    name: 'Launch Token',
    href: '/launch',
    icon: 'Rocket',
  },
  {
    name: 'Explore Tokens',
    href: '/tokens',
    icon: 'Compass',
  },
  {
    name: 'My Portfolio',
    href: '/portfolio',
    icon: 'Wallet',
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: 'BarChart',
  },
] as const;

/**
 * Footer navigation sections
 */
export const FOOTER_LINKS = {
  product: [
    { name: 'Launch Token', href: '/launch' },
    { name: 'Explore Tokens', href: '/tokens' },
    { name: 'Security Checks', href: '/security' },
    { name: 'Pricing', href: '/pricing' },
  ],
  resources: [
    { name: 'Documentation', href: '/docs' },
    { name: 'API Reference', href: '/docs/api' },
    { name: 'Guides', href: '/guides' },
    { name: 'Blog', href: '/blog' },
  ],
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'Careers', href: '/careers' },
    { name: 'Contact', href: '/contact' },
    { name: 'Partners', href: '/partners' },
  ],
  legal: [
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Cookie Policy', href: '/cookies' },
    { name: 'Disclaimer', href: '/disclaimer' },
  ],
} as const;

// =============================================================================
// BRANDING
// =============================================================================

/**
 * Brand colors (using theme colors)
 */
export const BRAND_COLORS = {
  primary: '#0066FF', // Thunder Blue
  secondary: '#FFD700', // Lightning Yellow
  accent: '#8B5CF6', // Thunder Purple
  success: '#10B981', // Safety Green
  warning: '#F59E0B', // Warning Orange
  danger: '#EF4444', // Danger Red
} as const;

/**
 * Brand fonts
 */
export const BRAND_FONTS = {
  heading: 'Inter, system-ui, sans-serif',
  body: 'Inter, system-ui, sans-serif',
  mono: 'Menlo, Monaco, Courier New, monospace',
} as const;

/**
 * Logo variants
 */
export const LOGO_VARIANTS = {
  default: '/logo.svg',
  light: '/logo-light.svg',
  dark: '/logo-dark.svg',
  icon: '/logo-icon.svg',
  iconLight: '/logo-icon-light.svg',
  iconDark: '/logo-icon-dark.svg',
} as const;

// =============================================================================
// CONTACT INFORMATION
// =============================================================================

/**
 * Contact information
 */
export const CONTACT_INFO = {
  email: 'hello@thunderlaunch.app',
  support: 'support@thunderlaunch.app',
  business: 'business@thunderlaunch.app',
  press: 'press@thunderlaunch.app',
} as const;

// =============================================================================
// FEATURE HIGHLIGHTS
// =============================================================================

/**
 * Platform feature highlights
 */
export const FEATURES = [
  {
    title: 'Multi-Chain Support',
    description: 'Launch tokens on Solana, Base, and BNB Chain from a single platform.',
    icon: 'Network',
  },
  {
    title: 'Built-in Security',
    description: 'Comprehensive security checks including honeypot detection and liquidity analysis.',
    icon: 'Shield',
  },
  {
    title: 'Instant Trading',
    description: 'Trade tokens immediately after launch with integrated DEX routing.',
    icon: 'Zap',
  },
  {
    title: 'Liquidity Management',
    description: 'Automatic liquidity pool creation and lock mechanisms.',
    icon: 'Lock',
  },
  {
    title: 'Real-time Analytics',
    description: 'Track performance with advanced charts and market data.',
    icon: 'TrendingUp',
  },
  {
    title: 'Low Fees',
    description: 'Competitive platform fees with transparent pricing.',
    icon: 'DollarSign',
  },
] as const;

// =============================================================================
// STATISTICS
// =============================================================================

/**
 * Platform statistics (can be fetched dynamically)
 */
export const PLATFORM_STATS = {
  tokensLaunched: '10,000+',
  totalVolume: '$500M+',
  activeUsers: '50,000+',
  chainsSupported: 3,
} as const;

// =============================================================================
// TESTIMONIALS
// =============================================================================

/**
 * User testimonials
 */
export const TESTIMONIALS = [
  {
    quote: 'ThunderLaunch made launching my token incredibly easy. The security checks gave me peace of mind.',
    author: 'Alex Chen',
    role: 'Token Creator',
    avatar: '/avatars/user-1.jpg',
  },
  {
    quote: 'Best multi-chain launchpad I\'ve used. The analytics are top-notch.',
    author: 'Sarah Williams',
    role: 'DeFi Trader',
    avatar: '/avatars/user-2.jpg',
  },
  {
    quote: 'Lightning-fast launches with built-in security. Exactly what the space needs.',
    author: 'Michael Rodriguez',
    role: 'Project Founder',
    avatar: '/avatars/user-3.jpg',
  },
] as const;

// =============================================================================
// ANNOUNCEMENTS
// =============================================================================

/**
 * Platform announcements (can be managed via CMS)
 */
export const ANNOUNCEMENTS = [
  {
    id: '1',
    title: 'Welcome to ThunderLaunch!',
    message: 'Launch your tokens across multiple chains with built-in security.',
    type: 'info' as const,
    dismissible: true,
    link: '/about',
  },
] as const;

// =============================================================================
// EXTERNAL LINKS
// =============================================================================

/**
 * External documentation and resource links
 */
export const EXTERNAL_LINKS = {
  docs: 'https://docs.thunderlaunch.app',
  api: 'https://docs.thunderlaunch.app/api',
  status: 'https://status.thunderlaunch.app',
  support: 'https://support.thunderlaunch.app',
  blog: 'https://blog.thunderlaunch.app',
} as const;

// =============================================================================
// HELP & SUPPORT
// =============================================================================

/**
 * Help and support resources
 */
export const HELP_RESOURCES = {
  faq: '/faq',
  guides: '/guides',
  tutorials: '/tutorials',
  apiDocs: '/docs/api',
  community: SOCIAL_LINKS.discord,
  support: CONTACT_INFO.support,
} as const;

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  SITE_CONFIG,
  SEO_CONFIG,
  SOCIAL_LINKS,
  NAVIGATION_LINKS,
  BRAND_COLORS,
  CONTACT_INFO,
  FEATURES,
} as const;
