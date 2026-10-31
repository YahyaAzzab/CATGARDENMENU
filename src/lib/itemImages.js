import { useEffect, useState } from 'react';
const modules = import.meta.glob('../assets/items/*.jpg', {
    eager: true,
    import: 'default',
});
const byId = new Map();
for (const [path, url] of Object.entries(modules)) {
    const file = path.split('/').pop();
    if (!file)
        continue;
    byId.set(file.replace(/\.jpg$/, ''), url);
}
/**
 * The URL map is tiny. The photo itself is requested only when a card
 * near the screen asks for it.
 */
export function useItemImage(id, enabled) {
    const url = byId.get(id);
    const [shown, setShown] = useState(false);
    useEffect(() => {
        if (!enabled || !url)
            return;
        setShown(true);
    }, [enabled, url]);
    return shown ? url : undefined;
}
