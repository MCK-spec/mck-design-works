import { useState } from 'react';

export default function AdminLogin({ onLoggedIn }: { onLoggedIn: () => void }) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const adminUser = import.meta.env.VITE_ADMIN_USER || 'admin';
  const adminPassEnv = import.meta.env.VITE_ADMIN_PASS || 'admin123';
  const currentPass = localStorage.getItem('mck_admin_pass') || adminPassEnv;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user === adminUser && pass === currentPass) {
      sessionStorage.setItem('admin_logged', 'true');
      const d = new Date();
      const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
      const ts = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
      const device = /Mobile|Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '') ? 'Mobile' : 'Desktop';
      const res = `${window.innerWidth}x${window.innerHeight}`;
      localStorage.setItem('mck_last_login', ts);
      localStorage.setItem('mck_last_login_device', device);
      localStorage.setItem('mck_last_login_resolution', res);
      onLoggedIn();
    } else {
      alert('账号或密码错误');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', color: '#fff' }}>
      <form onSubmit={handleSubmit} style={{ width: 360, background: '#141414', padding: 24, borderRadius: 12, boxShadow: '0 6px 24px rgba(0,0,0,0.4)' }}>
        <h2 style={{ margin: 0, marginBottom: 16, color: '#00BFA5', fontSize: 18, letterSpacing: 2 }}>MCK Admin 登录</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            value={user}
            onChange={(e) => setUser(e.target.value)}
            placeholder="用户名"
            style={{ background: '#0f0f0f', color: '#fff', border: '1px solid #2a2a2a', padding: '10px 12px', borderRadius: 8 }}
          />
          <input
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            placeholder="密码"
            style={{ background: '#0f0f0f', color: '#fff', border: '1px solid #2a2a2a', padding: '10px 12px', borderRadius: 8 }}
          />
          <button type="submit" style={{ background: '#00BFA5', color: '#000', border: 'none', borderRadius: 8, padding: '10px 12px', cursor: 'pointer' }}>
            登录
          </button>
        </div>
      </form>
    </div>
  );
}
