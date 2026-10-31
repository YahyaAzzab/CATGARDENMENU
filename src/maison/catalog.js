import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { fetchCategories, setCategoryList } from './categoriesDb';
import { categories as defaultCategories } from './categories';
import { isTheme } from './house';
import { pastriesForShop, remoteIsVitrine } from './vitrine';
import { fetchPieces } from './piecesDb';
const CatalogContext = createContext({
    pieces: pastriesForShop([], { hasCategory: false, hasMoments: false, failed: true }),
    categories: defaultCategories,
    theme: 'maison',
    remote: false,
});
export function CatalogProvider({ children }) {
    const [pieces, setPieces] = useState(() => pastriesForShop([], { hasCategory: false, hasMoments: false, failed: true }));
    const [categories, setCategories] = useState(defaultCategories);
    const [theme, setTheme] = useState('maison');
    const [remote, setRemote] = useState(false);
    useEffect(() => {
        let cancel = false;
        const load = async () => {
            const client = supabase;
            const [pieceRes, categoryRes, houseRes] = await Promise.all([
                fetchPieces(),
                fetchCategories(),
                client
                    ? client.from('house').select('theme').eq('id', 'maison').maybeSingle()
                    : Promise.resolve({ data: null, error: null }),
            ]);
            if (cancel)
                return;
            setCategoryList(categoryRes.rows);
            setCategories(categoryRes.rows);
            const flags = {
                hasCategory: pieceRes.hasCategory,
                hasMoments: pieceRes.hasMoments,
                failed: Boolean(pieceRes.error),
            };
            setPieces(pastriesForShop(pieceRes.rows, flags));
            setRemote(!pieceRes.error && remoteIsVitrine(pieceRes.rows, pieceRes.hasCategory));
            const themeValue = houseRes.data?.theme;
            if (!houseRes.error && typeof themeValue === 'string' && isTheme(themeValue)) {
                setTheme(themeValue);
            }
        };
        void load();
        return () => {
            cancel = true;
        };
    }, []);
    const value = useMemo(() => ({ pieces, categories, theme, remote }), [pieces, categories, theme, remote]);
    return _jsx(CatalogContext.Provider, { value: value, children: children });
}
export function useCatalog() {
    return useContext(CatalogContext);
}
