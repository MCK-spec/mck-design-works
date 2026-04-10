import { useEffect, useState } from 'react';
import AdminLogin from './AdminLogin';
import AdminLayout from './AdminLayout';
import VisitLogs from './pages/VisitLogs';
import MessageManager from './pages/MessageManager';
import Dashboard from './pages/Dashboard';
import './admin.css';
import WorksManager from './pages/WorksManager';
import ProfileManager from './pages/ProfileManager';

type MenuKey = 'visit' | 'dashboard' | 'works' | 'message' | 'profile';

export default function AdminApp() {
  const [logged, setLogged] = useState(false);
  const [menu, setMenu] = useState<MenuKey>('visit');

  useEffect(() => {
    const is = sessionStorage.getItem('admin_logged') === 'true';
    setLogged(is);
  }, []);

  if (!logged) {
    return (
      <div className="admin-root">
        <AdminLogin onLoggedIn={() => setLogged(true)} />
      </div>
    );
  }

  return (
    <div className="admin-root">
      <AdminLayout onNavigate={(key: MenuKey) => setMenu(key)}>
        {menu === 'visit' && <VisitLogs />}
        {menu === 'dashboard' && <Dashboard />}
        {menu === 'works' && <WorksManager />}
        {menu === 'message' && <MessageManager />}
        {menu === 'profile' && <ProfileManager />}
      </AdminLayout>
    </div>
  );
}
