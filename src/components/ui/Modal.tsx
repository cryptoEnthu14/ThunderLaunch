'use client';

/**
 * Modal Component
 *
 * A flexible modal dialog component built with Radix UI Dialog.
 * Features backdrop blur, smooth animations, and accessible keyboard navigation.
 *
 * @example
 * ```tsx
 * <Modal open={isOpen} onOpenChange={setIsOpen}>
 *   <ModalContent>
 *     <ModalHeader>
 *       <ModalTitle>Confirm Action</ModalTitle>
 *       <ModalDescription>Are you sure you want to proceed?</ModalDescription>
 *     </ModalHeader>
 *     <ModalBody>
 *       <p>This action cannot be undone.</p>
 *     </ModalBody>
 *     <ModalFooter>
 *       <Button variant="ghost" onClick={() => setIsOpen(false)}>
 *         Cancel
 *       </Button>
 *       <Button variant="danger" onClick={handleConfirm}>
 *         Confirm
 *       </Button>
 *     </ModalFooter>
 *   </ModalContent>
 * </Modal>
 * ```
 */

import React, { forwardRef, HTMLAttributes } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';

export interface ModalProps {
  /** Whether the modal is open */
  open?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Modal content */
  children: React.ReactNode;
  /** Default open state (uncontrolled) */
  defaultOpen?: boolean;
}

/**
 * Modal Root Component
 *
 * Wrapper for the modal dialog
 */
export const Modal: React.FC<ModalProps> = ({
  open,
  onOpenChange,
  children,
  defaultOpen,
}) => {
  return (
    <Dialog.Root
      open={open}
      onOpenChange={onOpenChange}
      defaultOpen={defaultOpen}
    >
      {children}
    </Dialog.Root>
  );
};

/**
 * Modal Trigger Component
 *
 * Button that opens the modal
 */
export const ModalTrigger = Dialog.Trigger;

/**
 * Modal Portal Component
 *
 * Renders modal in a portal (outside normal DOM hierarchy)
 */
export const ModalPortal = Dialog.Portal;

/**
 * Modal Overlay Component
 *
 * Backdrop behind the modal with blur effect
 */
export const ModalOverlay = forwardRef<
  HTMLDivElement,
  Dialog.DialogOverlayProps
>(({ className, ...props }, ref) => (
  <Dialog.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm',
      'data-[state=open]:animate-in data-[state=closed]:animate-out',
      'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className
    )}
    {...props}
  />
));

ModalOverlay.displayName = 'ModalOverlay';

/**
 * Modal Content Component
 *
 * Main modal container with content
 */
export interface ModalContentProps extends Dialog.DialogContentProps {
  /** Size of the modal */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Hide close button */
  hideCloseButton?: boolean;
}

export const ModalContent = forwardRef<HTMLDivElement, ModalContentProps>(
  (
    {
      className,
      children,
      size = 'md',
      hideCloseButton = false,
      ...props
    },
    ref
  ) => {
    const sizeStyles = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      full: 'max-w-full mx-4',
    };

    return (
      <ModalPortal>
        <ModalOverlay />
        <Dialog.Content
          ref={ref}
          className={cn(
            'fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%]',
            'w-full',
            sizeStyles[size],
            'bg-gray-800 border border-gray-700 rounded-lg shadow-2xl',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
            'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
            'duration-200',
            'focus:outline-none',
            className
          )}
          {...props}
        >
          {children}

          {/* Close Button */}
          {!hideCloseButton && (
            <Dialog.Close
              className={cn(
                'absolute right-4 top-4 rounded-sm opacity-70 transition-opacity',
                'hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500',
                'disabled:pointer-events-none',
                'text-gray-400 hover:text-gray-200'
              )}
              aria-label="Close modal"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </Dialog.Close>
          )}
        </Dialog.Content>
      </ModalPortal>
    );
  }
);

ModalContent.displayName = 'ModalContent';

/**
 * Modal Header Component
 */
export interface ModalHeaderProps extends HTMLAttributes<HTMLDivElement> {}

export const ModalHeader = forwardRef<HTMLDivElement, ModalHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('px-6 pt-6 pb-4', className)}
      {...props}
    />
  )
);

ModalHeader.displayName = 'ModalHeader';

/**
 * Modal Body Component
 */
export interface ModalBodyProps extends HTMLAttributes<HTMLDivElement> {
  /** Remove default padding */
  noPadding?: boolean;
}

export const ModalBody = forwardRef<HTMLDivElement, ModalBodyProps>(
  ({ className, noPadding = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(!noPadding && 'px-6 py-4', className)}
      {...props}
    />
  )
);

ModalBody.displayName = 'ModalBody';

/**
 * Modal Footer Component
 */
export interface ModalFooterProps extends HTMLAttributes<HTMLDivElement> {
  /** Add border to top of footer */
  bordered?: boolean;
  /** Align content */
  align?: 'left' | 'center' | 'right' | 'between';
}

export const ModalFooter = forwardRef<HTMLDivElement, ModalFooterProps>(
  (
    { className, bordered = true, align = 'right', ...props },
    ref
  ) => {
    const alignStyles = {
      left: 'justify-start',
      center: 'justify-center',
      right: 'justify-end',
      between: 'justify-between',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'px-6 pb-6 pt-4 flex items-center gap-3',
          bordered && 'border-t border-gray-700',
          alignStyles[align],
          className
        )}
        {...props}
      />
    );
  }
);

ModalFooter.displayName = 'ModalFooter';

/**
 * Modal Title Component
 */
export interface ModalTitleProps extends Dialog.DialogTitleProps {
  /** Title size */
  size?: 'sm' | 'md' | 'lg';
}

export const ModalTitle = forwardRef<HTMLHeadingElement, ModalTitleProps>(
  ({ className, size = 'md', ...props }, ref) => {
    const sizeStyles = {
      sm: 'text-base',
      md: 'text-lg',
      lg: 'text-xl',
    };

    return (
      <Dialog.Title
        ref={ref}
        className={cn(
          'font-semibold text-white',
          sizeStyles[size],
          className
        )}
        {...props}
      />
    );
  }
);

ModalTitle.displayName = 'ModalTitle';

/**
 * Modal Description Component
 */
export interface ModalDescriptionProps extends Dialog.DialogDescriptionProps {}

export const ModalDescription = forwardRef<
  HTMLParagraphElement,
  ModalDescriptionProps
>(({ className, ...props }, ref) => (
  <Dialog.Description
    ref={ref}
    className={cn('text-sm text-gray-400 mt-2', className)}
    {...props}
  />
));

ModalDescription.displayName = 'ModalDescription';

/**
 * Modal Close Component
 *
 * Button that closes the modal
 */
export const ModalClose = Dialog.Close;

export default Modal;
