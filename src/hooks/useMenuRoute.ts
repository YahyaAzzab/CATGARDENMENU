import { useCallback, useEffect, useRef, useState } from 'react';
import { FAMILY_IDS, type FamilyId } from '../data/families';

function readTable(): string | null {
  return new URLSearchParams(window.location.search).get('table');
}

function readFamily(): FamilyId | null {
  const raw = new URLSearchParams(window.location.search).get('family');
  if (raw && (FAMILY_IDS as string[]).includes(raw)) return raw as FamilyId;
  return null;
}

function buildUrl(family: FamilyId | null): string {
  const params = new URLSearchParams();
  if (family) params.set('family', family);
  const table = readTable();
  if (table) params.set('table', table);
  const qs = params.toString();
  return qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
}

export function useMenuRoute() {
  const [familyId, setFamilyId] = useState<FamilyId | null>(() =>
    typeof window === 'undefined' ? null : readFamily()
  );
  const [tableNumber] = useState<string | null>(() =>
    typeof window === 'undefined' ? null : readTable()
  );
  const homeScrollRef = useRef(0);

  useEffect(() => {
    history.scrollRestoration = 'manual';
    const onPop = () => {
      const next = readFamily();
      setFamilyId(next);
      if (!next) {
        requestAnimationFrame(() => {
          window.scrollTo({ top: homeScrollRef.current, behavior: 'instant' });
        });
      } else {
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const openFamily = useCallback((id: FamilyId) => {
    homeScrollRef.current = window.scrollY;
    history.pushState({ family: id, fromHome: true }, '', buildUrl(id));
    setFamilyId(id);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const goHome = useCallback(() => {
    const state = history.state as { fromHome?: boolean } | null;
    if (state?.fromHome && window.history.length > 1) {
      history.back();
      return;
    }
    history.replaceState({ family: null }, '', buildUrl(null));
    setFamilyId(null);
    requestAnimationFrame(() => {
      window.scrollTo({ top: homeScrollRef.current, behavior: 'instant' });
    });
  }, []);

  /** Swipe between families: replace URL so Back still returns to Home. */
  const replaceFamily = useCallback((id: FamilyId) => {
    history.replaceState({ family: id, fromHome: true }, '', buildUrl(id));
    setFamilyId(id);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return { familyId, tableNumber, openFamily, goHome, replaceFamily };
}
