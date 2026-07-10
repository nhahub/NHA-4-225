// Arabic dictionary (default locale).
// Keys are namespaced by feature. Errors carry the auth.errors / errors.* namespace
// so the server's i18n keys (Architecture.md §3.3) resolve to the same translations.

const ar = {
  app: {
    name: 'هدف',
    tagline: 'خطوة بخطوة، نحو هدفك',
  },
  common: {
    save: 'حفظ',
    cancel: 'إلغاء',
    submit: 'إرسال',
    retry: 'حاول مرة أخرى',
    error: 'حدث خطأ',
    loading: 'جارٍ التحميل...',
    back: 'رجوع',
    next: 'التالي',
    confirm: 'تأكيد',
    delete: 'حذف',
    edit: 'تعديل',
    yes: 'نعم',
    no: 'لا',
  },
  language: {
    ar: 'العربية',
    en: 'English',
  },
  languageSwitcher: {
    toggle: 'تبديل اللغة',
  },
  nav: {
    home: 'الرئيسية',
    goals: 'الأهداف',
    habits: 'العادات',
    overview: 'النظرة العامة',
    settings: 'الإعدادات',
    more: 'المزيد',
  },
  auth: {
    signIn: 'تسجيل الدخول',
    signUp: 'إنشاء حساب',
    signOut: 'تسجيل الخروج',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    name: 'الاسم',
    welcome: 'مرحبًا بعودتك',
    accountCreated: 'تم إنشاء الحساب بنجاح',
    errors: {
      emailExists: 'هذا البريد الإلكتروني مسجل بالفعل',
      invalidCredentials: 'بيانات الدخول غير صحيحة',
      tokenInvalid: 'الجلسة غير صالحة، يرجى تسجيل الدخول مرة أخرى',
      tokenExpired: 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى',
      validationFailed: 'البيانات المُدخلة غير صحيحة',
    },
  },
  errors: {
    networkError: 'تعذّر الاتصال بالخادم',
    internalServer: 'حدث خطأ في الخادم',
    csrfDetected: 'طلب غير مصرّح به',
    routeNotFound: 'الصفحة غير موجودة',
    corsBlocked: 'مصدر الطلب غير مسموح به',
  },
  placeholder: {
    comingSoon: 'قريباً',
  },
  sidebar: {
    dailySummary: 'ملخص اليوم',
    done: 'منجز',
    pending: 'قيد الانتظار',
    focus: 'التركيز',
    score: 'النقاط',
    signOut: 'تسجيل الخروج',
  },
};

export default ar;
export type ArDict = typeof ar;
export type Dict = ArDict;