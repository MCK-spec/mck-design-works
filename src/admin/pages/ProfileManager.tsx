import { useEffect, useState } from 'react';
import { store } from '../../utils/store';

export default function ProfileManager() {
  const [profile, setProfile] = useState<any>({ name: '', title: '', city: '', intro: '', educationSchool: '', educationInfo: '', skillDesign: [], skillTools: [] });
  const [contact, setContact] = useState<any>({ wechat: '', phone: '', email: '', xhs: '', behance: '', linkedin: '' });
  const [footer, setFooter] = useState<any>({ brand: 'MCK Design', year: '2026', ctaLine1: '', ctaLine2: '', ctaBtn: '联系我' });
  const [savedHint, setSavedHint] = useState<string>('');
  const [exp, setExp] = useState<any[]>([{ company: '', position: '', period: '', points: ['', ''], tags: [''] }, { company: '', position: '', period: '', points: ['', ''], tags: [''] }, { company: '', position: '', period: '', points: ['', ''], tags: [''] }]);

  useEffect(() => {
    const load = async () => {
      try {
        const [p, c, f, e] = await Promise.all([
          fetch('/api/profile').then(r => r.json()).catch(() => (null)),
          fetch('/api/contact').then(r => r.json()).catch(() => (null)),
          fetch('/api/footer').then(r => r.json()).catch(() => (null)),
          fetch('/api/experiences').then(r => r.json()).catch(() => (null)),
        ]);
        if (p && typeof p === 'object') setProfile(p);
        if (c && typeof c === 'object') setContact(c);
        if (f && typeof f === 'object') setFooter(f);
        if (Array.isArray(e)) {
          const norm = e.map((it: any) => ({
            company: it?.company || '',
            position: it?.position || it?.role || '',
            period: it?.period || it?.time || '',
            points: Array.isArray(it?.points) ? it.points : (Array.isArray(it?.details) ? it.details : []),
            tags: Array.isArray(it?.tags) ? it.tags : [],
          }));
          setExp(norm);
        }
      } catch {
        try {
          const p = localStorage.getItem('mck_profile'); if (p) setProfile(JSON.parse(p));
          const c = localStorage.getItem('mck_contact'); if (c) setContact(JSON.parse(c));
          const f = localStorage.getItem('mck_footer'); if (f) setFooter(JSON.parse(f));
          const e = localStorage.getItem('mck_experience');
          if (e) {
            const arr = JSON.parse(e);
            if (Array.isArray(arr)) {
              const norm = arr.map((it: any) => ({
                company: it?.company || '',
                position: it?.position || it?.role || '',
                period: it?.period || it?.time || '',
                points: Array.isArray(it?.points) ? it.points : (Array.isArray(it?.details) ? it.details : []),
                tags: Array.isArray(it?.tags) ? it.tags : [],
              }));
              setExp(norm);
            }
          }
        } catch {}
      }
    };
    load();
  }, []);

  const clearAll = () => {
    if (!confirm('确认清空所有内容？前台将显示占位状态。')) return;
    store.set('mck_profile', {});
    store.set('mck_experience', []);
    store.set('mck_works_data', []);
    store.set('mck_contact', {});
    store.set('mck_footer', {});
    store.set('mck_notices', []);
    setSavedHint('已清空 ✓');
    setTimeout(() => setSavedHint(''), 2000);
  };
  const badge = (v?: any) => v && ((Array.isArray(v) ? v.length : String(v).trim().length) ? <span style={{ marginLeft: 8, background: 'rgba(0,191,165,0.15)', color: '#00BFA5', borderRadius: 999, padding: '2px 8px', fontSize: 11 }}>✓ 已填写</span> : <span style={{ marginLeft: 8, background: 'rgba(255,165,0,0.15)', color: '#FFA500', borderRadius: 999, padding: '2px 8px', fontSize: 11 }}>占位中</span>);

  const saveAll = () => {
    store.set('mck_profile', profile);
    store.set('mck_contact', contact);
    store.set('mck_footer', footer);
    store.set('mck_experience', exp);
    try {
      fetch('/api/experiences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exp)
      }).catch(() => {});
      fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      }).catch(() => {});
      fetch('/api/contact', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contact)
      }).catch(() => {});
      fetch('/api/footer', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(footer)
      }).catch(() => {});
    } catch {}
    setSavedHint('已保存全部 ✓');
    setTimeout(() => setSavedHint(''), 2000);
  };

  const addTag = (group: 'skillDesign' | 'skillTools') => {
    const arr = [...(profile[group] || [])];
    arr.push('新标签');
    setProfile({ ...profile, [group]: arr });
  };
  const updateTag = (group: 'skillDesign' | 'skillTools', i: number, v: string) => {
    const arr = [...(profile[group] || [])];
    arr[i] = v;
    setProfile({ ...profile, [group]: arr });
  };
  const delTag = (group: 'skillDesign' | 'skillTools', i: number) => {
    const arr = (profile[group] || []).filter((_: any, idx: number) => idx !== i);
    setProfile({ ...profile, [group]: arr });
  };

  return (
    <div style={{ color: '#fff' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <h3 style={{ color: '#00BFA5', letterSpacing: 2, margin: 0 }}>个人信息</h3>
        <button onClick={saveAll} style={{ marginLeft: 'auto', background: '#00BFA5', color: '#000', border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer' }}>保存全部</button>
        <button onClick={clearAll} style={{ marginLeft: 8, background: 'transparent', color: '#ff6b6b', border: '1px solid #ff6b6b', borderRadius: 6, padding: '6px 10px', cursor: 'pointer' }}>一键清空所有内容</button>
      </div>
      {savedHint && <div style={{ color: '#00BFA5', marginBottom: 8 }}>{savedHint}</div>}
      <div style={{ background: '#0f0f0f', border: '1px solid #222', borderRadius: 8, padding: 16, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ color: '#aaa' }}>首页个人介绍</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ color: '#00BFA5' }}>姓名 / 昵称 {badge(profile.name)}</span>
            <input value={profile.name || ''} onChange={(e) => setProfile({ ...profile, name: e.target.value })} style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: 6, padding: '10px 14px' }} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ color: '#00BFA5' }}>职位定位一句话 {badge(profile.title)}</span>
            <input value={profile.title || ''} onChange={(e) => setProfile({ ...profile, title: e.target.value })} style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: 6, padding: '10px 14px' }} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ color: '#00BFA5' }}>所在城市 {badge(profile.city)}</span>
            <input value={profile.city || ''} onChange={(e) => setProfile({ ...profile, city: e.target.value })} style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: 6, padding: '10px 14px' }} />
          </label>
        </div>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ color: '#00BFA5' }}>个人介绍 {badge(profile.intro)}</span>
          <textarea rows={5} value={profile.intro || ''} onChange={(e) => setProfile({ ...profile, intro: e.target.value })} style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: 6, padding: '10px 14px' }} />
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ color: '#00BFA5' }}>教育背景 - 学校 {badge(profile.educationSchool)}</span>
            <input value={profile.educationSchool || ''} onChange={(e) => setProfile({ ...profile, educationSchool: e.target.value })} style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: 6, padding: '10px 14px' }} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ color: '#00BFA5' }}>教育背景 - 专业及年份 {badge(profile.educationInfo)}</span>
            <input value={profile.educationInfo || ''} onChange={(e) => setProfile({ ...profile, educationInfo: e.target.value })} style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: 6, padding: '10px 14px' }} />
          </label>
        </div>
        <div style={{ marginTop: 12 }}>
          <div style={{ color: '#00BFA5', marginBottom: 6 }}>设计方向标签 {badge(profile.skillDesign)}</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {(profile.skillDesign || []).map((t: string, i: number) => (
              <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#1a1a1a', borderRadius: 999, padding: '4px 12px' }}>
                <input value={t} onChange={(e) => updateTag('skillDesign', i, e.target.value)} style={{ background: 'transparent', color: '#fff', border: 'none', outline: 'none', width: 120 }} />
                <button onClick={() => delTag('skillDesign', i)} style={{ background: 'transparent', color: '#fff', border: 'none', cursor: 'pointer' }}>✕</button>
              </span>
            ))}
            <button onClick={() => addTag('skillDesign')} style={{ background: 'transparent', color: '#00BFA5', border: '1px solid #00BFA5', borderRadius: 999, padding: '4px 12px', cursor: 'pointer' }}>+</button>
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <div style={{ color: '#00BFA5', marginBottom: 6 }}>软件工具标签 {badge(profile.skillTools)}</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {(profile.skillTools || []).map((t: string, i: number) => (
              <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#1a1a1a', borderRadius: 999, padding: '4px 12px' }}>
                <input value={t} onChange={(e) => updateTag('skillTools', i, e.target.value)} style={{ background: 'transparent', color: '#fff', border: 'none', outline: 'none', width: 120 }} />
                <button onClick={() => delTag('skillTools', i)} style={{ background: 'transparent', color: '#fff', border: 'none', cursor: 'pointer' }}>✕</button>
              </span>
            ))}
            <button onClick={() => addTag('skillTools')} style={{ background: 'transparent', color: '#00BFA5', border: '1px solid #00BFA5', borderRadius: 999, padding: '4px 12px', cursor: 'pointer' }}>+</button>
          </div>
        </div>
      </div>

      <div style={{ background: '#0f0f0f', border: '1px solid #222', borderRadius: 8, padding: 16, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ color: '#aaa' }}>联系方式</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ color: '#00BFA5' }}>微信号 {badge(contact.wechat)}</span>
            <input value={contact.wechat || ''} onChange={(e) => setContact({ ...contact, wechat: e.target.value })} style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: 6, padding: '10px 14px' }} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ color: '#00BFA5' }}>手机号 {badge(contact.phone)}</span>
            <input value={contact.phone || ''} onChange={(e) => setContact({ ...contact, phone: e.target.value })} style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: 6, padding: '10px 14px' }} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ color: '#00BFA5' }}>邮箱 {badge(contact.email)}</span>
            <input value={contact.email || ''} onChange={(e) => setContact({ ...contact, email: e.target.value })} style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: 6, padding: '10px 14px' }} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ color: '#00BFA5' }}>小红书主页 {badge(contact.xhs)}</span>
            <input value={contact.xhs || ''} onChange={(e) => setContact({ ...contact, xhs: e.target.value })} style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: 6, padding: '10px 14px' }} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ color: '#00BFA5' }}>Behance {badge(contact.behance)}</span>
            <input value={contact.behance || ''} onChange={(e) => setContact({ ...contact, behance: e.target.value })} style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: 6, padding: '10px 14px' }} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ color: '#00BFA5' }}>LinkedIn {badge(contact.linkedin)}</span>
            <input value={contact.linkedin || ''} onChange={(e) => setContact({ ...contact, linkedin: e.target.value })} style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: 6, padding: '10px 14px' }} />
          </label>
        </div>
      </div>

      <div style={{ background: '#0f0f0f', border: '1px solid #222', borderRadius: 8, padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ color: '#aaa' }}>Footer 内容</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ color: '#00BFA5' }}>Footer 左侧品牌名称 {badge(footer.brand)}</span>
            <input value={footer.brand || ''} onChange={(e) => setFooter({ ...footer, brand: e.target.value })} style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: 6, padding: '10px 14px' }} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ color: '#00BFA5' }}>版权年份 {badge(footer.year)}</span>
            <input value={footer.year || ''} onChange={(e) => setFooter({ ...footer, year: e.target.value })} style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: 6, padding: '10px 14px' }} />
          </label>
        </div>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ color: '#00BFA5' }}>CTA 标题第一行 {badge(footer.ctaLine1)}</span>
          <input value={footer.ctaLine1 || ''} onChange={(e) => setFooter({ ...footer, ctaLine1: e.target.value })} style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: 6, padding: '10px 14px' }} />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ color: '#00BFA5' }}>CTA 标题第二行 {badge(footer.ctaLine2)}</span>
          <input value={footer.ctaLine2 || ''} onChange={(e) => setFooter({ ...footer, ctaLine2: e.target.value })} style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: 6, padding: '10px 14px' }} />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ color: '#00BFA5' }}>CTA 按钮文字 {badge(footer.ctaBtn)}</span>
          <input value={footer.ctaBtn || ''} onChange={(e) => setFooter({ ...footer, ctaBtn: e.target.value })} style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: 6, padding: '10px 14px' }} />
        </label>
      </div>

      <div style={{ background: '#0f0f0f', border: '1px solid #222', borderRadius: 8, padding: 16, marginTop: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ color: '#aaa' }}>实习经历</div>
        </div>
        {exp.map((item, idx) => (
          <div key={idx} style={{ border: '1px solid #222', borderRadius: 8, padding: 12, marginBottom: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ color: '#00BFA5' }}>公司 {badge(item.company)}</span>
                <input value={item.company || ''} onChange={(e) => { const n=[...exp]; n[idx]={...n[idx], company:e.target.value}; setExp(n); }} style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: 6, padding: '10px 14px' }} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ color: '#00BFA5' }}>职位 {badge(item.position)}</span>
                <input value={item.position || ''} onChange={(e) => { const n=[...exp]; n[idx]={...n[idx], position:e.target.value}; setExp(n); }} style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: 6, padding: '10px 14px' }} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ color: '#00BFA5' }}>时间 {badge(item.period)}</span>
                <input value={item.period || ''} onChange={(e) => { const n=[...exp]; n[idx]={...n[idx], period:e.target.value}; setExp(n); }} style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: 6, padding: '10px 14px' }} />
              </label>
            </div>
            <div style={{ marginTop: 8 }}>
              <div style={{ color: '#00BFA5', marginBottom: 6 }}>要点 {badge(item.points)}</div>
              {(Array.isArray(item.points) ? item.points : []).map((p: string, pi: number) => (
                <div key={pi} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                  <span>—</span>
                  <input value={p || ''} onChange={(e) => { const n=[...exp]; const base = Array.isArray(n[idx].points) ? n[idx].points : []; const arr=[...base]; arr[pi]=e.target.value; n[idx]={...n[idx], points:arr}; setExp(n); }} style={{ flex: 1, background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: 6, padding: '10px 14px' }} />
                </div>
              ))}
              <button onClick={() => { const n=[...exp]; const base = Array.isArray(n[idx].points) ? n[idx].points : []; n[idx]={...n[idx], points:[...base, '']}; setExp(n); }} style={{ background: 'transparent', color: '#00BFA5', border: '1px solid #00BFA5', borderRadius: 6, padding: '6px 10px', cursor: 'pointer' }}>+ 新增要点</button>
            </div>
            <div style={{ marginTop: 8 }}>
              <div style={{ color: '#00BFA5', marginBottom: 6 }}>标签 {badge(item.tags)}</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {(Array.isArray(item.tags) ? item.tags : []).map((t: string, ti: number) => (
                  <span key={ti} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#1a1a1a', borderRadius: 999, padding: '4px 12px' }}>
                    <input value={t || ''} onChange={(e) => { const n=[...exp]; const base = Array.isArray(n[idx].tags) ? n[idx].tags : []; const arr=[...base]; arr[ti]=e.target.value; n[idx]={...n[idx], tags:arr}; setExp(n); }} style={{ background: 'transparent', color: '#fff', border: 'none', outline: 'none', width: 120 }} />
                    <button onClick={() => { const n=[...exp]; const base = Array.isArray(n[idx].tags) ? n[idx].tags : []; n[idx]={...n[idx], tags:base.filter((_: any, i: number) => i!==ti)}; setExp(n); }} style={{ background: 'transparent', color: '#fff', border: 'none', cursor: 'pointer' }}>✕</button>
                  </span>
                ))}
                <button onClick={() => { const n=[...exp]; const base = Array.isArray(n[idx].tags) ? n[idx].tags : []; n[idx]={...n[idx], tags:[...base, '']}; setExp(n); }} style={{ background: 'transparent', color: '#00BFA5', border: '1px solid #00BFA5', borderRadius: 999, padding: '4px 12px', cursor: 'pointer' }}>+</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
