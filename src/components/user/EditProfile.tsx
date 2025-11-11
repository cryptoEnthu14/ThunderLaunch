'use client';

/**
 * EditProfile Component
 *
 * Modal for editing user profile information.
 */

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Upload, User, Loader2 } from 'lucide-react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalBody,
} from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import { updateUserProfile, uploadAvatar, isUsernameAvailable } from '@/lib/supabase/users';
import { toast } from '@/lib/notifications/toast';
import type { UserProfile } from '@/types/user';

// =============================================================================
// TYPES
// =============================================================================

export interface EditProfileProps {
  /** Is modal open */
  open: boolean;
  /** Callback when modal is closed */
  onOpenChange: (open: boolean) => void;
  /** Current user profile */
  profile: UserProfile;
  /** Callback when profile is updated */
  onProfileUpdated?: (profile: UserProfile) => void;
}

interface FormData {
  username: string;
  display_name: string;
  bio: string;
  twitter: string;
  telegram: string;
  discord: string;
  website: string;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function EditProfile({
  open,
  onOpenChange,
  profile,
  onProfileUpdated,
}: EditProfileProps) {
  // Form state
  const [formData, setFormData] = useState<FormData>({
    username: profile.username || '',
    display_name: profile.display_name || '',
    bio: profile.bio || '',
    twitter: profile.social_links?.twitter || '',
    telegram: profile.social_links?.telegram || '',
    discord: profile.social_links?.discord || '',
    website: profile.social_links?.website || '',
  });

  // Avatar state
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    profile.avatar_url || null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);

  /**
   * Handle form field change
   */
  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear username error when typing
    if (field === 'username') {
      setUsernameError(null);
    }
  };

  /**
   * Handle avatar file selection
   */
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large', 'Avatar must be less than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Invalid file type', 'Avatar must be an image');
      return;
    }

    setAvatarFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  /**
   * Validate username
   */
  const validateUsername = async (username: string): Promise<boolean> => {
    if (!username) {
      return true; // Username is optional
    }

    // Check length
    if (username.length < 3) {
      setUsernameError('Username must be at least 3 characters');
      return false;
    }

    if (username.length > 20) {
      setUsernameError('Username must be less than 20 characters');
      return false;
    }

    // Check format (alphanumeric and underscore only)
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setUsernameError('Username can only contain letters, numbers, and underscores');
      return false;
    }

    // Check availability (if changed)
    if (username !== profile.username) {
      setIsCheckingUsername(true);
      const { data: isAvailable, error } = await isUsernameAvailable(
        username,
        profile.wallet_address
      );
      setIsCheckingUsername(false);

      if (error) {
        setUsernameError('Error checking username availability');
        return false;
      }

      if (!isAvailable) {
        setUsernameError('Username is already taken');
        return false;
      }
    }

    return true;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate username
      if (formData.username) {
        const isValid = await validateUsername(formData.username);
        if (!isValid) {
          setIsLoading(false);
          return;
        }
      }

      // Upload avatar if changed
      let avatarUrl = profile.avatar_url;
      if (avatarFile) {
        const { data: uploadedUrl, error: uploadError } = await uploadAvatar(
          profile.wallet_address,
          avatarFile
        );

        if (uploadError) {
          toast.error('Failed to upload avatar', uploadError);
          setIsLoading(false);
          return;
        }

        avatarUrl = uploadedUrl || undefined;
      }

      // Update profile
      const { data: updatedProfile, error } = await updateUserProfile(
        profile.wallet_address,
        {
          username: formData.username || undefined,
          display_name: formData.display_name || undefined,
          bio: formData.bio || undefined,
          avatar_url: avatarUrl,
          social_links: {
            twitter: formData.twitter || undefined,
            telegram: formData.telegram || undefined,
            discord: formData.discord || undefined,
            website: formData.website || undefined,
          },
        }
      );

      if (error) {
        toast.error('Failed to update profile', error);
        setIsLoading(false);
        return;
      }

      // Success!
      toast.success('Profile updated!', 'Your profile has been successfully updated');
      onProfileUpdated?.(updatedProfile!);
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Reset form when modal closes
   */
  React.useEffect(() => {
    if (!open) {
      setFormData({
        username: profile.username || '',
        display_name: profile.display_name || '',
        bio: profile.bio || '',
        twitter: profile.social_links?.twitter || '',
        telegram: profile.social_links?.telegram || '',
        discord: profile.social_links?.discord || '',
        website: profile.social_links?.website || '',
      });
      setAvatarFile(null);
      setAvatarPreview(profile.avatar_url || null);
      setUsernameError(null);
    }
  }, [open, profile]);

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="lg">
        <ModalHeader>
          <ModalTitle>Edit Profile</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Avatar
              </label>
              <div className="flex items-center gap-4">
                <div className="relative w-24 h-24 rounded-full border-2 border-gray-700 bg-gray-800 overflow-hidden flex-shrink-0">
                  {avatarPreview ? (
                    <Image
                      src={avatarPreview}
                      alt="Avatar preview"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <User className="w-12 h-12" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Image
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">
                    PNG, JPG or GIF. Max 5MB.
                  </p>
                </div>
              </div>
            </div>

            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <div className="relative">
                <Input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleChange('username', e.target.value)}
                  placeholder="Enter username"
                  className={cn(usernameError && 'border-red-500')}
                />
                {isCheckingUsername && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                  </div>
                )}
              </div>
              {usernameError && (
                <p className="text-xs text-red-500 mt-1">{usernameError}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Alphanumeric and underscores only. 3-20 characters.
              </p>
            </div>

            {/* Display Name */}
            <div>
              <label htmlFor="display_name" className="block text-sm font-medium text-gray-300 mb-2">
                Display Name
              </label>
              <Input
                id="display_name"
                type="text"
                value={formData.display_name}
                onChange={(e) => handleChange('display_name', e.target.value)}
                placeholder="Enter display name"
              />
            </div>

            {/* Bio */}
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-300 mb-2">
                Bio
              </label>
              <textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                placeholder="Tell us about yourself..."
                rows={4}
                maxLength={500}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.bio.length}/500 characters
              </p>
            </div>

            {/* Social Links */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-300">Social Links</h3>

              <div>
                <label htmlFor="twitter" className="block text-xs text-gray-400 mb-1">
                  Twitter
                </label>
                <Input
                  id="twitter"
                  type="text"
                  value={formData.twitter}
                  onChange={(e) => handleChange('twitter', e.target.value)}
                  placeholder="@username"
                />
              </div>

              <div>
                <label htmlFor="telegram" className="block text-xs text-gray-400 mb-1">
                  Telegram
                </label>
                <Input
                  id="telegram"
                  type="url"
                  value={formData.telegram}
                  onChange={(e) => handleChange('telegram', e.target.value)}
                  placeholder="https://t.me/username"
                />
              </div>

              <div>
                <label htmlFor="discord" className="block text-xs text-gray-400 mb-1">
                  Discord
                </label>
                <Input
                  id="discord"
                  type="text"
                  value={formData.discord}
                  onChange={(e) => handleChange('discord', e.target.value)}
                  placeholder="username#0000"
                />
              </div>

              <div>
                <label htmlFor="website" className="block text-xs text-gray-400 mb-1">
                  Website
                </label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleChange('website', e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                fullWidth
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={isLoading || !!usernameError}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export default EditProfile;
