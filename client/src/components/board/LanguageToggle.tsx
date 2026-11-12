import { cn } from '@client/src/lib/utils';
import { useI18n } from '@client/src/i18n/I18nContext';
import type { Language } from '@client/src/i18n/dictionary';

const options: { value: Language; label: string }[] = [
  { value: 'vi', label: 'VN' },
  { value: 'en', label: 'EN' },
];

const LanguageToggle = () => {
  const { lang, setLang, t } = useI18n();

  return (
    <div
      role="group"
      aria-label={t('languageAria')}
      className="inline-flex items-center gap-1 rounded-full border border-border bg-card p-1 shadow-sm"
    >
      {options.map((option) => {
        const active = option.value === lang;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => setLang(option.value)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12.5px] font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
              active
                ? 'bg-primary text-white shadow-sm'
                : 'text-muted-foreground hover:bg-primary/10 hover:text-primary',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};

export default LanguageToggle;
