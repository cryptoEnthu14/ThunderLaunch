import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Launch Token | ThunderLaunch',
  description: 'Create and launch your own Solana token with ThunderLaunch',
};

/**
 * Launch Layout Component
 *
 * Special layout for the token launch flow with:
 * - Progress indicator
 * - Help section
 * - Professional design
 */
export default function LaunchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-950">
      {/* Background Gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-950/20 via-purple-950/20 to-gray-950 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10">
        {/* Header with Progress */}
        <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-4">
              {/* Breadcrumbs */}
              <nav className="flex items-center space-x-2 text-sm mb-4">
                <a
                  href="/"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Home
                </a>
                <svg
                  className="w-4 h-4 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
                <span className="text-white font-medium">Launch Token</span>
              </nav>

              {/* Progress Steps */}
              <div className="flex items-center justify-between max-w-2xl">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-thunder-blue text-white text-sm font-semibold">
                    1
                  </div>
                  <span className="text-sm font-medium text-white">Token Details</span>
                </div>

                <div className="flex-1 h-0.5 bg-gray-700 mx-4" />

                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-700 text-gray-400 text-sm font-semibold">
                    2
                  </div>
                  <span className="text-sm font-medium text-gray-400">Deploy</span>
                </div>

                <div className="flex-1 h-0.5 bg-gray-700 mx-4" />

                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-700 text-gray-400 text-sm font-semibold">
                    3
                  </div>
                  <span className="text-sm font-medium text-gray-400">Complete</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-8">
              {children}
            </div>

            {/* Right Column - Help & Tips */}
            <div className="lg:col-span-4">
              <div className="sticky top-32 space-y-6">
                {/* Tips Card */}
                <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-blue-950/50 border border-blue-900/30">
                      <svg
                        className="w-5 h-5 text-thunder-blue"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-white">Helpful Tips</h3>
                  </div>

                  <div className="space-y-3 text-sm text-gray-400">
                    <div className="flex items-start gap-2">
                      <svg
                        className="w-5 h-5 text-safety-green flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <p>
                        <strong className="text-white">Choose a clear name</strong> - Make it
                        memorable and descriptive
                      </p>
                    </div>

                    <div className="flex items-start gap-2">
                      <svg
                        className="w-5 h-5 text-safety-green flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <p>
                        <strong className="text-white">Use high-quality images</strong> - Your
                        token image represents your brand
                      </p>
                    </div>

                    <div className="flex items-start gap-2">
                      <svg
                        className="w-5 h-5 text-safety-green flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <p>
                        <strong className="text-white">Write a clear description</strong> -
                        Explain your token's purpose and utility
                      </p>
                    </div>

                    <div className="flex items-start gap-2">
                      <svg
                        className="w-5 h-5 text-safety-green flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <p>
                        <strong className="text-white">Set appropriate supply</strong> -
                        Consider tokenomics and distribution
                      </p>
                    </div>
                  </div>
                </div>

                {/* Security Notice */}
                <div className="bg-amber-950/20 backdrop-blur-sm border border-amber-900/30 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <svg
                      className="w-5 h-5 text-warning-orange"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    <h3 className="text-sm font-semibold text-warning-orange">
                      Important Notice
                    </h3>
                  </div>
                  <p className="text-sm text-gray-400">
                    Token creation is permanent. Review all details carefully before
                    deploying. Ensure you have enough SOL for transaction fees.
                  </p>
                </div>

                {/* Cost Estimate */}
                <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-6">
                  <h3 className="text-sm font-semibold text-white mb-3">
                    Estimated Costs
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-400">
                      <span>Token Creation</span>
                      <span className="text-white">~0.01 SOL</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Metadata Storage</span>
                      <span className="text-white">~0.002 SOL</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Platform Fee</span>
                      <span className="text-white">Free (Beta)</span>
                    </div>
                    <div className="pt-2 mt-2 border-t border-gray-800 flex justify-between font-semibold">
                      <span className="text-white">Total</span>
                      <span className="text-thunder-blue">~0.012 SOL</span>
                    </div>
                  </div>
                </div>

                {/* Help Link */}
                <a
                  href="/docs"
                  className="block text-center px-4 py-3 text-sm text-thunder-blue hover:text-blue-400 transition-colors border border-gray-800 rounded-lg hover:border-gray-700 bg-gray-900/50"
                >
                  Need help? View Documentation →
                </a>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
