import { Outlet } from 'react-router-dom'
import { TopMenuBar } from './TopMenuBar'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { StatusBar } from './StatusBar'
import { Toast } from '../shared/Toast'
import { useNavStore } from '../../store/navStore'
import { useBreakpoint } from '../../hooks/useBreakpoint'

export function Layout() {
  const { activeMenu, sidebarOpen, setSidebarOpen } = useNavStore()
  const { isMobile } = useBreakpoint()
  const showSidebar = activeMenu !== 'dashboard'

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100vh', overflow: 'hidden'
    }}>
      <TopMenuBar />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
        {/* Mobile overlay backdrop */}
        {isMobile && sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 200,
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(1px)',
            }}
          />
        )}

        {/* Sidebar — always mounted on mobile (slides in/out), conditional on desktop */}
        {(showSidebar || isMobile) && <Sidebar />}

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Topbar />
          <div style={{ flex: 1, overflow: 'auto', background: 'var(--bg)' }}>
            <Outlet />
          </div>
        </div>
      </div>
      <StatusBar />
      <Toast />
    </div>
  )
}
