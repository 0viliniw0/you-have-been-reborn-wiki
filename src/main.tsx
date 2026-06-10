import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import './shared/lib/i18n'
import { MainLayout } from './widgets/layout/ui/MainLayout'

// Lazy loaded pages
import Home from './pages/Home'
import EntityDetail from './pages/EntityDetail'
import CategoryPage from './pages/CategoryPage'
import AdminPanel from './pages/AdminPanel'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/:category" element={<CategoryPage />} />
            <Route path="/:category/:slug" element={<EntityDetail />} />
            {import.meta.env.DEV && <Route path="/admin" element={<AdminPanel />} />}
          </Routes>
        </MainLayout>
      </HashRouter>
    </QueryClientProvider>
  </StrictMode>,
)
