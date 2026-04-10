import { useEffect, useState } from 'react';
import { store } from '../../utils/store';

type PositionType = 'banner' | 'bubble' | 'modal';
type DurationType = 'permanent' | '24h' | '72h' | '7d';

type Notice = {
  id: string;
  content: string;
  position: PositionType;
  enabled: boolean;
  duration: DurationType;
  createdAt: number;
  expiresAt?: number;
};

const STORAGE_KEY = 'mck_notices';

function calcExpires(createdAt: number, d: DurationType): number | undefined {
  if (d === 'permanent') return undefined;
  const map: Record<DurationType, number> = { permanent: 0, '24h': 24, '72h': 72, '7d': 24 * 7 };
  return createdAt + map[d] * 60 * 60 * 1000;
}

export default function MessageManager() {
  const [list, setList] = useState<Notice[]>([]);
  const [editing, setEditing] = useState<Notice | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [toolbarColorOpen, setToolbarColorOpen] = useState(false);
  const [contentHtml, setContentHtml] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) setList(arr);
      }
    } catch {}
  }, []);

  const saveAll = (arr: Notice[]) => {
    setList(arr);
    store.set(STORAGE_KEY, arr);
  };

  const addNotice = () => {
    const now = Date.now();
    const n: Notice = { id: `n-${now}`, content: '', position: 'banner', enabled: false, duration: 'permanent', createdAt: now, expiresAt: undefined };
    setEditing(n);
    setPanelOpen(true);
    setContentHtml('');
  };

  const editNotice = (n: Notice) => {
    setEditing({ ...n });
    setPanelOpen(true);
    setContentHtml(n.content);
  };

  const deleteNotice = (id: string) => {
    if (!confirm('确定删除此消息？')) return;
    const arr = list.filter((n) => n.id !== id);
    saveAll(arr);
  };

  const toggleEnabled = (id: string) => {
    const arr = list.map((n) => (n.id === id ? { ...n, enabled: !n.enabled } : n));
    saveAll(arr);
  };

  const exec = (cmd: string, value?: string) => {
    document.execCommand(cmd, false, value);
    setContentHtml((document.getElementById('mck-editor') as HTMLDivElement)?.innerHTML || '');
  };

  const saveEditing = () => {
    if (!editing) return;
    const createdAt = editing.createdAt || Date.now();
    const expiresAt = calcExpires(createdAt, editing.duration);
    const payload: Notice = { ...editing, content: contentHtml, createdAt, expiresAt };
    let arr = [...list];
    const idx = arr.findIndex((n) => n.id === payload.id);
    if (idx >= 0) arr[idx] = payload; else arr.push(payload);
    saveAll(arr);
    setPanelOpen(false);
    setEditing(null);
    setContentHtml('');
  };

  return (
    <div style={{ color: '#fff' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ margin: 0, color: '#00BFA5', letterSpacing: 2 }}>消息管理</h3>
        <button onClick={addNotice} style={{ marginLeft: 'auto', background: '#00BFA5', color: '#000', border: 'none', borderRadius: 8, padding: '10px 14px', cursor: 'pointer' }}>+ 新增消息</button>
      </div>
      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ flex: 1 }}>
          {list.map((n, i) => {
            const created = new Date(n.createdAt).toLocaleString();
            const posLabel = n.position === 'banner' ? '顶部横幅' : n.position === 'bubble' ? '右下角气泡' : '居中弹窗';
            const durLabel = n.duration === 'permanent' ? '永久' : n.duration === '24h' ? '24小时' : n.duration === '72h' ? '72小时' : '7天';
            return (
              <div key={n.id} style={{ background: '#1a1a1a', borderRadius: 8, padding: 20, marginBottom: 12, position: 'relative' }}>
                <div style={{ position: 'absolute', left: 12, top: 8, color: '#888' }}>#{i + 1}</div>
                <div style={{ position: 'absolute', right: 12, top: 8, color: '#888' }}>{created}</div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#fff', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }} dangerouslySetInnerHTML={{ __html: n.content || '' }} />
                    <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                      <span style={{ background: '#0f0f0f', color: '#00BFA5', borderRadius: 6, padding: '4px 8px', fontSize: 12 }}>{posLabel}</span>
                      <span style={{ background: '#0f0f0f', color: '#00BFA5', borderRadius: 6, padding: '4px 8px', fontSize: 12 }}>{durLabel}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <button onClick={() => toggleEnabled(n.id)} style={{ background: n.enabled ? '#00BFA5' : '#333', color: n.enabled ? '#000' : '#fff', border: 'none', borderRadius: 14, padding: '8px 14px', cursor: 'pointer' }}>{n.enabled ? '启用' : '关闭'}</button>
                    <button onClick={() => editNotice(n)} style={{ background: 'transparent', color: '#aaa', border: '1px solid #333', borderRadius: 6, padding: '8px 12px', cursor: 'pointer' }}>编辑</button>
                    <button onClick={() => deleteNotice(n.id)} style={{ background: 'transparent', color: '#ff6b6b', border: '1px solid #333', borderRadius: 6, padding: '8px 12px', cursor: 'pointer' }}>删除</button>
                  </div>
                </div>
              </div>
            );
          })}
          {list.length === 0 && <div style={{ color: '#777' }}>暂无消息，点击右上角「新增消息」</div>}
        </div>
        <div style={{ width: panelOpen ? 400 : 0, transition: 'width 0.3s ease', overflow: 'hidden' }}>
          {panelOpen && editing && (
            <div style={{ background: '#0f0f0f', border: '1px solid #222', borderRadius: 8, padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ color: '#fff' }}>编辑消息</div>
                <button onClick={() => { setPanelOpen(false); setEditing(null); }} style={{ background: 'transparent', color: '#aaa', border: 'none', cursor: 'pointer' }}>取消</button>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
                <button onClick={() => exec('bold')} style={{ background: '#1a1a1a', color: '#fff', border: '1px solid #333', borderRadius: 6, padding: '6px 10px', cursor: 'pointer' }}>B 加粗</button>
                <button onClick={() => {
                  const url = prompt('输入链接地址');
                  if (url) exec('createLink', url);
                }} style={{ background: '#1a1a1a', color: '#fff', border: '1px solid #333', borderRadius: 6, padding: '6px 10px', cursor: 'pointer' }}>🔗 链接</button>
                <div style={{ position: 'relative' }}>
                  <button onClick={() => setToolbarColorOpen(!toolbarColorOpen)} style={{ background: '#1a1a1a', color: '#fff', border: '1px solid #333', borderRadius: 6, padding: '6px 10px', cursor: 'pointer' }}>A 颜色</button>
                  {toolbarColorOpen && (
                    <div style={{ position: 'absolute', top: '110%', left: 0, background: '#0f0f0f', border: '1px solid #333', borderRadius: 6, padding: 8, display: 'flex', gap: 8 }}>
                      {['#00BFA5', '#FFD700', '#FF6B6B', '#FFFFFF'].map((c) => (
                        <button key={c} onClick={() => { exec('foreColor', c); setToolbarColorOpen(false);} } style={{ background: c, border: '1px solid #333', width: 24, height: 24, borderRadius: 4 }}></button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div id="mck-editor" contentEditable={true} onInput={(e) => setContentHtml((e.target as HTMLDivElement).innerHTML)} style={{ background: '#1a1a1a', border: '1px solid #333', minHeight: 80, padding: 12, color: '#fff', borderRadius: 6, marginTop: 8 }} dangerouslySetInnerHTML={{ __html: contentHtml }} />
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12 }}>
                <span style={{ color: '#00BFA5' }}>展示位置</span>
                <select value={editing.position} onChange={(e) => setEditing({ ...editing, position: e.target.value as PositionType })} style={{ background: '#1a1a1a', color: '#fff', border: '1px solid #333', borderRadius: 6, padding: '8px 10px' }}>
                  <option value="banner">全局顶部横幅</option>
                  <option value="bubble">右下角悬浮气泡</option>
                  <option value="modal">居中弹窗</option>
                </select>
              </label>
              <label style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
                <span style={{ color: '#00BFA5' }}>是否启用</span>
                <input type="checkbox" checked={editing.enabled} onChange={(e) => setEditing({ ...editing, enabled: e.target.checked })} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                <span style={{ color: '#00BFA5' }}>展示时长</span>
                <select value={editing.duration} onChange={(e) => setEditing({ ...editing, duration: e.target.value as DurationType })} style={{ background: '#1a1a1a', color: '#fff', border: '1px solid #333', borderRadius: 6, padding: '8px 10px' }}>
                  <option value="permanent">永久</option>
                  <option value="24h">24小时</option>
                  <option value="72h">72小时</option>
                  <option value="7d">7天</option>
                </select>
              </label>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button onClick={saveEditing} style={{ background: '#00BFA5', color: '#000', border: 'none', borderRadius: 8, padding: '10px 14px', cursor: 'pointer' }}>保存</button>
                <button onClick={() => { setPanelOpen(false); setEditing(null); }} style={{ background: 'transparent', color: '#aaa', border: '1px solid #333', borderRadius: 8, padding: '10px 14px', cursor: 'pointer' }}>取消</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
