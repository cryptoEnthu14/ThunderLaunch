'use client';

/**
 * Tabs Component
 *
 * A simple tabs component for organizing content into different views.
 *
 * @example
 * ```tsx
 * <Tabs value={activeTab} onValueChange={setActiveTab}>
 *   <TabsList>
 *     <TabsTrigger value="tab1">Tab 1</TabsTrigger>
 *     <TabsTrigger value="tab2">Tab 2</TabsTrigger>
 *   </TabsList>
 *   <TabsContent value="tab1">Content 1</TabsContent>
 *   <TabsContent value="tab2">Content 2</TabsContent>
 * </Tabs>
 * ```
 */

import React, { createContext, useContext, useState } from 'react';
import { cn } from '@/lib/utils';

interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within a Tabs component');
  }
  return context;
}

export interface TabsProps {
  /** Current active tab value */
  value: string;
  /** Callback when tab changes */
  onValueChange: (value: string) => void;
  /** Children */
  children: React.ReactNode;
  /** Custom className */
  className?: string;
}

/**
 * Tabs Root Component
 */
export function Tabs({ value, onValueChange, children, className }: TabsProps) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export interface TabsListProps {
  /** Children (TabsTrigger components) */
  children: React.ReactNode;
  /** Custom className */
  className?: string;
}

/**
 * TabsList Component
 */
export function TabsList({ children, className }: TabsListProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 p-1 bg-gray-800 rounded-lg border border-gray-700',
        className
      )}
      role="tablist"
    >
      {children}
    </div>
  );
}

export interface TabsTriggerProps {
  /** Tab value */
  value: string;
  /** Children */
  children: React.ReactNode;
  /** Custom className */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
}

/**
 * TabsTrigger Component
 */
export function TabsTrigger({
  value,
  children,
  className,
  disabled = false,
}: TabsTriggerProps) {
  const { value: selectedValue, onValueChange } = useTabsContext();
  const isActive = value === selectedValue;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      disabled={disabled}
      onClick={() => !disabled && onValueChange(value)}
      className={cn(
        'px-4 py-2 text-sm font-medium rounded-md transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-accent-purple focus:ring-offset-2 focus:ring-offset-gray-900',
        isActive
          ? 'bg-accent-purple text-white shadow-lg'
          : 'text-gray-400 hover:text-white hover:bg-gray-700',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {children}
    </button>
  );
}

export interface TabsContentProps {
  /** Tab value */
  value: string;
  /** Children */
  children: React.ReactNode;
  /** Custom className */
  className?: string;
}

/**
 * TabsContent Component
 */
export function TabsContent({ value, children, className }: TabsContentProps) {
  const { value: selectedValue } = useTabsContext();
  const isActive = value === selectedValue;

  if (!isActive) {
    return null;
  }

  return (
    <div
      role="tabpanel"
      className={cn('focus:outline-none', className)}
      tabIndex={0}
    >
      {children}
    </div>
  );
}

export default Tabs;
