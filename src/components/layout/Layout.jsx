import { Outlet } from 'react-router-dom'
import { TopMenuBar } from './TopMenuBar'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { StatusBar } from './StatusBar'
import { Toast } from '../shared/Toast'
import { useNavStore } from '../../store/navStore'

export function Layout() {
  const { activeMenu } = useNavStore()
  const showSidebar = activeMenu !== 'dashboard'

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100vh', overflow: 'hidden'
    }}>
      <TopMenuBar />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {showSidebar && <Sidebar />}
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
