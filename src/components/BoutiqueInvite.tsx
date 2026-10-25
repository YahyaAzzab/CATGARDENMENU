import { useI18n } from '../i18n/I18nContext';

export function BoutiqueInvite() {
  const { t } = useI18n();

  return (
    <a href="/" className="boutique-invite">
      <span className="invite-mark" aria-hidden="true">Bennis</span>
      <span>
        <strong>{t.boutiqueTitle}</strong>
        <em>{t.boutiqueNote}</em>
      </span>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </a>
  );
}
