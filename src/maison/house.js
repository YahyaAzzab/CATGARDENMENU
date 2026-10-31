export const themes = [
    {
        id: 'maison',
        name: 'La maison',
        note: 'Chocolat, crème et or',
        line: 'Chocolat, crème et or — la maison toute l’année.',
    },
    {
        id: 'valentin',
        name: 'Saint-Valentin',
        note: 'Rose et cacao',
        line: 'Cœurs, rose poudré et cacao pour les amoureux.',
    },
    {
        id: 'ramadan',
        name: 'Ramadan',
        note: 'Nuit verte et or',
        line: 'Nuits vertes, lanternes et or après la rupture du jeûne.',
    },
    {
        id: 'ete',
        name: 'Été',
        note: 'Sable et abricot',
        line: 'Sable chaud, abricot et cacao clair des soirées d’été.',
    },
    {
        id: 'rentree',
        name: 'Rentrée',
        note: 'Encre et ambre',
        line: 'Encre, ambre et cacao neuf pour la rentrée.',
    },
    {
        id: 'noel',
        name: 'Noël',
        note: 'Sapin, crème et or',
        line: 'Sapin, crème et or — les coffrets de fin d’année.',
    },
];
export function isTheme(value) {
    return themes.some((theme) => theme.id === value);
}
export function themeById(id) {
    return themes.find((theme) => theme.id === id) ?? themes[0];
}
export const orderStatuses = [
    { id: 'nouvelle', name: 'Nouvelle' },
    { id: 'vue', name: 'Vue' },
    { id: 'remise', name: 'Remise' },
];
