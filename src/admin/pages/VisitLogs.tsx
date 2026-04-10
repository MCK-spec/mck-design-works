import { useMemo, useState, useEffect } from 'react';
import { getVisitLogs, clearVisitLogs } from '../../utils/tracker';

export default function VisitLogs() {
  const [logs, setLogs] = useState(getVisitLogs());
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [deviceFilter, setDeviceFilter] = useState<'All' | 'Mobile' | 'Desktop'>('All');
  const [cityFilter, setCityFilter] = useState<string>('');
  const sorted = useMemo(() => [...logs].reverse(), [logs]);

  useEffect(() => {
    // 迁移旧数据：补齐缺失的城市/省份/国家字段为「未知」
    try {
      const migrated = logs.map((l: any) => ({
        ...l,
        city: l.city || '未知',
        regionName: l.regionName || '未知',
        country: l.country || '未知',
      }));
      setLogs(migrated);
      // 把迁移后的数据写回存储，避免后续显示空白
      localStorage.setItem('visit_logs', JSON.stringify(migrated));
    } catch {}
    const dt = new Date();
    const end = dt.toISOString().slice(0, 10);
    dt.setDate(dt.getDate() - 6);
    const start = dt.toISOString().slice(0, 10);
    setFromDate(start);
    setToDate(end);
  }, []);

  const total = logs.length;
  const today = useMemo(() => {
    const d = new Date();
    const prefix = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return logs.filter(l => l.time.startsWith(prefix)).length;
  }, [logs]);

  const confirmClear = () => {
    if (confirm('确定清空全部访问记录？此操作不可恢复。')) {
      clearVisitLogs();
      setLogs([]);
    }
  };

  const filtered = useMemo(() => {
    return sorted.filter(l => {
      const dStr = l.time.slice(0, 10);
      let okDate = true;
      if (fromDate) okDate = okDate && dStr >= fromDate;
      if (toDate) okDate = okDate && dStr <= toDate;
      let okDevice = deviceFilter === 'All' ? true : l.device === deviceFilter;
      const cityStr = `${l.city || ''}${l.regionName ? ` ${l.regionName}` : ''}${l.country ? ` ${l.country}` : ''}`;
      let okCity = cityFilter ? cityStr.toLowerCase().includes(cityFilter.toLowerCase()) : true;
      return okDate && okDevice && okCity;
    });
  }, [sorted, fromDate, toDate, deviceFilter, cityFilter]);

  const resetFilters = () => {
    const dt = new Date();
    const end = dt.toISOString().slice(0, 10);
    dt.setDate(dt.getDate() - 6);
    const start = dt.toISOString().slice(0, 10);
    setFromDate(start);
    setToDate(end);
    setDeviceFilter('All');
    setCityFilter('');
  };

  return (
    <div style={{ color: '#fff' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ background: '#1a1a1a', padding: 12, borderRadius: 8 }}>
            <div style={{ color: '#00BFA5' }}>总访问次数</div>
            <div style={{ fontSize: 24 }}>{total}</div>
          </div>
          <div style={{ background: '#1a1a1a', padding: 12, borderRadius: 8 }}>
            <div style={{ color: '#00BFA5' }}>今日访问次数</div>
            <div style={{ fontSize: 24 }}>{today}</div>
          </div>
        </div>
        <button onClick={confirmClear} style={{ marginLeft: 'auto', background: '#c0392b', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 12px', cursor: 'pointer' }}>
          清空记录
        </button>
      </div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', background: '#1a1a1a', border: '1px solid #333', padding: 12, borderRadius: 6, marginBottom: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ color: '#00BFA5' }}>从</span>
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} style={{ height: 36, background: '#0f0f0f', color: '#fff', border: '1px solid #333', borderRadius: 6, padding: '0 10px' }} />
          <span style={{ color: '#00BFA5' }}>到</span>
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} style={{ height: 36, background: '#0f0f0f', color: '#fff', border: '1px solid #333', borderRadius: 6, padding: '0 10px' }} />
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ color: '#00BFA5' }}>设备</span>
          <select value={deviceFilter} onChange={(e) => setDeviceFilter(e.target.value as any)} style={{ height: 36, background: '#0f0f0f', color: '#fff', border: '1px solid #333', borderRadius: 6, padding: '0 10px' }}>
            <option value="All">全部</option>
            <option value="Mobile">Mobile</option>
            <option value="Desktop">Desktop</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flex: 1, minWidth: 220 }}>
          <span style={{ color: '#00BFA5' }}>来源城市</span>
          <input value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} placeholder="输入城市关键词" style={{ height: 36, background: '#0f0f0f', color: '#fff', border: '1px solid #333', borderRadius: 6, padding: '0 10px', flex: 1 }} />
        </div>
        <button onClick={resetFilters} style={{ background: 'transparent', color: '#aaa', border: '1px solid #333', borderRadius: 6, height: 36, padding: '0 12px' }}>
          重置筛选
        </button>
        <div style={{ marginLeft: 'auto', color: '#888', fontSize: 12 }}>
          共筛选出 {filtered.length} 条记录
        </div>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#1a1a1a' }}>
              <th style={{ textAlign: 'left', padding: 8 }}>序号</th>
              <th style={{ textAlign: 'left', padding: 8 }}>访问时间</th>
              <th style={{ textAlign: 'left', padding: 8 }}>页面</th>
              <th style={{ textAlign: 'left', padding: 8 }}>设备</th>
              <th style={{ textAlign: 'left', padding: 8 }}>来源城市</th>
              <th style={{ textAlign: 'left', padding: 8 }}>停留时长</th>
              <th style={{ textAlign: 'left', padding: 8 }}>分辨率</th>
              <th style={{ textAlign: 'left', padding: 8 }}>来源渠道</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((l, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #1f1f1f' }}>
                <td style={{ padding: 8 }}>{filtered.length - i}</td>
                <td style={{ padding: 8 }}>{l.time}</td>
                <td style={{ padding: 8 }}>{l.page}</td>
                <td style={{ padding: 8 }}>{l.device}</td>
                <td style={{ padding: 8 }}>
                  {l.country && l.country !== '中国'
                    ? `${l.city || '未知'} · ${l.country || '未知'}`
                    : `${l.city || '未知'} · ${l.regionName || '未知'}`}
                </td>
                <td style={{ padding: 8, color: l.duration ? '#fff' : '#888', fontStyle: l.duration ? 'normal' as any : 'italic' }}>
                  {l.duration || '访问中...'}
                </td>
                <td style={{ padding: 8 }}>{l.resolution}</td>
                <td style={{ padding: 8 }}>{l.referrer}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: 16, color: '#888' }}>暂无记录</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
