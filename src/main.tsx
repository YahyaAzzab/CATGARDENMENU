import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

function normalizePath(path: string) {
  if (path.length > 1 && path.endsWith('/')) return path.replace(/\/+$/, '')
  return path
}

const path = normalizePath(window.location.pathname)
if (path === '/maison') {
  history.replaceState(null, '', `/${window.location.search}${window.location.hash}`)
}

const menu = path === '/catgardenmenu'
const admin = path === '/admin'

const Root = lazy(() =>
  admin ? import('./admin/AdminApp.tsx') : menu ? import('./App.tsx') : import('./maison/MaisonApp.tsx'),
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={null}>
      <Root />
    </Suspense>
  </StrictMode>,
)
