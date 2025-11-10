'use client';

/**
 * Header Component
 *
 * Main navigation header with logo, navigation links, wallet button,
 * and responsive mobile menu. Features sticky positioning with backdrop blur.
 *
 * @example
 * ```tsx
 * <Header />
 * ```
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { WalletButton } from '@/components/wallet';
import { Container } from './Container';
import { cn } from '@/lib/utils';

interface NavLink {
  label: string;
  href: string;
}

const navLinks: NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'Launch', href: '/launch' },
  { label: 'Tokens', href: '/tokens' },
];

/**
 * Header Component
 *
 * Sticky navigation header with responsive mobile menu
 */
export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full transition-all duration-200',
        scrolled
          ? 'bg-gray-900/95 backdrop-blur-md border-b border-gray-800 shadow-lg'
          : 'bg-gray-900 border-b border-gray-800'
      )}
    >
      <Container>
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 group"
            aria-label="ThunderLaunch Home"
          >
            <span className="text-2xl lg:text-3xl group-hover:scale-110 transition-transform">
              ⚡
            </span>
            <span className="font-bold text-lg lg:text-xl bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              ThunderLaunch
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-sm font-medium transition-colors relative py-2',
                  isActive(link.href)
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white'
                )}
              >
                {link.label}
                {isActive(link.href) && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
                )}
              </Link>
            ))}
          </nav>

          {/* Desktop Wallet Button */}
          <div className="hidden md:block">
            <WalletButton showBalance={true} size="md" />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
            aria-label="Toggle mobile menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              // Close Icon
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              // Menu Icon
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
      </Container>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 z-50 bg-gray-900/95 backdrop-blur-md">
          <Container>
            <nav className="py-8 flex flex-col gap-6" aria-label="Mobile navigation">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'text-lg font-medium transition-colors py-2',
                    isActive(link.href)
                      ? 'text-white border-l-4 border-blue-500 pl-4'
                      : 'text-gray-400 hover:text-white pl-4'
                  )}
                >
                  {link.label}
                </Link>
              ))}

              {/* Mobile Wallet Button */}
              <div className="mt-4 pl-4">
                <WalletButton showBalance={true} size="lg" />
              </div>
            </nav>
          </Container>
        </div>
      )}
    </header>
  );
};

export default Header;
