import { useI18n } from '../i18n/I18nContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Whiskers, PawPrint } from './Icons';

export function Header() {
  const { t } = useI18n();

  return (
    <header className="sticky top-0 z-40 bg-cream/90 backdrop-blur-md border-b border-sage-muted/15">
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{ paddingTop: 'max(env(safe-area-inset-top), 10px)' }}
      >
        {/* Logo + name */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-sage-muted/20 flex items-center justify-center">
            <Whiskers size={20} className="text-sage-dark" />
          </div>
          <div>
            <h1
              className="text-[1rem] font-bold leading-none text-chocolate"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {t.appTitle}
            </h1>
            <div className="flex items-center gap-1 mt-0.5">
              <PawPrint size={5} className="text-peach-muted" />
              <PawPrint size={4} className="text-sage-muted" />
              <PawPrint size={5} className="text-peach-muted" />
            </div>
          </div>
        </div>

        {/* Language switcher */}
        <LanguageSwitcher />
      </div>
    </header>
  );
}
