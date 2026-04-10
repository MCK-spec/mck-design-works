import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

type MenuKey = 'visit' | 'dashboard' | 'works' | 'message' | 'profile';

export default function AdminLayout({ children, onNavigate }: { children: React.ReactNode; onNavigate: (key: MenuKey) => void }) {
  const [isMobile, setIsMobile] = useState(false);
  const [showChange, setShowChange] = useState(false);
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [error, setError] = useState('');
  const lastLogin = localStorage.getItem('mck_last_login');
  const lastDevice = localStorage.getItem('mck_last_login_device');
  const lastRes = localStorage.getItem('mck_last_login_resolution');
  const envPass = import.meta.env.VITE_ADMIN_PASS || 'admin123';
  const currentStoredPass = localStorage.getItem('mck_admin_pass') || envPass;

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 768);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const menuBtn = (label: string, key: MenuKey) => (
    <button onClick={() => onNavigate(key)} style={{ background: 'transparent', color: '#fff', border: 'none', padding: '10px 12px', textAlign: 'left', cursor: 'pointer', width: '100%' }}>
      {label}
    </button>
  );

  const logout = () => {
    sessionStorage.removeItem('admin_logged');
    location.reload();
  };

  const submitChange = () => {
    setError('');
    if (oldPass !== currentStoredPass) {
      setError('旧密码错误');
      return;
    }
    if (newPass.length < 6) {
      setError('密码不能少于 6 位');
      return;
    }
    if (newPass !== confirmPass) {
      setError('两次密码不一致');
      return;
    }
    localStorage.setItem('mck_admin_pass', newPass);
    setError('密码修改成功，请重新登录');
    setTimeout(() => {
      logout();
    }, 3000);
  };

  const modal = showChange && createPortal(
    <div className="admin-modal-root" style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999 }}>
      <div onClick={() => setShowChange(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }}></div>
      <div style={{ position: 'relative', background: '#141414', border: '1px solid #222', borderRadius: 12, padding: 40, width: isMobile ? '90vw' : 400, color: '#fff', boxShadow: '0 8px 24px rgba(0,0,0,0.45)' }}>
        <button onClick={() => setShowChange(false)} style={{ position: 'absolute', right: 12, top: 8, background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>✕</button>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>修改登录密码</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input type="password" placeholder="旧密码" value={oldPass} onChange={(e) => setOldPass(e.target.value)} style={{ background: '#0f0f0f', color: '#fff', border: '1px solid #2a2a2a', padding: '10px 12px', borderRadius: 8 }} />
          <input type="password" placeholder="新密码" value={newPass} onChange={(e) => setNewPass(e.target.value)} style={{ background: '#0f0f0f', color: '#fff', border: '1px solid #2a2a2a', padding: '10px 12px', borderRadius: 8 }} />
          <input type="password" placeholder="确认新密码" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} style={{ background: '#0f0f0f', color: '#fff', border: '1px solid #2a2a2a', padding: '10px 12px', borderRadius: 8 }} />
          {error && <div style={{ color: error.includes('成功') ? '#00BFA5' : '#ff6b6b' }}>{error}</div>}
          <button onClick={submitChange} style={{ background: '#00BFA5', color: '#000', border: 'none', borderRadius: 8, height: 44, cursor: 'pointer' }}>确认修改</button>
        </div>
      </div>
    </div>,
    document.body
  );

  if (isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#141414', color: '#fff' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 16, background: '#0f0f0f', position: 'sticky', top: 0 }}>
          <span style={{ color: '#00BFA5', letterSpacing: 2 }}>MCK Admin</span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            {menuBtn('访问记录', 'visit')}
            {menuBtn('数据概览', 'dashboard')}
            {menuBtn('作品管理', 'works')}
            {menuBtn('消息管理', 'message')}
            {menuBtn('个人信息', 'profile')}
            <button onClick={() => setShowChange(true)} style={{ background: 'transparent', color: '#aaa', border: 'none', padding: '10px 12px', cursor: 'pointer' }}>修改密码</button>
            <button onClick={logout} style={{ background: 'transparent', color: '#aaa', border: 'none', padding: '10px 12px', cursor: 'pointer' }}>退出登录</button>
          </div>
        </div>
        <div style={{ padding: 24 }}>
          {children}
          {modal}
        </div>
        <div style={{ marginTop: 'auto', padding: 16, background: '#0f0f0f', color: '#fff' }}>
          <div style={{ color: '#666', fontSize: 11 }}>上次登录</div>
          <div style={{ fontSize: 12 }}>{lastLogin || '这是你的首次登录'}</div>
          {lastLogin && <div style={{ color: '#555', fontSize: 11 }}>{lastDevice || ''} · {lastRes || ''}</div>}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#141414', color: '#fff' }}>
      <aside style={{ width: 220, background: '#0f0f0f', padding: 16 }}>
        <div style={{ color: '#fff', marginBottom: 16 }}>MCK Admin</div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {menuBtn('访问记录', 'visit')}
          {menuBtn('数据概览', 'dashboard')}
          {menuBtn('作品管理', 'works')}
          {menuBtn('消息管理', 'message')}
          {menuBtn('个人信息', 'profile')}
        </nav>
        <div style={{ marginTop: 'auto', paddingTop: 16 }}>
          <div style={{ color: '#666', fontSize: 11 }}>上次登录</div>
          <div style={{ fontSize: 12 }}>{lastLogin || '这是你的首次登录'}</div>
          {lastLogin && <div style={{ color: '#555', fontSize: 11 }}>{lastDevice || ''} · {lastRes || ''}</div>}
        </div>
      </aside>
      <main style={{ flex: 1, padding: 32, background: '#141414' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16, gap: 12 }}>
          <button onClick={() => setShowChange(true)} style={{ background: 'transparent', color: '#aaa', border: 'none', padding: '8px 10px', cursor: 'pointer' }}>修改密码</button>
          <button onClick={logout} style={{ background: 'transparent', color: '#aaa', border: 'none', padding: '8px 10px', cursor: 'pointer' }}>退出登录</button>
        </div>
        {children}
        {modal}
      </main>
    </div>
  );
}
