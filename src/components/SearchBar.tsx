import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '../i18n/I18nContext';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  const { t } = useI18n();
  const [expanded, setExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (expanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [expanded]);

  const handleClose = () => {
    setExpanded(false);
    onChange('');
  };

  return (
    <div className="relative flex items-center justify-end mb-3">
      <AnimatePresence mode="wait">
        {expanded ? (
          <motion.div
            key="input"
            className="w-full flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2.5 shadow-sm border border-sage-muted/30"
            initial={{ width: 44, opacity: 0.5 }}
            animate={{ width: '100%', opacity: 1 }}
            exit={{ width: 44, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {/* Search icon */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-sage-dark)" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <line x1="16.5" y1="16.5" x2="21" y2="21" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="flex-1 bg-transparent outline-none text-[0.9rem] text-chocolate placeholder:text-chocolate-muted/50"
              style={{ fontFamily: 'var(--font-body)', fontSize: '16px' /* prevents iOS zoom */ }}
              aria-label={t.searchPlaceholder}
            />
            {value && (
              <button
                onClick={() => onChange('')}
                className="w-6 h-6 flex items-center justify-center rounded-full bg-chocolate-muted/10"
                aria-label="Clear"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-chocolate-muted)" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="18" y1="6" x2="6" y2="18" />
                </svg>
              </button>
            )}
            <button
              onClick={handleClose}
              className="text-[0.75rem] font-semibold text-sage-dark ml-1"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              ✕
            </button>
          </motion.div>
        ) : (
          <motion.button
            key="icon"
            onClick={() => setExpanded(true)}
            className="w-11 h-11 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-sm border border-sage-muted/30"
            whileTap={{ scale: 0.92 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            aria-label={t.searchPlaceholder}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-sage-dark)" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <line x1="16.5" y1="16.5" x2="21" y2="21" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
