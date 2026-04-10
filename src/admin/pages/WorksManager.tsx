import { useEffect, useState } from 'react';
import { store } from '../../utils/store';

type WorkItem = {
  id: string;
  title: string;
  category: string;
  meta: string;
  year?: string;
  description: string;
  tags: string[];
  details: string[];
  background: string;
  designConcept: string;
  outputs: string[];
  quote?: string;
  themeColor?: string;
  coverImage?: string;
};

const API_BASE = '/api/works';

export default function WorksManager() {
  const [works, setWorks] = useState<WorkItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [insertIndex, setInsertIndex] = useState<number | null>(null);
  const saveTimer = (globalThis as any).__mck_save_timer || { id: 0 };
  (globalThis as any).__mck_save_timer = saveTimer;

  useEffect(() => {
    fetch(API_BASE)
      .then(r => r.json())
      .then((arr: WorkItem[]) => {
        if (Array.isArray(arr)) setWorks(arr);
      })
      .catch(() => {});
  }, []);

  const activeArr = Array.isArray(works) ? works : [];
  const active = activeArr[activeIndex] || null;

  const notifyWorksUpdated = () => {
    try {
      store.channel?.postMessage({ api: 'works', action: 'updated' });
    } catch {}
  };

  const saveAll = () => {
    const payload = Array.isArray(works) ? works : [];
    fetch(`${API_BASE}/bulk`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      cache: 'no-store'
    })
      .then(r => {
        if (!r.ok) throw new Error('bad');
        return r.json();
      })
      .then((arr: WorkItem[]) => {
        const prevId = active?.id;
        const finalArr = Array.isArray(arr) ? arr : payload;
        setWorks(finalArr);
        // 兼容旧逻辑：写入本地并触发 storage，前台监听即可重新拉取
        try { localStorage.setItem('mck_works_data', JSON.stringify(finalArr)); } catch {}
        if (finalArr.length) {
          const idx = prevId ? finalArr.findIndex(x => String(x.id) === String(prevId)) : -1;
          setActiveIndex(idx >= 0 ? idx : Math.min(activeIndex, finalArr.length - 1));
        } else {
          setActiveIndex(0);
        }
        notifyWorksUpdated();
      })
      .catch(() => {
        refreshFromServer();
      });
    alert('已保存所有更改');
  };

  const refreshFromServer = () => {
    const prevId = active?.id;
    fetch(API_BASE, { cache: 'no-store' })
      .then(r => r.json())
      .then((arr: WorkItem[]) => {
        const next = Array.isArray(arr) ? arr : [];
        setWorks(next);
        if (next.length) {
          const idx = prevId ? next.findIndex(x => String(x.id) === String(prevId)) : -1;
          setActiveIndex(idx >= 0 ? idx : Math.min(activeIndex, next.length - 1));
        } else {
          setActiveIndex(0);
        }
      })
      .catch(() => {});
  };

  const addWork = () => {
    const nw: Omit<WorkItem, 'id'> = {
      title: '未命名作品',
      category: '整合营销',
      meta: '',
      year: '',
      description: '',
      tags: [],
      details: [],
      background: '',
      designConcept: '',
      outputs: [],
      quote: '',
      themeColor: '#00BFA5',
      coverImage: '',
    };
    fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nw)
    })
      .then(r => r.json())
      .then((created: WorkItem) => {
        setWorks(prev => {
          const next = [...prev, created];
          setActiveIndex(next.length - 1);
          return next;
        });
        notifyWorksUpdated();
      })
      .catch(() => {});
  };
  const mark = (v?: any) => (v && ((Array.isArray(v) ? v.length : String(v).trim().length)) ? <span style={{ marginLeft: 8, background: 'rgba(0,191,165,0.15)', color: '#00BFA5', borderRadius: 999, padding: '2px 8px', fontSize: 11 }}>✓ 已填写</span> : <span style={{ marginLeft: 8, background: 'rgba(255,165,0,0.15)', color: '#FFA500', borderRadius: 999, padding: '2px 8px', fontSize: 11 }}>占位中</span>);

  const updateActive = (patch: Partial<WorkItem>) => {
    let nextItem: WorkItem | null = null;
    setWorks((prev) => {
      const next = [...prev];
      if (!next[activeIndex]) return prev;
      nextItem = { ...next[activeIndex], ...patch };
      next[activeIndex] = nextItem;
      return next;
    });
    clearTimeout(saveTimer.id);
    saveTimer.id = setTimeout(() => {
      const itemToSave = nextItem;
      if (itemToSave && itemToSave.id) {
        fetch(`${API_BASE}/${itemToSave.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(itemToSave)
        })
          .then(r => r.ok ? r.json() : Promise.reject())
          .then((updated: WorkItem) => {
            setWorks(curr => {
              const clone = Array.isArray(curr) ? [...curr] : [];
              const idx = clone.findIndex(x => String(x.id) === String(updated.id));
              if (idx >= 0) clone[idx] = updated;
              return clone;
            });
          })
          .catch(() => {});
      }
    }, 400) as any;
  };

  const updateTag = (idx: number, v: string) => {
    if (!active) return;
    const tags = [...active.tags];
    tags[idx] = v;
    updateActive({ tags });
  };
  const addTag = () => updateActive({ tags: [...(active?.tags || []), '新标签'] });
  const delTag = (idx: number) => {
    if (!active) return;
    const tags = active.tags.filter((_, i) => i !== idx);
    updateActive({ tags });
  };

  const updateArrField = (field: 'details' | 'outputs', idx: number, v: string) => {
    if (!active) return;
    const base = Array.isArray((active as any)[field]) ? (active as any)[field] : [];
    const arr = [...base];
    arr[idx] = v;
    updateActive({ [field]: arr } as any);
  };
  const addArrField = (field: 'details' | 'outputs') => {
    if (!active) return;
    const base = Array.isArray((active as any)[field]) ? (active as any)[field] : [];
    updateActive({ [field]: [...base, ''] } as any);
  };
  const delArrField = (field: 'details' | 'outputs', idx: number) => {
    if (!active) return;
    const base = Array.isArray((active as any)[field]) ? (active as any)[field] : [];
    const arr = base.filter((_: any, i: number) => i !== idx);
    updateActive({ [field]: arr } as any);
  };

  const onDragStart = (i: number) => setDragIndex(i);
  const onDragOver = (i: number, e: React.DragEvent) => {
    e.preventDefault();
    setInsertIndex(i);
  };
  const onDrop = (i: number) => {
    if (dragIndex === null) return;
    const arr = [...activeArr];
    const [m] = arr.splice(dragIndex, 1);
    const pos = i > dragIndex ? i : i;
    arr.splice(pos, 0, m);
    setWorks(arr);
    fetch(`${API_BASE}/reorder`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: arr.map(w => w.id) })
    })
      .then(() => notifyWorksUpdated())
      .catch(() => {});
    setActiveIndex(pos);
    setDragIndex(null);
    setInsertIndex(null);
  };

  const deleteActive = () => {
    if (!active) return;
    if (!confirm('确定删除此作品？')) return;
    fetch(`${API_BASE}/${active.id}`, { method: 'DELETE' })
      .then(() => {
        setWorks((prev) => {
          const arr = prev.filter((_, i) => i !== activeIndex);
          setActiveIndex(0);
          return arr;
        });
        notifyWorksUpdated();
      })
      .catch(() => {});
  };

  return (
    <div style={{ color: '#fff' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ margin: 0, color: '#00BFA5', letterSpacing: 2 }}>作品内容管理</h3>
        <button onClick={saveAll} style={{ marginLeft: 'auto', background: '#00BFA5', color: '#000', border: 'none', borderRadius: 8, padding: '10px 14px', cursor: 'pointer' }}>保存所有更改</button>
        <button onClick={refreshFromServer} style={{ marginLeft: 12, background: 'transparent', color: '#00BFA5', border: '1px solid #00BFA5', borderRadius: 8, padding: '10px 14px', cursor: 'pointer' }}>从后端刷新数据</button>
      </div>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ width: 280, background: '#0f0f0f', border: '1px solid #222', borderRadius: 8, padding: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ color: '#aaa' }}>排序</div>
            <button onClick={addWork} style={{ background: 'transparent', color: '#00BFA5', border: '1px solid #00BFA5', borderRadius: 6, padding: '6px 10px', cursor: 'pointer' }}>+ 新增作品</button>
          </div>
          <div>
            {(Array.isArray(works) ? works : []).map((w, i) => (
              <div
                key={w.id}
                draggable
                onDragStart={() => onDragStart(i)}
                onDragOver={(e) => onDragOver(i, e)}
                onDrop={() => onDrop(i)}
                onClick={() => setActiveIndex(i)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 8px',
                  borderLeft: i === activeIndex ? '2px solid #00BFA5' : '2px solid transparent',
                  background: dragIndex === i ? '#0f0f0f' : 'transparent',
                  opacity: dragIndex === i ? 0.5 : 1,
                  position: 'relative',
                  cursor: 'grab'
                }}
              >
                <span style={{ color: '#888' }}>⠿</span>
                <span style={{ flex: 1 }}>{w.title}</span>
                <span style={{ color: '#00BFA5', fontSize: 12 }}>{w.category}</span>
                {insertIndex === i && dragIndex !== null && (
                  <span style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 2, background: '#00BFA5' }}></span>
                )}
              </div>
            ))}
            {(Array.isArray(works) ? works : []).length === 0 && <div style={{ color: '#777', padding: 8 }}>暂无作品，点击「新增作品」添加</div>}
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 320, background: '#0f0f0f', border: '1px solid #222', borderRadius: 8, padding: 16 }}>
          {active ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ color: '#00BFA5' }}>作品标题 {mark(active.title)}</span>
                  <input value={active.title} onChange={(e) => updateActive({ title: e.target.value })} style={{ background: '#1a1a1a', color: '#fff', border: '1px solid #333', borderRadius: 6, padding: '10px 14px' }} />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ color: '#00BFA5' }}>类别 {mark(active.category)}</span>
                  <select value={active.category} onChange={(e) => updateActive({ category: e.target.value })} style={{ background: '#1a1a1a', color: '#fff', border: '1px solid #333', borderRadius: 6, padding: '10px 14px' }}>
                    <option>整合营销</option>
                    <option>品牌形象</option>
                    <option>包装设计</option>
                    <option>IP形象</option>
                    <option>UI设计</option>
                    <option>AIGC视觉</option>
                  </select>
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ color: '#00BFA5' }}>位置信息 {mark(active.meta)}</span>
                  <input value={active.meta} onChange={(e) => updateActive({ meta: e.target.value })} style={{ background: '#1a1a1a', color: '#fff', border: '1px solid #333', borderRadius: 6, padding: '10px 14px' }} />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ color: '#00BFA5' }}>年份 {mark(active.year)}</span>
                  <input value={active.year || ''} onChange={(e) => updateActive({ year: e.target.value })} style={{ background: '#1a1a1a', color: '#fff', border: '1px solid #333', borderRadius: 6, padding: '10px 14px' }} />
                </label>
              </div>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ color: '#00BFA5' }}>一句话描述 {mark(active.description)}</span>
                <textarea rows={3} value={active.description} onChange={(e) => updateActive({ description: e.target.value })} style={{ background: '#1a1a1a', color: '#fff', border: '1px solid #333', borderRadius: 6, padding: '10px 14px' }} />
              </label>
              <div>
              <span style={{ color: '#00BFA5' }}>标签 {mark(active.tags)}</span>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                  {(active.tags || []).map((t, i) => (
                    <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#1a1a1a', borderRadius: 999, padding: '4px 12px' }}>
                      <input value={t || ''} onChange={(e) => updateTag(i, e.target.value)} style={{ background: 'transparent', color: '#fff', border: 'none', outline: 'none', width: 100 }} />
                      <button onClick={() => delTag(i)} style={{ background: 'transparent', color: '#fff', border: 'none', cursor: 'pointer' }}>✕</button>
                    </span>
                  ))}
                  <button onClick={addTag} style={{ background: 'transparent', color: '#00BFA5', border: '1px solid #00BFA5', borderRadius: 999, padding: '4px 12px', cursor: 'pointer' }}>+</button>
                </div>
              </div>
              <div>
              <span style={{ color: '#00BFA5' }}>要点列表 {mark(active.details)}</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                  {(active.details || []).map((d, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span>—</span>
                      <input value={d} onChange={(e) => updateArrField('details', i, e.target.value)} style={{ flex: 1, background: '#1a1a1a', color: '#fff', border: '1px solid #333', borderRadius: 6, padding: '10px 14px' }} />
                      <button onClick={() => delArrField('details', i)} style={{ background: 'transparent', color: '#fff', border: '1px solid #333', borderRadius: 6, padding: '6px 10px', cursor: 'pointer' }}>删除</button>
                    </div>
                  ))}
                  <button onClick={() => addArrField('details')} style={{ background: 'transparent', color: '#00BFA5', border: '1px solid #00BFA5', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', width: 120 }}>+ 新增要点</button>
                </div>
              </div>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ color: '#00BFA5' }}>项目背景 {mark(active.background)}</span>
                <textarea rows={5} value={active.background} onChange={(e) => updateActive({ background: e.target.value })} style={{ background: '#1a1a1a', color: '#fff', border: '1px solid #333', borderRadius: 6, padding: '10px 14px' }} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ color: '#00BFA5' }}>设计思路 {mark(active.designConcept)}</span>
                <textarea rows={5} value={active.designConcept} onChange={(e) => updateActive({ designConcept: e.target.value })} style={{ background: '#1a1a1a', color: '#fff', border: '1px solid #333', borderRadius: 6, padding: '10px 14px' }} />
              </label>
              <div>
              <span style={{ color: '#00BFA5' }}>最终产出 {mark(active.outputs)}</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                  {(active.outputs || []).map((d, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span>—</span>
                      <input value={d} onChange={(e) => updateArrField('outputs', i, e.target.value)} style={{ flex: 1, background: '#1a1a1a', color: '#fff', border: '1px solid #333', borderRadius: 6, padding: '10px 14px' }} />
                      <button onClick={() => delArrField('outputs', i)} style={{ background: 'transparent', color: '#fff', border: '1px solid #333', borderRadius: 6, padding: '6px 10px', cursor: 'pointer' }}>删除</button>
                    </div>
                  ))}
                  <button onClick={() => addArrField('outputs')} style={{ background: 'transparent', color: '#00BFA5', border: '1px solid #00BFA5', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', width: 120 }}>+ 新增产出</button>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ color: '#00BFA5' }}>品牌 Quote {mark(active.quote)}</span>
                  <input value={active.quote || ''} onChange={(e) => updateActive({ quote: e.target.value })} style={{ background: '#1a1a1a', color: '#fff', border: '1px solid #333', borderRadius: 6, padding: '10px 14px' }} />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ color: '#00BFA5' }}>主题色 {mark(active.themeColor)}</span>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input type="color" value={active.themeColor || '#00BFA5'} onChange={(e) => updateActive({ themeColor: e.target.value })} />
                    <span>{active.themeColor || '#00BFA5'}</span>
                  </div>
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ color: '#00BFA5' }}>封面图片路径 {mark(active.coverImage)}</span>
                <input value={active.coverImage || ''} onChange={(e) => updateActive({ coverImage: e.target.value })} placeholder="建议：/uploads/xxx.png（public/uploads 下）或完整 URL；或直接用下方上传为 Data URL" style={{ background: '#1a1a1a', color: '#fff', border: '1px solid #333', borderRadius: 6, padding: '10px 14px' }} />
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <input id="cover-file" type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                      const dataUrl = reader.result as string;
                      updateActive({ coverImage: dataUrl });
                    };
                    reader.readAsDataURL(file);
                  }} />
                  <button onClick={() => document.getElementById('cover-file')?.click()} style={{ background: 'transparent', color: '#00BFA5', border: '1px solid #00BFA5', borderRadius: 6, padding: '6px 10px', cursor: 'pointer' }}>上传封面（Data URL）</button>
                  {active.coverImage && active.coverImage.startsWith('data:') && <span style={{ color: '#888', fontSize: 12 }}>已使用 Data URL</span>}
                </div>
                </label>
              </div>
              <div>
                <button onClick={deleteActive} style={{ background: 'transparent', color: '#ff6b6b', border: 'none', padding: '8px 10px', cursor: 'pointer' }}>删除此作品</button>
              </div>
            </div>
          ) : (
            <div style={{ color: '#777' }}>请在左侧选择或新增作品</div>
          )}
        </div>
      </div>
    </div>
  );
}
