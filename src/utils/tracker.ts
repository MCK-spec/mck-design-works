export type DeviceType = 'Mobile' | 'Desktop';
export interface VisitLog {
  time: string;
  page: string;
  device: DeviceType;
  resolution: string;
  referrer: string;
  city: string;
  regionName: string;
  country: string;
  duration?: string;
}

const STORAGE_KEY = 'visit_logs';

function detectDevice(): DeviceType {
  const ua = navigator.userAgent || '';
  return /Mobile|Android|iPhone|iPad|iPod/i.test(ua) ? 'Mobile' : 'Desktop';
}

function nowString(): string {
  const d = new Date();
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function readLogs(): VisitLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeLogs(logs: VisitLog[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  } catch {}
}

async function fetchGeo(timeoutMs: number): Promise<{ city: string; regionName: string; country: string } | null> {
  try {
    const fetchPromise = fetch('/api/geo', { cache: 'no-store' })
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (!data) return null;
        return {
          city: data.city || '未知',
          regionName: data.regionName || '未知',
          country: data.country || '未知'
        };
      })
      .catch(() => null);
    const timeoutPromise = new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), timeoutMs);
    });
    return await Promise.race([fetchPromise, timeoutPromise]);
  } catch {
    return null;
  }
}

export async function recordVisit() {
  const logs = readLogs();
  let city = '未知';
  let regionName = '未知';
  let country = '未知';
  try {
    const geo = await fetchGeo(3000);
    if (geo) {
      city = geo.city || '未知';
      regionName = geo.regionName || '未知';
      country = geo.country || '未知';
    }
  } catch {}
  const log: VisitLog = {
    time: nowString(),
    page: location.hash || '#home',
    device: detectDevice(),
    resolution: `${window.innerWidth}x${window.innerHeight}`,
    referrer: document.referrer ? document.referrer : '直接访问',
    city,
    regionName,
    country,
  };
  logs.push(log);
  writeLogs(logs);
}

function formatDuration(ms: number): string {
  const sec = Math.max(0, Math.round(ms / 1000));
  if (sec < 60) return `${sec}秒`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}分${String(s).padStart(2, '0')}秒`;
}

export function initTracker() {
  if (!sessionStorage.getItem('mck_session_start')) {
    sessionStorage.setItem('mck_session_start', String(Date.now()));
  }
  recordVisit();
  window.addEventListener('hashchange', () => { recordVisit(); });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      const start = Number(sessionStorage.getItem('mck_session_start') || Date.now());
      const duration = formatDuration(Date.now() - start);
      const logs = readLogs();
      if (logs.length > 0) {
        logs[logs.length - 1].duration = duration;
        writeLogs(logs);
      }
    }
  });
  window.addEventListener('beforeunload', () => {
    const start = Number(sessionStorage.getItem('mck_session_start') || Date.now());
    const duration = formatDuration(Date.now() - start);
    const logs = readLogs();
    if (logs.length > 0) {
      logs[logs.length - 1].duration = duration;
      writeLogs(logs);
    }
  });
}

export function getVisitLogs(): VisitLog[] {
  return readLogs();
}

export function clearVisitLogs() {
  writeLogs([]);
}
