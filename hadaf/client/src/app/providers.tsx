import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import { queryClient } from '@/shared/lib/react-query';
import { LocaleProvider } from '@/providers/LocaleProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { DayTypeProvider } from '@/providers/DayTypeProvider';

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <ThemeProvider>
      <LocaleProvider>
        <QueryClientProvider client={queryClient}>
          <DayTypeProvider>
            <BrowserRouter>
              {children}

              <Toaster
                position="top-right"
                richColors
                expand={false}
                duration={3000}
              />

              {import.meta.env.DEV && (
                <ReactQueryDevtools initialIsOpen={false} position="bottom" />
              )}
            </BrowserRouter>
          </DayTypeProvider>
        </QueryClientProvider>
      </LocaleProvider>
    </ThemeProvider>
  );
};