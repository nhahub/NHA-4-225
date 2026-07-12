// src/shared/components/EmptyState.tsx
//
// POL-1 — Shared empty-state component. Positive voice per the project's
// voice guardrail: never "nothing here" flatness, always an invitation.
//
// Visual language matches `features/overview/components/AnalyticsEmptyState.tsx`:
// rounded-3xl, brand-tinted icon glyph, eyebrow title, body helper, optional
// CTA. The icon prop accepts any lucide-react icon (or a custom node).
//
// Used by Tasks/Goals/Habits pages, plus an optional match for HOME's
// `noGoalsAtAll` branch when the rest of the layout also needs the same
// treatment.
import type { ReactNode } from 'react';
import { cn } from '@/shared/utils/cn';

export interface EmptyStateProps {
  /** Lucide icon or any node rendered inside the brand-tinted tile. */
  icon: ReactNode;
  /** Headline (i18n key or plain string). Required. */
  title: string;
  /** Supporting helper copy beneath the headline. Optional. */
  body?: string;
  /** Optional CTA. When omitted no button is rendered. */
  cta?: ReactNode;
  /** Optional extra content beneath the CTA (chips, links, etc.). */
  children?: ReactNode;
  className?: string;
}

export const EmptyState = ({ icon, title, body, cta, children, className }: EmptyStateProps) => {
  return (
    <div
      className={cn(
        'p-10 flex flex-col items-center justify-center text-center',
        className,
      )}
    >
      <div className="w-16 h-16 rounded-2xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400 mb-5">
        {icon}
      </div>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        {title}
      </h2>
      {body && (
        <p className="text-sm text-foreground-muted max-w-md mb-6">{body}</p>
      )}
      {cta}
      {children}
    </div>
  );
};
