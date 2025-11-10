/**
 * Supabase Client
 *
 * Centralized Supabase client configuration with proper error handling
 * and type safety.
 */

import { createClient } from '@supabase/supabase-js';
import { env } from '@/config/env';
import type { Database } from './database.types';

// =============================================================================
// CLIENT INITIALIZATION
// =============================================================================

/**
 * Supabase client for browser/client-side operations
 * Uses the public anon key with Row Level Security (RLS)
 */
export const supabase = createClient<Database>(
  env.supabase.url,
  env.supabase.anonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
    db: {
      schema: 'public',
    },
    global: {
      headers: {
        'x-application-name': 'thunderlaunch',
      },
    },
  }
);

/**
 * Server-side Supabase client with service role key
 * IMPORTANT: Only use this on the server-side (API routes, server components)
 * This bypasses Row Level Security - use with caution!
 *
 * @returns Supabase client with service role privileges
 */
export function getServiceRoleClient() {
  if (typeof window !== 'undefined') {
    throw new Error(
      'Service role client should only be used on the server-side. This client bypasses RLS!'
    );
  }

  if (!env.supabase.serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  }

  return createClient<Database>(
    env.supabase.url,
    env.supabase.serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      db: {
        schema: 'public',
      },
    }
  );
}

// =============================================================================
// ERROR HANDLING
// =============================================================================

/**
 * Supabase error response
 */
export interface SupabaseError {
  message: string;
  details: string | null;
  hint: string | null;
  code: string;
}

/**
 * Handle Supabase errors with proper typing
 *
 * @param error - Error from Supabase operation
 * @returns Formatted error object
 */
export function handleSupabaseError(error: unknown): SupabaseError {
  if (error && typeof error === 'object' && 'message' in error) {
    const err = error as {
      message: string;
      details?: string;
      hint?: string;
      code?: string;
    };

    return {
      message: err.message || 'An unknown error occurred',
      details: err.details || null,
      hint: err.hint || null,
      code: err.code || 'UNKNOWN',
    };
  }

  return {
    message: 'An unknown error occurred',
    details: null,
    hint: null,
    code: 'UNKNOWN',
  };
}

/**
 * Type guard to check if error is a Supabase error
 */
export function isSupabaseError(error: unknown): error is SupabaseError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    'code' in error
  );
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Check if Supabase client is configured
 *
 * @returns true if client is properly configured
 */
export function isSupabaseConfigured(): boolean {
  return !!(env.supabase.url && env.supabase.anonKey);
}

/**
 * Get current user session
 *
 * @returns Current session or null
 */
export async function getCurrentSession() {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error('Error getting session:', handleSupabaseError(error));
      return null;
    }

    return data.session;
  } catch (error) {
    console.error('Error getting session:', handleSupabaseError(error));
    return null;
  }
}

/**
 * Get current user
 *
 * @returns Current user or null
 */
export async function getCurrentUser() {
  try {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      console.error('Error getting user:', handleSupabaseError(error));
      return null;
    }

    return data.user;
  } catch (error) {
    console.error('Error getting user:', handleSupabaseError(error));
    return null;
  }
}

/**
 * Sign out the current user
 *
 * @returns true if sign out was successful
 */
export async function signOut(): Promise<boolean> {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Error signing out:', handleSupabaseError(error));
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error signing out:', handleSupabaseError(error));
    return false;
  }
}

// =============================================================================
// REALTIME SUBSCRIPTIONS
// =============================================================================

/**
 * Subscribe to realtime changes on a table
 *
 * @param table - Table name to subscribe to
 * @param callback - Callback function for changes
 * @param filter - Optional filter for subscription
 * @returns Subscription object with unsubscribe method
 *
 * @example
 * ```typescript
 * const subscription = subscribeToTable('tokens', (payload) => {
 *   console.log('Change received:', payload);
 * }, 'id=eq.123');
 *
 * // Later, unsubscribe
 * subscription.unsubscribe();
 * ```
 */
export function subscribeToTable<T extends keyof Database['public']['Tables']>(
  table: T,
  callback: (payload: {
    eventType: 'INSERT' | 'UPDATE' | 'DELETE';
    new: Database['public']['Tables'][T]['Row'] | null;
    old: Database['public']['Tables'][T]['Row'] | null;
  }) => void,
  filter?: string
) {
  const channel = supabase
    .channel(`${table}_changes`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: table as string,
        filter: filter,
      },
      (payload) => {
        callback({
          eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
          new: payload.new as Database['public']['Tables'][T]['Row'] | null,
          old: payload.old as Database['public']['Tables'][T]['Row'] | null,
        });
      }
    )
    .subscribe();

  return {
    unsubscribe: () => {
      supabase.removeChannel(channel);
    },
  };
}

// =============================================================================
// STORAGE HELPERS
// =============================================================================

/**
 * Upload file to Supabase storage
 *
 * @param bucket - Storage bucket name
 * @param path - File path in bucket
 * @param file - File to upload
 * @returns Public URL of uploaded file or null on error
 */
export async function uploadFile(
  bucket: string,
  path: string,
  file: File
): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Error uploading file:', handleSupabaseError(error));
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading file:', handleSupabaseError(error));
    return null;
  }
}

/**
 * Delete file from Supabase storage
 *
 * @param bucket - Storage bucket name
 * @param path - File path in bucket
 * @returns true if deletion was successful
 */
export async function deleteFile(
  bucket: string,
  path: string
): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      console.error('Error deleting file:', handleSupabaseError(error));
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting file:', handleSupabaseError(error));
    return false;
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export default supabase;
