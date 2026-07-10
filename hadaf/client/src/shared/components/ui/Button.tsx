import React from 'react';
import { Loader2 } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/utils/cn';

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium",
    "transition-all duration-normal",
    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background",
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
    "select-none whitespace-nowrap",
  ],
  {
    variants: {
      variant: {
        primary: [
          "bg-brand-500 text-white shadow-sm",
          "hover:bg-brand-600 hover:shadow-md",
          "active:bg-brand-700 active:scale-[0.98]",
          "focus:ring-brand-500",
          "dark:bg-brand-600 dark:hover:bg-brand-700",
        ],
        secondary: [
          "bg-brand-50 text-brand-700 shadow-sm border border-brand-100",
          "hover:bg-brand-100 hover:border-brand-200",
          "active:bg-brand-200",
          "focus:ring-brand-500",
          "dark:bg-brand-900/30 dark:text-brand-300 dark:border-brand-800",
          "dark:hover:bg-brand-900/50",
        ],
        outline: [
          "border border-gray-300 text-gray-700 bg-white",
          "hover:bg-gray-50 hover:border-gray-400",
          "active:bg-gray-100",
          "focus:ring-brand-500",
          "dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700",
          "dark:hover:bg-gray-800 dark:hover:border-gray-600",
        ],
        ghost: [
          "bg-transparent text-gray-700",
          "hover:bg-gray-100",
          "active:bg-gray-200",
          "focus:ring-gray-500",
          "dark:text-gray-300 dark:hover:bg-gray-800",
        ],
        danger: [
          "bg-danger-500 text-white shadow-sm",
          "hover:bg-danger-600 hover:shadow-md",
          "active:bg-danger-700 active:scale-[0.98]",
          "focus:ring-danger-500",
        ],
        success: [
          "bg-success-500 text-white shadow-sm",
          "hover:bg-success-600 hover:shadow-md",
          "active:bg-success-700 active:scale-[0.98]",
          "focus:ring-success-500",
        ],
        link: [
          "text-brand-600 underline-offset-4 p-0 h-auto",
          "hover:underline hover:text-brand-700",
          "focus:ring-0",
          "dark:text-brand-400 dark:hover:text-brand-300",
        ],
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-11 px-6 text-base",
        xl: "h-12 px-8 text-base",
        icon: "h-10 w-10",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      variant,
      size,
      fullWidth,
      isLoading,
      leftIcon,
      rightIcon,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, fullWidth }), className)}
        disabled={isLoading || disabled}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{children}</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';