import { jsx as _jsx } from "react/jsx-runtime";
import { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
function normalizePath(path) {
    if (path.length > 1 && path.endsWith('/'))
        return path.replace(/\/+$/, '');
    return path;
}
const path = normalizePath(window.location.pathname);
if (path === '/maison') {
    history.replaceState(null, '', `/${window.location.search}${window.location.hash}`);
}
const menu = path === '/catgardenmenu';
const admin = path === '/admin';
const Admin = lazy(() => import('./admin/AdminApp.tsx'));
const Menu = lazy(() => import('./App.tsx'));
const Maison = lazy(() => import('./maison/MaisonApp.tsx'));
const Root = admin ? Admin : menu ? Menu : Maison;
createRoot(document.getElementById('root')).render(_jsx(StrictMode, { children: _jsx(Suspense, { fallback: null, children: _jsx(Root, {}) }) }));
