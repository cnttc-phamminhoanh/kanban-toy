import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { useI18n } from '@client/src/i18n/I18nContext';

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const { t } = useI18n();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      aria-label={t('themeToggleAria')}
      aria-pressed={isDark}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="flex size-9 items-center justify-center rounded-full border border-border bg-card text-primary shadow-sm transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
    >
      {isDark ? <Sun className="size-5" aria-hidden /> : <Moon className="size-5" aria-hidden />}
    </button>
  );
};

export default ThemeToggle;
