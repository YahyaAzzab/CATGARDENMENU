import { useI18n } from '../i18n/I18nContext';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  const { t } = useI18n();

  return (
    <div className="relative mb-1 flex items-center gap-2 rounded-full border border-sage-muted/30 bg-white/90 px-4 py-2.5 shadow-sm">
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--color-sage-dark)"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="7" />
        <line x1="16.5" y1="16.5" x2="21" y2="21" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t.searchPlaceholder}
        className="min-h-[28px] flex-1 bg-transparent text-[0.94rem] text-chocolate outline-none placeholder:text-chocolate-muted/50"
        style={{ fontFamily: 'var(--font-body)', fontSize: '16px' }}
        aria-label={t.searchPlaceholder}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="flex h-11 w-11 items-center justify-center rounded-full"
          aria-label={t.closeLabel}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-chocolate-muted)" strokeWidth="2.5" strokeLinecap="round">
            <line x1="6" y1="6" x2="18" y2="18" />
            <line x1="18" y1="6" x2="6" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
}
