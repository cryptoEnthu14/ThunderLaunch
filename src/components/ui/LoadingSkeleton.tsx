'use client';

/**
 * LoadingSkeleton Component
 *
 * Skeleton loading placeholders with shimmer animation.
 * Used for loading states of cards, lists, and content.
 *
 * @example
 * ```tsx
 * <Skeleton className="h-20 w-full" />
 * <TokenCardSkeleton />
 * <TokenDetailsSkeleton />
 * ```
 */

import React from 'react';
import { cn } from '@/lib/utils';

export interface SkeletonProps {
  /** Custom className */
  className?: string;
  /** Show shimmer animation */
  shimmer?: boolean;
}

/**
 * Base Skeleton Component
 *
 * Generic skeleton element with shimmer effect
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  shimmer = true,
}) => {
  return (
    <div
      className={cn(
        'bg-gray-800 rounded-lg',
        shimmer && 'animate-pulse',
        className
      )}
      role="status"
      aria-label="Loading"
    >
      {shimmer && (
        <div className="h-full w-full bg-gradient-to-r from-transparent via-gray-700/50 to-transparent animate-shimmer" />
      )}
    </div>
  );
};

/**
 * Token Card Skeleton
 *
 * Loading placeholder for token cards in lists
 */
export const TokenCardSkeleton: React.FC = () => {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {/* Token Icon */}
          <Skeleton className="w-12 h-12 rounded-full" />

          {/* Token Info */}
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>

        {/* Badge */}
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-5 w-20" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-5 w-20" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-5 w-20" />
        </div>
      </div>

      {/* Progress Bar */}
      <Skeleton className="h-2 w-full rounded-full" />

      {/* Button */}
      <Skeleton className="h-10 w-full" />
    </div>
  );
};

/**
 * Token Details Skeleton
 *
 * Loading placeholder for token details page
 */
export const TokenDetailsSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <Skeleton className="w-20 h-20 rounded-full" />

          <div className="flex-1 space-y-3">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-5 w-32" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
          </div>

          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-64 w-full" />
      </div>

      {/* Description */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 space-y-3">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
};

/**
 * Table Row Skeleton
 *
 * Loading placeholder for table rows
 */
export interface TableRowSkeletonProps {
  /** Number of columns */
  columns?: number;
}

export const TableRowSkeleton: React.FC<TableRowSkeletonProps> = ({
  columns = 5,
}) => {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-gray-800">
      {[...Array(columns)].map((_, i) => (
        <Skeleton key={i} className="h-5 flex-1" />
      ))}
    </div>
  );
};

/**
 * Table Skeleton
 *
 * Loading placeholder for entire tables
 */
export interface TableSkeletonProps {
  /** Number of rows */
  rows?: number;
  /** Number of columns */
  columns?: number;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({
  rows = 5,
  columns = 5,
}) => {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 bg-gray-900 border-b border-gray-700">
        {[...Array(columns)].map((_, i) => (
          <Skeleton key={i} className="h-5 flex-1" />
        ))}
      </div>

      {/* Rows */}
      {[...Array(rows)].map((_, i) => (
        <TableRowSkeleton key={i} columns={columns} />
      ))}
    </div>
  );
};

/**
 * List Skeleton
 *
 * Loading placeholder for lists
 */
export interface ListSkeletonProps {
  /** Number of items */
  items?: number;
}

export const ListSkeleton: React.FC<ListSkeletonProps> = ({ items = 5 }) => {
  return (
    <div className="space-y-3">
      {[...Array(items)].map((_, i) => (
        <div
          key={i}
          className="bg-gray-800 border border-gray-700 rounded-lg p-4 flex items-center gap-4"
        >
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  );
};

/**
 * Profile Skeleton
 *
 * Loading placeholder for profile sections
 */
export const ProfileSkeleton: React.FC = () => {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <Skeleton className="w-20 h-20 rounded-full" />

        {/* Info */}
        <div className="flex-1 space-y-3">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />

          <div className="flex gap-4 mt-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-5 w-12" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-5 w-12" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-5 w-12" />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
};

export default Skeleton;
