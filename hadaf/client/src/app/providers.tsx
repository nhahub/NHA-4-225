import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import { queryClient } from '@/shared/lib/react-query';
import { LocaleProvider } from '@/providers/LocaleProvider';

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <LocaleProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          {children}

          {/* Toast notifications. Position is "top-end" so it flips with RTL. */}
          <Toaster
            position="top-end"
            richColors
            expand={false}
            duration={3000}
          />

          {/* React Query DevTools (only in dev) */}
          {import.meta.env.DEV && (
            <ReactQueryDevtools initialIsOpen={false} position="bottom" />
          )}
        </BrowserRouter>
      </QueryClientProvider>
    </LocaleProvider>
  );
};