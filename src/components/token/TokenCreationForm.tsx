'use client';

/**
 * Token Creation Form Component
 *
 * Comprehensive form for creating new tokens with real-time validation,
 * image preview, and character counters. Uses react-hook-form and Zod
 * for robust form management and validation.
 *
 * @example
 * ```tsx
 * <TokenCreationForm
 *   onSubmit={async (data) => {
 *     await createToken(data);
 *   }}
 *   onCancel={() => router.back()}
 * />
 * ```
 */

import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { tokenCreationSchema, TokenCreationFormData } from '@/lib/validation/tokenSchema';
import { Input, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardBody, CardFooter, CardTitle, CardDescription } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { Upload, X, Image as ImageIcon, Globe, Twitter, Send } from 'lucide-react';

export interface TokenCreationFormProps {
  /** Form submission handler */
  onSubmit: (data: TokenCreationFormData) => Promise<void>;
  /** Cancel handler */
  onCancel?: () => void;
  /** Initial form values */
  defaultValues?: Partial<TokenCreationFormData>;
  /** Show cancel button */
  showCancel?: boolean;
}

/**
 * TokenCreationForm Component
 *
 * Full-featured token creation form with validation and preview
 */
export function TokenCreationForm({
  onSubmit,
  onCancel,
  defaultValues,
  showCancel = true,
}: TokenCreationFormProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form with react-hook-form and Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
    trigger,
  } = useForm<TokenCreationFormData>({
    resolver: zodResolver(tokenCreationSchema),
    mode: 'onChange',
    defaultValues: {
      name: defaultValues?.name || '',
      symbol: defaultValues?.symbol || '',
      description: defaultValues?.description || '',
      totalSupply: defaultValues?.totalSupply || 1000000,
      websiteUrl: defaultValues?.websiteUrl || '',
      twitterUrl: defaultValues?.twitterUrl || '',
      telegramUrl: defaultValues?.telegramUrl || '',
    },
  });

  // Watch form fields for character counters
  const name = watch('name') || '';
  const symbol = watch('symbol') || '';
  const description = watch('description') || '';

  /**
   * Handle image file selection
   */
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Set the file in form state
    setValue('image', file as any, {
      shouldValidate: true,
      shouldDirty: true,
    });

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  /**
   * Remove selected image
   */
  const handleRemoveImage = () => {
    setImagePreview(null);
    setValue('image', undefined as any);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    trigger('image');
  };

  /**
   * Handle form submission
   */
  const onSubmitForm = async (data: TokenCreationFormData) => {
    try {
      setIsSubmitting(true);
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Format number with commas
   */
  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="w-full max-w-3xl mx-auto">
      <Card variant="elevated" className="backdrop-blur-sm">
        {/* Header */}
        <CardHeader bordered>
          <CardTitle size="lg">Create Your Token</CardTitle>
          <CardDescription>
            Fill in the details below to create your new Solana token.
            All fields marked with * are required.
          </CardDescription>
        </CardHeader>

        <CardBody className="space-y-6">
          {/* Basic Information Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <span className="w-1 h-4 bg-gradient-to-b from-thunder-blue to-thunder-purple rounded-full" />
              Basic Information
            </h3>

            {/* Token Name */}
            <div>
              <Input
                label="Token Name"
                placeholder="Enter token name (e.g., Thunder Token)"
                error={errors.name?.message}
                required
                fullWidth
                {...register('name')}
              />
              <div className="flex justify-end mt-1">
                <span
                  className={cn(
                    'text-xs',
                    name.length > 32
                      ? 'text-danger-red'
                      : name.length > 25
                      ? 'text-warning-orange'
                      : 'text-gray-500'
                  )}
                >
                  {name.length}/32
                </span>
              </div>
            </div>

            {/* Token Symbol */}
            <div>
              <Input
                label="Token Symbol"
                placeholder="Enter symbol (e.g., THNDR)"
                error={errors.symbol?.message}
                helperText="Symbol will be automatically converted to uppercase"
                required
                fullWidth
                {...register('symbol', {
                  onChange: (e) => {
                    e.target.value = e.target.value.toUpperCase();
                  },
                })}
                className="uppercase"
              />
              <div className="flex justify-end mt-1">
                <span
                  className={cn(
                    'text-xs',
                    symbol.length > 10
                      ? 'text-danger-red'
                      : symbol.length > 8
                      ? 'text-warning-orange'
                      : 'text-gray-500'
                  )}
                >
                  {symbol.length}/10
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <Textarea
                label="Description"
                placeholder="Describe your token, its purpose, and use cases..."
                rows={4}
                error={errors.description?.message}
                required
                fullWidth
                {...register('description')}
              />
              <div className="flex justify-end mt-1">
                <span
                  className={cn(
                    'text-xs',
                    description.length > 500
                      ? 'text-danger-red'
                      : description.length > 450
                      ? 'text-warning-orange'
                      : 'text-gray-500'
                  )}
                >
                  {description.length}/500
                </span>
              </div>
            </div>

            {/* Total Supply */}
            <div>
              <Input
                label="Total Supply"
                type="number"
                placeholder="1000000"
                error={errors.totalSupply?.message}
                helperText="Enter a value between 1,000,000 (1M) and 1,000,000,000,000 (1T)"
                required
                fullWidth
                {...register('totalSupply', {
                  valueAsNumber: true,
                })}
              />
              {watch('totalSupply') && !errors.totalSupply && (
                <div className="mt-2 text-xs text-gray-400">
                  Formatted: {formatNumber(watch('totalSupply'))} tokens
                </div>
              )}
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <span className="w-1 h-4 bg-gradient-to-b from-thunder-blue to-thunder-purple rounded-full" />
              Token Image
            </h3>

            <div>
              {!imagePreview ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    'relative border-2 border-dashed rounded-lg p-8 transition-all duration-200 cursor-pointer',
                    'hover:border-thunder-blue hover:bg-gray-800/50',
                    errors.image
                      ? 'border-danger-red bg-red-950/10'
                      : 'border-gray-700 bg-gray-900'
                  )}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center justify-center gap-3 text-center">
                    <div className="p-3 rounded-full bg-gray-800 border border-gray-700">
                      <Upload className="w-6 h-6 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-300">
                        Click to upload token image
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        JPG, PNG, or WEBP (max 5MB)
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative rounded-lg border-2 border-gray-700 bg-gray-900 p-4">
                  <div className="flex items-start gap-4">
                    {/* Image Preview */}
                    <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-gray-800 border border-gray-700 flex-shrink-0">
                      <img
                        src={imagePreview}
                        alt="Token preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    </div>

                    {/* Image Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                          <ImageIcon className="w-4 h-4 flex-shrink-0" />
                          <span className="font-medium truncate">Token Image</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="p-1 rounded hover:bg-gray-800 text-gray-400 hover:text-danger-red transition-colors"
                          aria-label="Remove image"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Click the remove button to change the image
                      </p>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-3 text-xs text-thunder-blue hover:text-blue-400 transition-colors"
                      >
                        Change Image
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>
              )}

              {errors.image && (
                <p className="mt-2 text-sm text-danger-red flex items-center gap-1">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {errors.image.message as string}
                </p>
              )}
            </div>
          </div>

          {/* Social Links Section (Optional) */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <span className="w-1 h-4 bg-gradient-to-b from-thunder-blue to-thunder-purple rounded-full" />
              Social Links
              <span className="text-xs font-normal text-gray-500 normal-case">(Optional)</span>
            </h3>

            {/* Website URL */}
            <Input
              label="Website URL"
              type="url"
              placeholder="https://yourtoken.com"
              error={errors.websiteUrl?.message}
              leftIcon={<Globe className="w-4 h-4" />}
              fullWidth
              {...register('websiteUrl')}
            />

            {/* Twitter URL */}
            <Input
              label="Twitter / X URL"
              type="url"
              placeholder="https://twitter.com/yourtoken"
              error={errors.twitterUrl?.message}
              helperText="Enter your Twitter or X profile URL"
              leftIcon={<Twitter className="w-4 h-4" />}
              fullWidth
              {...register('twitterUrl')}
            />

            {/* Telegram URL */}
            <Input
              label="Telegram URL"
              type="url"
              placeholder="https://t.me/yourtoken"
              error={errors.telegramUrl?.message}
              helperText="Enter your Telegram group or channel URL"
              leftIcon={<Send className="w-4 h-4" />}
              fullWidth
              {...register('telegramUrl')}
            />
          </div>
        </CardBody>

        {/* Footer with Actions */}
        <CardFooter bordered align="between">
          <div className="text-xs text-gray-500">
            * Required fields
          </div>
          <div className="flex items-center gap-3">
            {showCancel && onCancel && (
              <Button
                type="button"
                variant="ghost"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
              disabled={!isValid || isSubmitting}
              className="min-w-[140px]"
            >
              {isSubmitting ? 'Creating...' : 'Create Token'}
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Info Card */}
      <div className="mt-4 p-4 bg-blue-950/20 border border-blue-900/30 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="p-1.5 rounded-full bg-thunder-blue/20">
            <svg
              className="w-4 h-4 text-thunder-blue"
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
          <div className="flex-1">
            <h4 className="text-sm font-medium text-blue-300">Important Information</h4>
            <p className="text-xs text-gray-400 mt-1">
              Make sure to review all details carefully before creating your token.
              Token creation is permanent and cannot be undone.
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}

export default TokenCreationForm;
