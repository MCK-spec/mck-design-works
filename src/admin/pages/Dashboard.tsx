import { useMemo } from 'react';
import { getVisitLogs } from '../../utils/tracker';

export default function Dashboard() {
  const logs = getVisitLogs();
  const total = logs.length;
  const today = useMemo(() => {
    const d = new Date();
    const prefix = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return logs.filter(l => l.time.startsWith(prefix)).length;
  }, [logs]);
  const pageCount = useMemo(() => {
    const map: Record<string, number> = {};
    logs.forEach(l => {
      map[l.page] = (map[l.page] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 3);
  }, [logs]);
  const deviceDist = useMemo(() => {
    const m = logs.filter(l => l.device === 'Mobile').length;
    const d = logs.filter(l => l.device === 'Desktop').length;
    const sum = m + d || 1;
    return { mobile: Math.round((m / sum) * 100), desktop: Math.round((d / sum) * 100) };
  }, [logs]);
  const last7 = useMemo(() => {
    const days: string[] = [];
    const counts: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const dt = new Date();
      dt.setDate(dt.getDate() - i);
      const prefix = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
      days.push(prefix);
      counts.push(logs.filter(l => l.time.startsWith(prefix)).length);
    }
    return { days, counts };
  }, [logs]);

  return (
    <div style={{ color: '#fff', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
      <div style={{ background: '#1a1a1a', padding: 16, borderRadius: 8 }}>
        <div style={{ color: '#00BFA5' }}>总访问次数</div>
        <div style={{ fontSize: 28 }}>{total}</div>
      </div>
      <div style={{ background: '#1a1a1a', padding: 16, borderRadius: 8 }}>
        <div style={{ color: '#00BFA5' }}>今日访问次数</div>
        <div style={{ fontSize: 28 }}>{today}</div>
      </div>
      <div style={{ background: '#1a1a1a', padding: 16, borderRadius: 8 }}>
        <div style={{ color: '#00BFA5', marginBottom: 8 }}>最常访问页面 Top 3</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {pageCount.map(([p, c], i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 120 }}>{p}</span>
              <div style={{ flex: 1, background: '#0f0f0f', borderRadius: 6, overflow: 'hidden' }}>
                <div style={{ width: `${(c / (pageCount[0]?.[1] || 1)) * 100}%`, background: '#00BFA5', height: 10 }}></div>
              </div>
              <span>{c}</span>
            </div>
          ))}
          {pageCount.length === 0 && <div style={{ color: '#888' }}>暂无</div>}
        </div>
      </div>
      <div style={{ background: '#1a1a1a', padding: 16, borderRadius: 8 }}>
        <div style={{ color: '#00BFA5', marginBottom: 8 }}>设备类型分布</div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ width: 120 }}>Mobile</div>
          <div style={{ flex: 1, background: '#0f0f0f', borderRadius: 6, overflow: 'hidden' }}>
            <div style={{ width: `${deviceDist.mobile}%`, background: '#00BFA5', height: 10 }}></div>
          </div>
          <div>{deviceDist.mobile}%</div>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 8 }}>
          <div style={{ width: 120 }}>Desktop</div>
          <div style={{ flex: 1, background: '#0f0f0f', borderRadius: 6, overflow: 'hidden' }}>
            <div style={{ width: `${deviceDist.desktop}%`, background: '#00BFA5', height: 10 }}></div>
          </div>
          <div>{deviceDist.desktop}%</div>
        </div>
      </div>
      <div style={{ gridColumn: '1 / -1', background: '#1a1a1a', padding: 16, borderRadius: 8 }}>
        <div style={{ color: '#00BFA5', marginBottom: 8 }}>最近 7 天每日访问趋势</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 12, alignItems: 'end' }}>
          {last7.counts.map((n, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ background: '#00BFA5', height: `${(n / Math.max(...last7.counts, 1)) * 100 || 6}px`, borderRadius: 4 }}></div>
              <div style={{ marginTop: 6, fontSize: 12 }}>{last7.days[i].slice(5)}</div>
              <div style={{ fontSize: 12 }}>{n}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
