let familyModule = null;
let sheetModule = null;
let familyPromise = null;
let sheetPromise = null;
function familyTask() {
    familyPromise ??= import('../components/FamilyView').then((mod) => {
        familyModule = mod;
        return mod;
    });
    return familyPromise;
}
function sheetTask() {
    sheetPromise ??= import('../components/ProductBottomSheet').then((mod) => {
        sheetModule = mod;
        return mod;
    });
    return sheetPromise;
}
/** Family page and product sheet, after the home screen has painted. */
export function prefetchMenuScreens() {
    void familyTask();
    void sheetTask();
}
export function getFamilyView() {
    return familyModule?.FamilyView ?? null;
}
export function loadFamilyView() {
    return familyTask().then((mod) => mod.FamilyView);
}
export function getProductSheet() {
    return sheetModule?.ProductBottomSheet ?? null;
}
export function loadProductSheet() {
    return sheetTask().then((mod) => mod.ProductBottomSheet);
}
