export type Locale = "ar" | "en";
export const DEFAULT_LOCALE: Locale = "ar";
export const SUPPORTED_LOCALES: readonly Locale[] = ["ar", "en"] as const;

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

type Leaves<T, Prev extends string = ""> = T extends string
  ? Prev
  : {
      [K in keyof T & string]: Leaves<T[K], `${Prev}${Prev extends "" ? "" : "."}${K}`>;
    }[keyof T & string];

export type Messages = typeof messages.ar;
export type MessageKey = Leaves<Messages>;

export const messages = {
  ar: {
    common: {
      appName: "هدف",
      tagline: "إنتاجية قائمة على الدافع المرن",
      back: "رجوع",
      save: "حفظ",
      saving: "جارٍ الحفظ…",
      next: "التالي",
      cancel: "إلغاء",
      delete: "حذف",
      retry: "حاول مرة أخرى",
      close: "إغلاق",
      optional: "(اختياري)",
      yes: "نعم",
      no: "لا",
      gotIt: "فهمت",
      notNow: "ليس الآن",
      localeSwitchLabel: "English",
      localeSwitchAria: "تغيير اللغة إلى الإنجليزية",
      localeToggleToEn: "EN",
      localeToggleToAr: "ع",
    },
    shell: {
      home: "الرئيسية",
      goals: "الأهداف",
      habits: "العادات",
      overview: "نظرة عامة",
      settings: "الإعدادات",
    },
    home: {
      title: "صباح الخير",
      greetingHasTasks: "صباح الخير. لديك {tasks} مهمة و {habits} عادة اليوم.",
      greetingOnlyHabits: "صباح الخير. {habits} عادة بانتظارك. اقترح إضافة مهمة؟",
      greetingNewUser: "ابدأ بهدف واحد صغير اليوم.",
      greetingNoGoals: "ابدأ بهدف واحد.",
      yesterdaysSummary: "ملخص أمس",
      todaysTasks: "مهام اليوم",
      todaysHabits: "عادات اليوم",
      habitsMvdHint: "يوم خفيف — تم تفعيل الحد الأدنى تلقائيًا.",
      habitsMvdBadge: "الحد الأدنى",
      backlogRibbon: "{count} مهام من أيام سابقة",
      backlogEmpty: "لا مهام متأخرة.",
      dailyProgress: "تقدّم اليوم",
      dailyProgressAccent: "أنجزت {done} من {total} — إنجاز حقيقي",
      noTasksToday: "لا مهام اليوم. هدفك يحتاج مهمة!",
      addTask: "أضف مهمة",
      goodEnoughDay: "يوم جيد بما فيه الكفاية",
      contributionPulsePrefix: "+",
      contributionPulseSuffix: "نحو",
      progressPercentUnit: "٪",
    },
    goals: {
      title: "الأهداف",
      subtitle: "أهدافك النشطة على مدى ١٢ أسبوعًا. اضغط على هدف لفتح معالمه ومهامه.",
      newGoal: "هدف جديد",
      emptyTitle: "لا أهداف بعد",
      emptyBody: "ابدأ بهدف واحد على مدى ١٢ أسبوعًا. ثلاث خطوات قصيرة — سمّه، اضبط الدورة، وقسّمه إلى بعض المعالم.",
      emptyCta: "أنشئ هدفك الأول",
      cycleLabel: "دورة ١٢ أسبوعًا",
      weeksUnit: "أسبوع",
      milestonesLabel: "معالم",
      milestonesCount: "{completed} من {total}",
      categoryLabel: "الفئة",
      cycleDatesSeparator: "←",
      progressLabel: "التقدّم",
      healthAriaPrefix: "الحالة:",
      ariaOpenGoal: "افتح الهدف: {title}",
      twelveWeekHeading: "أين أنت في الـ ١٢ أسبوعًا",
      executionScoreHeading: "نتيجة التنفيذ هذا الأسبوع",
      executionScoreLabel: "النتيجة",
      executionScoreUnit: "٪",
      executionScoreStrong: "أسبوع قوي — استمر على هذا الإيقاع.",
      executionScoreSteady: "أسبوع ثابت. خطوة صغيرة اليوم تكفي.",
      executionScoreGentle: "أسبوع متأنٍ. احمِ الإيقاع ولا تضغط على نفسك.",
      executionScoreNoGoals: "أضف هدفًا واحدًا لتبدأ قياس تقدمك.",
    },
    goalHealth: {
      at_risk: "في خطر",
      behind: "متأخر",
      needs_attention: "يحتاج اهتمام",
      on_track: "على المسار",
    },
    goalCategory: {
      education_work: "تعليم / عمل",
      family: "عائلة",
      health: "صحة",
      religion_spirituality: "روحانيات",
      other: "أخرى",
    },
    newGoal: {
      title: "هدف جديد",
      subtitle: "ثلاث خطوات قصيرة. اثنا عشر أسبوعًا.",
      stepHeadingWhat: "ما هو الهدف وكيف ستقيسه؟",
      stepHeadingWhen: "متى سيبدأ ولماذا يهم؟",
      stepHeadingMilestones: "قسّمه إلى معالم",
      stepHeadingWhatHint: "نتيجة محددة أفضل من نية غامضة. القياس هو ما يفصل الأهداف عن الأمنيات.",
      stepHeadingWhenHint: "الدورة ١٢ أسبوعًا بالضبط. تاريخ النهاية يُحسب تلقائيًا من البداية.",
      stepHeadingMilestonesHint: "اختياري في الإصدار الأول — أضف نقطة أو نقطتين واضحتين إذا كانت في ذهنك. يمكنك إضافتها لاحقًا أيضًا.",
      stepOf: "الخطوة {current} من {total}",
      back: "رجوع",
      next: "التالي",
      save: "احفظ الهدف",
      saving: "جارٍ الحفظ…",
      fields: {
        title: "عنوان الهدف",
        titlePlaceholder: "مثال: قدّم مسودة الرسالة",
        description: "الوصف",
        descriptionPlaceholder: "سطر أو سطران من السياق — لماذا هذا، لمن يخدم",
        measure: "كيف ستقيس النجاح؟",
        measurePlaceholder: "مثال: ملف PDF نهائي قُدّم وحصل على موافقة المشرف",
        relevance: "لماذا يهمك هذا؟",
        relevancePlaceholder: "بضعة أسطر صادقة — هذا ما سيحملك في الأسابيع الصعبة",
        cycleStart: "بداية الدورة",
        cycleEnd: "نهاية الدورة",
        cycleEndHint: "(١٢ أسبوعًا)",
        customCategory: "اسم فئة مخصصة",
        customCategoryPlaceholder: "مثال: مشروع جانبي",
      },
      successToast: "تم حفظ الهدف (تجريبي). افتح الكونسول لرؤية البيانات.",
      categoryLegend: "اختر فئة",
      milestonePlaceholder: "معلم {n}",
      addMilestone: "أضف معلمًا",
      noMilestones: "لا معالم بعد — أضف واحدًا عندما يكون لديك نقطة تحقق واضحة.",
      moveUpAria: "نقل المعلم {n} للأعلى",
      moveDownAria: "نقل المعلم {n} للأسفل",
      removeAria: "حذف المعلم {n}",
    },
    readinessDialog: {
      title: "كلمة سريعة قبل أن نبدأ",
      body: "الهدف هو نتيجة يمكنك قياسها في نهاية الدورة. العادة هي سلوك تكرره في معظم الأيام.",
      goalExampleTitle: "هدف · «قدّم مسودة الرسالة في الأسبوع ١٢»",
      goalExampleHint: "خط نهاية واضح، محاولة واحدة — مناسب لدورة ١٢ أسبوعًا.",
      habitExampleTitle: "عادة · «اقرأ ٢٠ صفحة يوميًا»",
      habitExampleHint: "تتكرر إلى ما لا نهاية — الأفضل تتبّعها كعادة يومية.",
      limitNote: "يمكنك إدارة حتى ٥ أهداف نشطة في الوقت نفسه. هذا هو هدفك الأول.",
      primary: "فهمت — ابدأ",
      secondary: "ليس الآن",
    },
    goalDetail: {
      backToGoals: "الرجوع إلى الأهداف",
      notFoundTitle: "الهدف غير موجود",
      notFoundBody: "هذا الهدف غير موجود أو تم حذفه.",
      notFoundCta: "الرجوع إلى الأهداف",
      relevanceCard: "لماذا يهم",
      measureCard: "كيف ستعرف أنه نجح",
      notesCard: "ملاحظات",
      linkedTasksTitle: "المهام المرتبطة",
      linkedTasksPlaceholder: "ستظهر المهام هنا في المرحلة الثانية. حاليًا هذا عنصر نائب.",
      milestonesLabel: "معالم",
      milestonesCount: "{completed} من {total}",
      emptyMilestones: "لا معالم بعد — هذا الهدف ليس له نقاط تحقق.",
      reorderAria: "أعد ترتيب المعلم: {title}",
      markCompletedAria: "وسم «{title}» كمكتمل",
      markIncompleteAria: "وسم «{title}» كغير مكتمل",
      completeBadge: "مكتمل",
      ariaDateRange: "من {start} إلى {end}",
    },
    commonWeekBar: {
      weekOf: "الأسبوع {current} من {total}",
      complete: "مكتمل",
    },
    errors: {
      generic: "حدث خطأ ما. حاول مرة أخرى.",
      saveFailed: "فشل الحفظ. حاول مرة أخرى.",
    },
  },
  en: {
    common: {
      appName: "Hadaf",
      tagline: "Productivity built around Elastic Motivation",
      back: "Back",
      save: "Save",
      saving: "Saving…",
      next: "Next",
      cancel: "Cancel",
      delete: "Delete",
      retry: "Retry",
      close: "Close",
      optional: "(optional)",
      yes: "Yes",
      no: "No",
      gotIt: "Got it",
      notNow: "Not now",
      localeSwitchLabel: "العربية",
      localeSwitchAria: "Switch language to Arabic",
      localeToggleToEn: "EN",
      localeToggleToAr: "AR",
    },
    shell: {
      home: "Home",
      goals: "Goals",
      habits: "Habits",
      overview: "Overview",
      settings: "Settings",
    },
    home: {
      title: "Good morning",
      greetingHasTasks: "Good morning. You have {tasks} tasks and {habits} habits today.",
      greetingOnlyHabits: "Good morning. {habits} habits are waiting. Add a task?",
      greetingNewUser: "Start with one small goal today.",
      greetingNoGoals: "Start with one goal.",
      yesterdaysSummary: "Yesterday's summary",
      todaysTasks: "Today's tasks",
      todaysHabits: "Today's habits",
      habitsMvdHint: "Light day — minimum viable version auto-enabled.",
      habitsMvdBadge: "MVD",
      backlogRibbon: "{count} tasks from previous days",
      backlogEmpty: "No carryover tasks.",
      dailyProgress: "Today's progress",
      dailyProgressAccent: "You completed {done} of {total} — real progress",
      noTasksToday: "No tasks today. Your goal needs one!",
      addTask: "Add a task",
      goodEnoughDay: "Good enough day",
      contributionPulsePrefix: "+",
      contributionPulseSuffix: "toward",
      progressPercentUnit: "%",
    },
    goals: {
      title: "Goals",
      subtitle:
        "Your active 12-week goals. Tap one to open its milestones and tasks.",
      newGoal: "New goal",
      emptyTitle: "No goals yet",
      emptyBody:
        "Start with one 12-week goal. Three short steps — name it, set the cycle, and break it into a few milestones.",
      emptyCta: "Create your first goal",
      cycleLabel: "12-week cycle",
      weeksUnit: "weeks",
      milestonesLabel: "Milestones",
      milestonesCount: "{completed} of {total}",
      categoryLabel: "Category",
      cycleDatesSeparator: "→",
      progressLabel: "Progress",
      healthAriaPrefix: "Health:",
      ariaOpenGoal: "Open goal: {title}",
      twelveWeekHeading: "Where you are in the 12 weeks",
      executionScoreHeading: "This week's execution score",
      executionScoreLabel: "Score",
      executionScoreUnit: "%",
      executionScoreStrong: "Strong week — keep this rhythm.",
      executionScoreSteady: "Steady week. One small step today is enough.",
      executionScoreGentle: "Gentle week. Protect the rhythm; don't push.",
      executionScoreNoGoals: "Add one goal to start measuring progress.",
    },
    goalHealth: {
      at_risk: "At risk",
      behind: "Behind",
      needs_attention: "Needs attention",
      on_track: "On track",
    },
    goalCategory: {
      education_work: "Education / Work",
      family: "Family",
      health: "Health",
      religion_spirituality: "Spirituality",
      other: "Other",
    },
    newGoal: {
      title: "New goal",
      subtitle: "Three short steps. Twelve weeks.",
      stepHeadingWhat: "What is the goal, and how will you measure it?",
      stepHeadingWhen: "When will this run, and why does it matter?",
      stepHeadingMilestones: "Break it into milestones",
      stepHeadingWhatHint: "A specific outcome beats a vague intention. Measurement is what separates goals from wishes.",
      stepHeadingWhenHint: "The cycle is exactly 12 weeks. The end date follows the start automatically.",
      stepHeadingMilestonesHint: "Optional in the MVP — add one or two clear checkpoints if they already exist in your head. You can also add them later.",
      stepOf: "Step {current} of {total}",
      back: "Back",
      next: "Next",
      save: "Save goal",
      saving: "Saving…",
      fields: {
        title: "Goal title",
        titlePlaceholder: "e.g., Submit my thesis draft",
        description: "Description",
        descriptionPlaceholder:
          "A line or two of context — why this, who it serves",
        measure: "How will you measure success?",
        measurePlaceholder:
          "e.g., Final PDF submitted and approved by supervisor",
        relevance: "Why does this matter to you?",
        relevancePlaceholder:
          "A few honest sentences — this is what carries you on the hard weeks.",
        cycleStart: "Cycle start",
        cycleEnd: "Cycle end",
        cycleEndHint: "(12 weeks)",
        customCategory: "Custom category name",
        customCategoryPlaceholder: "e.g., Side project",
      },
      successToast: "Goal saved (mock). Open the console to see the payload.",
      categoryLegend: "Choose a category",
      milestonePlaceholder: "Milestone {n}",
      addMilestone: "Add milestone",
      noMilestones:
        "No milestones yet — add one when you have a clear checkpoint.",
      moveUpAria: "Move milestone {n} up",
      moveDownAria: "Move milestone {n} down",
      removeAria: "Remove milestone {n}",
    },
    readinessDialog: {
      title: "A quick word first",
      body: "A goal is an outcome you can measure at the end of a cycle. A habit is a behaviour you repeat on most days.",
      goalExampleTitle: 'Goal · "Submit my thesis draft by week 12"',
      goalExampleHint: "Clear finish line, one shot — good for a 12-week cycle.",
      habitExampleTitle: 'Habit · "Read 20 pages a day"',
      habitExampleHint: "Repeats indefinitely — better tracked as a daily habit.",
      limitNote: "You can keep up to 5 active goals at a time. This is your first one.",
      primary: "Got it — start",
      secondary: "Not now",
    },
    goalDetail: {
      backToGoals: "Back to goals",
      notFoundTitle: "Goal not found",
      notFoundBody: "That goal doesn't exist or was deleted.",
      notFoundCta: "Back to goals",
      relevanceCard: "Why it matters",
      measureCard: "How you'll know it worked",
      notesCard: "Notes",
      linkedTasksTitle: "Linked tasks",
      linkedTasksPlaceholder:
        "Tasks land here in Epic E2. For now, this is a placeholder.",
      milestonesLabel: "Milestones",
      milestonesCount: "{completed} of {total}",
      emptyMilestones: "No milestones yet — this goal has no checkpoints.",
      reorderAria: "Reorder milestone: {title}",
      markCompletedAria: 'Mark "{title}" as completed',
      markIncompleteAria: 'Mark "{title}" as not completed',
      completeBadge: "Complete",
      ariaDateRange: "From {start} to {end}",
    },
    commonWeekBar: {
      weekOf: "Week {current} of {total}",
      complete: "Complete",
    },
    errors: {
      generic: "Something went wrong. Please try again.",
      saveFailed: "Save failed. Please try again.",
    },
  },
} as const;

function interpolate(
  template: string,
  values?: Record<string, string | number>,
): string {
  if (!values) return template;
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = values[key];
    return value === undefined ? `{${key}}` : String(value);
  });
}

export function createT(locale: Locale) {
  const dict = messages[locale];
  const isRtl = locale === "ar";
  const lookup = (path: string): string => {
    const parts = path.split(".");
    let cursor: unknown = dict;
    for (const part of parts) {
      if (cursor && typeof cursor === "object" && part in (cursor as Record<string, unknown>)) {
        cursor = (cursor as Record<string, unknown>)[part];
      } else {
        return path;
      }
    }
    return typeof cursor === "string" ? cursor : path;
  };
  return {
    locale,
    isRtl,
    dir: isRtl ? ("rtl" as const) : ("ltr" as const),
    t: (key: MessageKey, values?: Record<string, string | number>): string => {
      return interpolate(lookup(key), values);
    },
    raw: dict,
  };
}

export type Translator = ReturnType<typeof createT>;