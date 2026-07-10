// src/shared/components/ui/Input.tsx
import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/utils/cn';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

// ============================================
// INPUT VARIANTS
// ============================================
const inputVariants = cva([
  "w-full rounded-lg font-medium transition-all duration-normal",
  "bg-white dark:bg-gray-900",
  "border border-gray-200 dark:border-gray-700",
  "text-gray-900 dark:text-gray-100",
  "placeholder:text-gray-400 dark:placeholder:text-gray-500",
  "hover:border-gray-300 dark:hover:border-gray-600",
  "focus:outline-none focus:border-brand-500 dark:focus:border-brand-400",
  "focus:ring-2 focus:ring-brand-500/20 dark:focus:ring-brand-400/20",
  "disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed",
],
  {
    variants: {
      variant: {
        default: [
          "border border-gray-300 bg-white text-gray-900",
          "hover:border-gray-400",
          "focus:border-brand-500 focus:ring-brand-500/20",
        ],
        filled: [
          "border-0 bg-gray-100 text-gray-900",
          "hover:bg-gray-200",
          "focus:bg-white focus:ring-brand-500/20",
        ],
        error: [
          "border-2 border-danger-500 bg-white text-gray-900",
          "focus:border-danger-500 focus:ring-danger-500/20",
        ],
      },
        inputSize: {
          sm: "h-9 px-3 text-sm",
          md: "h-10 px-4 text-sm",
          lg: "h-11 px-5 text-base",
        },
    },
    defaultVariants: {
      variant: "default",
      inputSize: "md",
    },
  }
);

// ============================================
// INPUT COMPONENT
// ============================================
export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant,
      inputSize,
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      fullWidth = true,
      type = 'text',
      id,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const isPassword = type === 'password';
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    const actualVariant = error ? 'error' : variant;

    return (
      <div className={cn("space-y-1", fullWidth && "w-full")}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700"
          >
            {label}
            {props.required && <span className="text-danger-500 ms-1">*</span>}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Start Icon (was: Left Icon — flipped for RTL) */}
          {leftIcon && (
            <div className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            id={inputId}
            type={isPassword && showPassword ? 'text' : type}
            className={cn(
              inputVariants({ variant: actualVariant, inputSize }),
              leftIcon && "ps-10",
              (rightIcon || isPassword) && "pe-10",
              className
            )}
            {...props}
          />

          {/* End Icon or Password Toggle (was: Right) */}
          {isPassword ? (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          ) : (
            rightIcon && (
              <div className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400">
                {rightIcon}
              </div>
            )
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-start gap-1 text-danger-600 text-sm">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Helper Text */}
        {!error && helperText && (
          <p className="text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// ============================================
// TEXTAREA COMPONENT
// ============================================
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      fullWidth = true,
      id,
      ...props
    },
    ref
  ) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className={cn("space-y-1", fullWidth && "w-full")}>
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-gray-700"
          >
            {label}
            {props.required && <span className="text-danger-500 ms-1">*</span>}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            [
              "w-full rounded-lg px-4 py-3 font-medium transition-all duration-normal",
              "border border-gray-300 bg-white text-gray-900",
              "hover:border-gray-400",
              "focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100",
              "placeholder:text-gray-400",
              "resize-y min-h-[100px]",
            ],
            error && "border-2 border-danger-500 focus:border-danger-500 focus:ring-danger-500/20",
            className
          )}
          {...props}
        />

        {error && (
          <div className="flex items-start gap-1 text-danger-600 text-sm">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!error && helperText && (
          <p className="text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
