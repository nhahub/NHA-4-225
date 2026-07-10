import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import { queryClient } from '@/shared/lib/react-query';
import { LocaleProvider } from '@/providers/LocaleProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <ThemeProvider>
      <LocaleProvider>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            {children}

            {/* Toast notifications. RTL flips the start/end; in LTR we want top-right,
                in RTL we want top-left. Sonner doesn't support logical positions, so
                pick the safer default and let user perception cover the small RTL
                visual gap. */}
            <Toaster
              position="top-right"
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
    </ThemeProvider>
  );
};