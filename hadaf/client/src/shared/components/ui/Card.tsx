// src/shared/components/ui/Card.tsx
import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/utils/cn';

// ============================================
// CARD VARIANTS
// ============================================
const cardVariants = cva(
  "rounded-xl transition-all duration-normal",
  {
    variants: {
      variant: {
        default: [
          "bg-white dark:bg-gray-900",
          "border border-gray-200 dark:border-gray-800",
          "shadow-card hover:shadow-card-hover",
        ],
        elevated: [
          "bg-white dark:bg-gray-900",
          "shadow-lg hover:shadow-xl",
        ],
        ghost: "bg-transparent",
      },
      padding: {
        none: "p-0",
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "md",
    },
  }
);

// ============================================
// CARD ROOT COMPONENT
// ============================================
export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  as?: React.ElementType;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, as: Component = 'div', ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(cardVariants({ variant, padding }), className)}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';

// ============================================
// CARD HEADER
// ============================================
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  divider?: boolean;
}

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, divider, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col space-y-1.5",
          divider && "pb-4 border-b border-gray-200 dark:border-gray-800",
          className
        )}
        {...props}
      />
    );
  }
);

CardHeader.displayName = 'CardHeader';

// ============================================
// CARD TITLE
// ============================================
export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, as: Component = 'h3', ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn("text-xl font-semibold leading-none tracking-tight text-gray-900 dark:text-white", className)}
        {...props}
      />
    );
  }
);

CardTitle.displayName = 'CardTitle';

// ============================================
// CARD DESCRIPTION
// ============================================
export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={cn("text-sm text-gray-600 dark:text-gray-400", className)}
      {...props}
    />
  );
});

CardDescription.displayName = 'CardDescription';

// ============================================
// CARD CONTENT
// ============================================
export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("pt-4", className)}
      {...props}
    />
  );
});

CardContent.displayName = 'CardContent';

// ============================================
// CARD FOOTER
// ============================================
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  divider?: boolean;
}

export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, divider, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center pt-4",
          divider && "border-t border-gray-200 dark:border-gray-800",
          className
        )}
        {...props}
      />
    );
  }
);

CardFooter.displayName = 'CardFooter';

// ============================================
// STATS CARD (Specific for Dashboard)
// ============================================
interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: 'brand' | 'success' | 'danger' | 'warning' | 'info';
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  color = 'brand',
}) => {
  const colorClasses = {
    brand: 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20',
    success: 'text-success-600 dark:text-success-400 bg-success-50 dark:bg-success-900/20',
    danger: 'text-danger-600 dark:text-danger-400 bg-danger-50 dark:bg-danger-900/20',
    warning: 'text-warning-600 dark:text-warning-400 bg-warning-50 dark:bg-warning-900/20',
    info: 'text-info-600 dark:text-info-400 bg-info-50 dark:bg-info-900/20',
  };

  return (
    <Card className="hover:scale-[1.01] active:scale-[0.99] transition-transform duration-200 cursor-default">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
        </div>
        
        {icon && (
          <div className={cn("p-3 rounded-xl", colorClasses[color])}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};