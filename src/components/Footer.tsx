import { motion } from 'framer-motion';
import { useI18n } from '../i18n/I18nContext';
import { config } from '../config';
import { PawPrint, SleepingCat } from './Icons';

export function Footer() {
  const { t } = useI18n();

  const links = [
    {
      label: t.followUs,
      href: config.instagramUrl,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" />
          <circle cx="12" cy="12" r="5" />
          <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      ),
    },
    {
      label: t.getDirections,
      href: config.googleMapsUrl,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
          <circle cx="12" cy="9" r="2.5" />
        </svg>
      ),
    },
    {
      label: t.leaveReview,
      href: config.googleReviewsUrl,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
      ),
    },
    {
      label: t.contactWhatsApp,
      href: `https://wa.me/${config.whatsappNumber}`,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.555 4.12 1.524 5.855L0 24l6.335-1.652A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.82c-1.89 0-3.69-.504-5.274-1.454l-.378-.224-3.927 1.027 1.05-3.834-.248-.394A9.78 9.78 0 012.18 12c0-5.422 4.398-9.82 9.82-9.82 5.422 0 9.82 4.398 9.82 9.82 0 5.422-4.398 9.82-9.82 9.82z"/>
        </svg>
      ),
    },
  ];

  return (
    <footer className="mt-8 px-4 pb-8" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 32px)' }}>
      {/* Social links */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        {links.map((link) => (
          <motion.a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl bg-white/50 border border-sage-muted/20 text-chocolate-muted hover:text-sage-dark hover:border-sage-muted/40 transition-colors"
            whileTap={{ scale: 0.95 }}
          >
            {link.icon}
            <span className="text-[0.94rem] font-semibold text-center leading-tight" style={{ fontFamily: 'var(--font-body)' }}>
              {link.label}
            </span>
          </motion.a>
        ))}
      </div>

      {/* Sleeping cat + credit */}
      <div className="flex flex-col items-center">
        <SleepingCat size={55} className="text-sage-muted/30 mb-2" />
        <p className="text-[0.94rem] text-chocolate-muted/70 text-center mb-0.5">
          Cat's Garden · Fès, Maroc
        </p>
        <div className="flex gap-1 mb-2">
          <PawPrint size={6} className="text-peach-muted/50" />
          <PawPrint size={5} className="text-sage-muted/50" />
          <PawPrint size={6} className="text-peach-muted/50" />
        </div>
        <p className="text-[0.94rem] text-chocolate-muted/70 mt-1">
          Créé par l'équipe{' '}
          <a
            href="https://bitaqa-project.vercel.app/fr"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-sage-dark/50 hover:text-sage-dark transition-colors underline underline-offset-2"
          >
            Bitaqa
          </a>
        </p>
      </div>
    </footer>
  );
}
