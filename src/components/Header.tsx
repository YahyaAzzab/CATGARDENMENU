import { useI18n } from '../i18n/I18nContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { PawPrint } from './Icons';
import { BrandLogo } from './BrandLogo';

export function Header({
  onLogoClick,
  onOpenRules,
  showMark,
}: {
  onLogoClick?: () => void;
  onOpenRules: () => void;
  showMark: boolean;
}) {
  const { t } = useI18n();
  const space = t.appTitle.indexOf(' ');
  const cats = space === -1 ? t.appTitle : t.appTitle.slice(0, space + 1);
  const garden = space === -1 ? '' : t.appTitle.slice(space + 1);

  return (
    <header className="sticky top-0 z-40 bg-cream/90 backdrop-blur-md border-b border-sage-muted/15">
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{ paddingTop: 'max(env(safe-area-inset-top), 10px)' }}
      >
        {/* Logo + name */}
        <button
          type="button"
          className="flex min-h-[44px] items-center gap-2 text-start"
          onClick={onLogoClick}
        >
          <span data-brand-slot className="flex h-10 w-10 shrink-0">
            {showMark && <BrandLogo className="h-full w-full" />}
          </span>
          <div>
            <h1
              className="text-[1.12rem] italic leading-none tracking-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              <span className="text-chocolate">{cats}</span>
              <span className="text-sage-dark">{garden}</span>
            </h1>
            <div className="flex items-center gap-1 mt-0.5">
              <PawPrint size={5} className="text-peach-muted" />
              <PawPrint size={4} className="text-sage-muted" />
              <PawPrint size={5} className="text-peach-muted" />
            </div>
          </div>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenRules}
            aria-label={t.rulesOpen}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-peach-light bg-peach-muted text-peach-dark"
          >
            <PawPrint size={18} />
          </button>
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
