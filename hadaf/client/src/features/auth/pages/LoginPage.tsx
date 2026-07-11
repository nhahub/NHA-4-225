import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2, Moon, Sun } from 'lucide-react';
import { format } from 'date-fns';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { loginWithEmail, registerWithEmail } from '@/features/auth/api/authApi';
import { useTheme } from '@/providers/useTheme';
import { useTranslation } from '@/providers/useLocale';
import { LanguageSwitcher } from '@/shared/components/layout/LanguageSwitcher';
import { cn } from '@/shared/utils/cn';
import styles from './LoginPage.module.css';

// --- Validation Schemas ---
const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

const registerSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const LoginPage = () => {
  const { t } = useTranslation();
  const [isRightPanelActive, setIsRightPanelActive] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === 'dark';

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { register: registerLogin, handleSubmit: handleLoginSubmit, formState: { errors: loginErrors, isSubmitting: isLoginSubmitting } } = useForm({ resolver: zodResolver(loginSchema) });
  const { register: registerSignUp, handleSubmit: handleRegisterSubmit, formState: { errors: registerErrors, isSubmitting: isRegisterSubmitting } } = useForm({ resolver: zodResolver(registerSchema) });

  const resolveRedirect = (): string => {
    const params = new URLSearchParams(location.search);
    const target = params.get('redirect');
    if (target && target.startsWith('/') && !target.startsWith('//')) return target;
    return '/';
  };

  const onLogin = async (data: { email: string; password: string }) => {
    try {
      const response = await loginWithEmail(data);
      login(response.accessToken, response.user);
      toast.success(t('auth.welcome'));
      navigate(resolveRedirect(), { replace: true });
    } catch (error: unknown) {
      const key =
        (error instanceof Error && error.message) ||
        'auth.errors.invalidCredentials';
      // The API layer surfaces errors as i18n keys (ApiError.message = i18nKey);
      // translate before showing so users see a real message, not a raw key.
      toast.error(t(key));
    }
  };

  const onRegister = async (data: { name: string; email: string; password: string }) => {
    try {
      const response = await registerWithEmail(data);
      login(response.accessToken, response.user);
      toast.success(t('auth.accountCreated'));
      navigate(resolveRedirect(), { replace: true });
    } catch (error: unknown) {
      const key =
        (error instanceof Error && error.message) ||
        'auth.errors.validationFailed';
      toast.error(t(key));
    }
  };

  const formClasses = 'bg-white dark:bg-gray-900 flex items-center justify-center flex-col px-10 h-full text-center transition-colors';
  const inputClasses = 'bg-gray-100 dark:bg-gray-800 border-none p-3 rounded-lg w-full outline-none text-sm placeholder:text-gray-400 text-gray-900 dark:text-white transition-colors my-2';
  const buttonClasses = 'mt-4 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold py-3 px-10 rounded-lg uppercase tracking-wider transition-colors shadow-lg shadow-brand-500/30 flex items-center gap-2 disabled:opacity-70 justify-center';
  const overlayButtonClasses = 'mt-4 bg-transparent border border-white text-white text-xs font-bold py-3 px-10 rounded-lg uppercase tracking-wider hover:bg-white/10 transition-colors';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-950 transition-colors px-4 font-sans relative overflow-hidden">
      <header className="absolute top-0 start-0 w-full p-6 md:px-12 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-brand-500/20">{`ح`}</div>
          <span className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight hidden sm:block">{`هدف`}</span>
        </div>
        <div className="absolute start-1/2 -translate-x-1/2 hidden md:block">
          <span className="text-2xl font-bold text-gray-400 dark:text-gray-600 tabular-nums tracking-tight opacity-50 select-none">{format(currentTime, 'h:mm a')}</span>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <button onClick={toggleTheme} className="w-10 h-10 rounded-xl flex items-center justify-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-all shadow-sm hover:shadow-md">
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      <div className={cn(styles.container, isRightPanelActive && styles['right-panel-active'])}>

        {/* Sign Up */}
        <div className={cn(styles['form-container'], styles['sign-up-container'])}>
          <form onSubmit={handleRegisterSubmit(onRegister)} className={formClasses}>
            <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">{t('auth.signUp')}</h1>
            <span className="text-xs text-gray-500 dark:text-gray-400 mb-4">{t('auth.welcome')}</span>
            <div className="w-full">
              <input {...registerSignUp('name')} type="text" placeholder={t('auth.name')} className={inputClasses} />
              {registerErrors.name && <p className="text-red-500 text-xs text-start">{(registerErrors.name as { message: string }).message}</p>}
              <input {...registerSignUp('email')} type="email" placeholder={t('auth.email')} className={inputClasses} />
              {registerErrors.email && <p className="text-red-500 text-xs text-start">{(registerErrors.email as { message: string }).message}</p>}
              <input {...registerSignUp('password')} type="password" placeholder={t('auth.password')} className={inputClasses} />
              {registerErrors.password && <p className="text-red-500 text-xs text-start">{(registerErrors.password as { message: string }).message}</p>}
            </div>
            <button disabled={isRegisterSubmitting} className={buttonClasses}>
              {isRegisterSubmitting && <Loader2 className="w-4 h-4 animate-spin" />} {t('auth.signUp')}
            </button>
          </form>
        </div>

        {/* Sign In */}
        <div className={cn(styles['form-container'], styles['sign-in-container'])}>
          <form onSubmit={handleLoginSubmit(onLogin)} className={formClasses}>
            <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">{t('auth.signIn')}</h1>
            <span className="text-xs text-gray-500 dark:text-gray-400 mb-6">{t('auth.welcome')}</span>
            <div className="w-full">
              <input {...registerLogin('email')} type="email" placeholder={t('auth.email')} className={inputClasses} />
              {loginErrors.email && <p className="text-red-500 text-xs text-start">{(loginErrors.email as { message: string }).message}</p>}
              <input {...registerLogin('password')} type="password" placeholder={t('auth.password')} className={inputClasses} />
              {loginErrors.password && <p className="text-red-500 text-xs text-start">{(loginErrors.password as { message: string }).message}</p>}
            </div>
            <a href="#" className="text-gray-500 dark:text-gray-400 text-xs mt-4 mb-2 hover:text-brand-600 transition-colors">{t('auth.password')}</a>
            <button disabled={isLoginSubmitting} className={buttonClasses}>
              {isLoginSubmitting && <Loader2 className="w-4 h-4 animate-spin" />} {t('auth.signIn')}
            </button>
          </form>
        </div>

        {/* Overlay */}
        <div className={styles['overlay-container']}>
          <div className={styles.overlay}>
            <div className={cn(styles['overlay-panel'], styles['overlay-left'])}>
              <h1 className="text-3xl font-bold mb-4">{t('auth.welcome')}</h1>
              <p className="text-sm leading-6 tracking-wide mb-8">{t('auth.signIn')}</p>
              <button className={overlayButtonClasses} onClick={() => setIsRightPanelActive(false)}>{t('auth.signIn')}</button>
            </div>
            <div className={cn(styles['overlay-panel'], styles['overlay-right'])}>
              <h1 className="text-3xl font-bold mb-4">{t('auth.signUp')}</h1>
              <p className="text-sm leading-6 tracking-wide mb-8">{t('auth.welcome')}</p>
              <button className={overlayButtonClasses} onClick={() => setIsRightPanelActive(true)}>{t('auth.signUp')}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
