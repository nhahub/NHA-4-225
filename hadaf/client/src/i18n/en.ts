// English dictionary. Mirrors the shape of ar.ts exactly — every key in
// ar.ts has a counterpart here. Missing keys fall back to the i18n key
// string at the call site (useTranslation helper), so the dev loop is
// never broken by missing translations.

const en = {
  app: {
    name: 'Hadaf',
    tagline: 'One step at a time, toward your goal',
  },
  common: {
    save: 'Save',
    cancel: 'Cancel',
    submit: 'Submit',
    retry: 'Retry',
    error: 'Something went wrong',
    loading: 'Loading...',
    back: 'Back',
    next: 'Next',
    confirm: 'Confirm',
    delete: 'Delete',
    edit: 'Edit',
    yes: 'Yes',
    no: 'No',
  },
  language: {
    ar: 'العربية',
    en: 'English',
  },
  languageSwitcher: {
    toggle: 'Toggle language',
  },
  nav: {
    home: 'Home',
    goals: 'Goals',
    habits: 'Habits',
    overview: 'Overview',
    settings: 'Settings',
    more: 'More',
  },
  auth: {
    signIn: 'Sign in',
    signUp: 'Sign up',
    signOut: 'Sign out',
    email: 'Email',
    password: 'Password',
    name: 'Name',
    welcome: 'Welcome back',
    accountCreated: 'Account created successfully',
    errors: {
      emailExists: 'This email is already registered',
      invalidCredentials: 'Invalid credentials',
      tokenInvalid: 'Session is invalid, please sign in again',
      tokenExpired: 'Session has expired, please sign in again',
      validationFailed: 'The provided data is invalid',
    },
  },
  errors: {
    networkError: 'Could not reach the server',
    internalServer: 'Server error',
    csrfDetected: 'Unauthorized request',
    routeNotFound: 'Page not found',
    corsBlocked: 'Request origin not allowed',
  },
  placeholder: {
    comingSoon: 'Coming soon',
  },
  sidebar: {
    dailySummary: 'Daily Summary',
    done: 'Done',
    pending: 'Pending',
    focus: 'Focus',
    score: 'Score',
    signOut: 'Sign out',
  },
};

export default en;
export type EnDict = typeof en;