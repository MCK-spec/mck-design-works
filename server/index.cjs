const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(cors());

const DATA_DIR = path.join(__dirname, '..', 'data');
const ROOT_DIR = path.join(__dirname, '..');
const WORKS_PATH = path.join(DATA_DIR, 'works.json');
const EXPS_PATH = path.join(DATA_DIR, 'experiences.json');
const PROFILE_PATH = path.join(DATA_DIR, 'profile.json');
const CONTACT_PATH = path.join(DATA_DIR, 'contact.json');
const FOOTER_PATH = path.join(DATA_DIR, 'footer.json');
const SRC_ASSETS = path.join(__dirname, '..', 'src', 'assets');
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const UPLOADS_DIR = path.join(PUBLIC_DIR, 'uploads');
const BACKUP_DIR = path.join(__dirname, '..', '备份');
const WORKS_TRASH_PATH = path.join(DATA_DIR, 'works_deleted.json');
const DIST_DIR = path.join(ROOT_DIR, 'dist');

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(WORKS_PATH)) fs.writeFileSync(WORKS_PATH, '[]', 'utf-8');
  if (!fs.existsSync(PROFILE_PATH)) fs.writeFileSync(PROFILE_PATH, '{}', 'utf-8');
  if (!fs.existsSync(CONTACT_PATH)) fs.writeFileSync(CONTACT_PATH, '{}', 'utf-8');
  if (!fs.existsSync(FOOTER_PATH)) fs.writeFileSync(FOOTER_PATH, '{}', 'utf-8');
  if (!fs.existsSync(WORKS_TRASH_PATH)) fs.writeFileSync(WORKS_TRASH_PATH, '[]', 'utf-8');
  if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

function readWorks() {
  ensureDataFile();
  try {
    const text = fs.readFileSync(WORKS_PATH, 'utf-8');
    const arr = JSON.parse(text);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function writeWorks(arr) {
  ensureDataFile();
  try {
    const stamp = new Date();
    const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
    const tag = `${stamp.getFullYear()}${pad(stamp.getMonth()+1)}${pad(stamp.getDate())}-${pad(stamp.getHours())}${pad(stamp.getMinutes())}${pad(stamp.getSeconds())}`;
    const backupFile = path.join(BACKUP_DIR, `works-${tag}.json`);
    try { fs.writeFileSync(backupFile, JSON.stringify(arr, null, 2), 'utf-8'); } catch {}
    // 只保留最近20份备份
    try {
      const files = fs.readdirSync(BACKUP_DIR).filter(f => f.startsWith('works-') && f.endsWith('.json')).sort().reverse();
      files.slice(20).forEach(f => { try { fs.unlinkSync(path.join(BACKUP_DIR, f)); } catch {} });
    } catch {}
  } catch {}
  const tmp = WORKS_PATH + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(arr, null, 2), 'utf-8');
  fs.renameSync(tmp, WORKS_PATH);
}

function readExperiences() {
  ensureDataFile();
  try {
    if (!fs.existsSync(EXPS_PATH)) return [];
    const text = fs.readFileSync(EXPS_PATH, 'utf-8');
    const arr = JSON.parse(text);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function writeExperiences(arr) {
  ensureDataFile();
  const tmp = EXPS_PATH + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(arr, null, 2), 'utf-8');
  fs.renameSync(tmp, EXPS_PATH);
}

function readJsonFile(p, fallback) {
  ensureDataFile();
  try {
    if (!fs.existsSync(p)) return fallback;
    const t = fs.readFileSync(p, 'utf-8');
    return JSON.parse(t);
  } catch {
    return fallback;
  }
}

function writeJsonFile(p, obj) {
  ensureDataFile();
  const tmp = p + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(obj ?? {}, null, 2), 'utf-8');
  fs.renameSync(tmp, p);
}

function makeId() {
  return `work-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function seedUploadsAndImages() {
  try {
    if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR, { recursive: true });
    if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    const projectImageMap = {
      'project-1': [
        '作品集-05.png','作品集-06.png','作品集-07.png','作品集-08.png','作品集-09.png',
        '作品集-10.png','作品集-11.png','作品集-12.png','作品集-13.png','作品集-14.png',
        '作品集-15.png','作品集-16.png','作品集-17.png','作品集-18.png','作品集-19.png',
        '作品集-20.png','作品集-21.png','作品集-22.png','作品集-23.png'
      ],
      'project-2': [
        '作品集-25.png','作品集-26.png','作品集-27.png','作品集-28.png','作品集-29.png',
        '作品集-30.png','作品集-31.png','作品集-32.png','作品集-33.png','作品集-34.png'
      ],
      'project-3': [
        '作品集-42.png','作品集-43.png','作品集-44.png','作品集-45.png','作品集-46.png',
        '作品集-47.png','作品集-48.png'
      ],
      'huizhou-box': [
        '作品集-35.png','作品集-36.png','作品集-37.png','作品集-38.png','作品集-39.png','作品集-40.png'
      ]
    };
    const copyIfNeeded = (basename) => {
      const src = path.join(SRC_ASSETS, basename);
      const dest = path.join(UPLOADS_DIR, basename);
      if (fs.existsSync(src)) {
        if (!fs.existsSync(dest)) {
          fs.copyFileSync(src, dest);
        }
        return `/uploads/${basename}`;
      }
      return null;
    };
    const works = readWorks();
    let changed = false;
    for (const w of works) {
      const list = projectImageMap[w.id];
      if (list && (!Array.isArray(w.images) || w.images.length === 0)) {
        const urls = list.map(copyIfNeeded).filter(Boolean);
        if (urls.length) {
          w.images = urls;
          if (!w.coverImage) {
            w.coverImage = urls[0];
          }
          changed = true;
        }
      }
    }
    if (changed) writeWorks(works);
  } catch {
    // ignore seeding errors
  }
}

function seedExperiences() {
  try {
    if (!fs.existsSync(EXPS_PATH)) {
      const defaults = [
        {
          company: '苏州有南艺术馆',
          role: '平面设计实习生',
          time: '2024.11 — 2025.1',
          details: [
            '— 设计师海报设计：负责设计师个人作品展览的宣发海报，精准把控设计师个人风格，提升设计师个人品牌的信息触达率',
            '— 策展设计：负责策展主视觉设计，剖析个人艺术家美术风格和个性，结合艺术馆风格打造更具冲击力的海报'
          ],
          tags: ['海报设计', '视觉设计', '品牌传播']
        },
        {
          company: 'Cheil（三星国际4A广告公司）',
          role: '客户服务部创意实习生',
          time: '2025.3 — 2025.8',
          details: [
            '— 新媒体运营：负责永利国际小红书、微信平台的运营工作，根据活动主题产出海报、导视内容等，成功发布 30+ 篇',
            '— 海报设计：负责 2025 崇礼 168 超级越野赛事海报设计、视频框和字体设计，通过创意构思与色彩搭配，使作品兼具视觉吸引力和主题契合度'
          ],
          tags: ['新媒体运营', '活动视觉', '赛事海报', '4A广告']
        },
        {
          company: 'Cheil（三星国际4A广告公司）',
          role: '高端事业部创意实习生',
          time: '2025.10 — 2026.2',
          details: [
            '— 悦鲜活品牌整合营销全流程：负责线下品牌活动策划的活动流程示意，负责产品赋能、宣传海报、线上线下终端物料、视觉体系延展（小程序、电商、平台扩散），确保品牌一致性',
            '— 纯享品牌整合营销：负责核心创意部分 TVC 配图，品牌视觉延展（线下渠道端 POSM 设计、周边设计），增加品牌市场适应性与竞争力'
          ],
          tags: ['整合营销', 'TVC配图', 'POSM', '品牌延展']
        }
      ];
      writeExperiences(defaults);
    }
  } catch {}
}

app.use('/uploads', express.static(UPLOADS_DIR));
app.use('/备份', express.static(BACKUP_DIR));
app.use(express.static(PUBLIC_DIR));
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
}

app.get('/api/works', (req, res) => {
  const works = readWorks();
  res.json(works);
});

app.post('/api/works', (req, res) => {
  const works = readWorks();
  const incoming = req.body || {};
  const id = incoming.id || makeId();
  const item = { ...incoming, id };
  works.push(item);
  writeWorks(works);
  res.json(item);
});

app.put('/api/works/:id', (req, res) => {
  const id = req.params.id;
  const patch = req.body || {};
  const works = readWorks();
  const idx = works.findIndex(w => String(w.id) === String(id));
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const next = { ...works[idx], ...patch, id: works[idx].id };
  works[idx] = next;
  writeWorks(works);
  res.json(next);
});

app.put('/api/works/bulk', (req, res) => {
  const incoming = Array.isArray(req.body) ? req.body : [];
  const current = readWorks();
  if (incoming.length === 0) {
    return res.json(current);
  }
  const normalized = incoming
    .filter(it => it && typeof it === 'object')
    .map(it => ({
      id: it.id || makeId(),
      title: typeof it.title === 'string' ? it.title : '',
      category: typeof it.category === 'string' ? it.category : '',
      meta: typeof it.meta === 'string' ? it.meta : '',
      year: typeof it.year === 'string' ? it.year : '',
      description: typeof it.description === 'string' ? it.description : '',
      tags: Array.isArray(it.tags) ? it.tags : [],
      details: Array.isArray(it.details) ? it.details : [],
      background: typeof it.background === 'string' ? it.background : '',
      designConcept: typeof it.designConcept === 'string' ? it.designConcept : '',
      outputs: Array.isArray(it.outputs) ? it.outputs : [],
      quote: typeof it.quote === 'string' ? it.quote : '',
      themeColor: typeof it.themeColor === 'string' ? it.themeColor : '#00BFA5',
      coverImage: typeof it.coverImage === 'string' ? it.coverImage : '',
      images: Array.isArray(it.images) ? it.images : []
    }));
  if (normalized.length === 0) {
    return res.json(current);
  }
  writeWorks(normalized);
  res.json(normalized);
});

app.put('/api/works/reorder', (req, res) => {
  const ids = Array.isArray(req.body?.ids) ? req.body.ids.map(String) : [];
  const works = readWorks();
  if (!ids.length) return res.json(works);
  const map = new Map(works.map(w => [String(w.id), w]));
  const reordered = ids.map(id => map.get(id)).filter(Boolean);
  const remaining = works.filter(w => !ids.includes(String(w.id)));
  const result = [...reordered, ...remaining];
  writeWorks(result);
  res.json(result);
});

app.delete('/api/works/:id', (req, res) => {
  const id = req.params.id;
  const works = readWorks();
  const idx = works.findIndex(w => String(w.id) === String(id));
  if (idx === -1) return res.json({ ok: true });
  const [removed] = works.splice(idx, 1);
  try {
    const trash = readJsonFile(WORKS_TRASH_PATH, []);
    trash.push({ ...removed, deletedAt: new Date().toISOString() });
    writeJsonFile(WORKS_TRASH_PATH, trash);
  } catch {}
  writeWorks(works);
  res.json({ ok: true });
});

app.get('/api/works/trash', (req, res) => {
  const trash = readJsonFile(WORKS_TRASH_PATH, []);
  res.json(trash);
});

app.post('/api/works/restore', (req, res) => {
  const id = req.body && req.body.id ? String(req.body.id) : null;
  if (!id) return res.status(400).json({ error: 'id required' });
  const trash = readJsonFile(WORKS_TRASH_PATH, []);
  const idx = trash.findIndex(x => String(x.id) === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found in trash' });
  const item = trash.splice(idx, 1)[0];
  const works = readWorks();
  if (!works.find(w => String(w.id) === id)) works.push(item);
  writeJsonFile(WORKS_TRASH_PATH, trash);
  writeWorks(works);
  res.json({ ok: true });
});

app.get('/api/works/backups', (req, res) => {
  try {
    ensureDataFile();
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.startsWith('works-') && f.endsWith('.json'))
      .map(f => ({ file: f, path: `/备份/${f}` }))
      .sort();
    res.json(files);
  } catch {
    res.json([]);
  }
});

app.post('/api/works/restore-from-backup', (req, res) => {
  const file = req.body && req.body.file ? String(req.body.file) : null;
  const mode = req.body && req.body.mode ? String(req.body.mode) : 'duplicate';
  if (!file || !file.startsWith('works-')) return res.status(400).json({ error: 'invalid file' });
  const p = path.join(BACKUP_DIR, file);
  if (!fs.existsSync(p)) return res.status(404).json({ error: 'file not found' });
  try {
    const text = fs.readFileSync(p, 'utf-8');
    const arr = JSON.parse(text);
    if (!Array.isArray(arr)) return res.status(400).json({ error: 'bad backup format' });
    if (mode === 'replace') {
      writeWorks(arr);
      return res.json({ ok: true, mode });
    } else {
      const current = readWorks();
      const ids = new Set(current.map(x => String(x.id)));
      const merged = [...current, ...arr.filter(x => !ids.has(String(x.id)))];
      writeWorks(merged);
      return res.json({ ok: true, mode, added: merged.length - current.length });
    }
  } catch {
    return res.status(500).json({ error: 'restore failed' });
  }
});
app.get('/api/experiences', (req, res) => {
  res.json(readExperiences());
});

app.put('/api/experiences', (req, res) => {
  const arr = Array.isArray(req.body) ? req.body : [];
  writeExperiences(arr);
  res.json(readExperiences());
});

app.get('/api/profile', (req, res) => {
  res.json(readJsonFile(PROFILE_PATH, {}));
});
app.put('/api/profile', (req, res) => {
  const obj = req.body && typeof req.body === 'object' ? req.body : {};
  writeJsonFile(PROFILE_PATH, obj);
  res.json(readJsonFile(PROFILE_PATH, {}));
});

app.get('/api/contact', (req, res) => {
  res.json(readJsonFile(CONTACT_PATH, {}));
});
app.put('/api/contact', (req, res) => {
  const obj = req.body && typeof req.body === 'object' ? req.body : {};
  writeJsonFile(CONTACT_PATH, obj);
  res.json(readJsonFile(CONTACT_PATH, {}));
});

app.get('/api/footer', (req, res) => {
  res.json(readJsonFile(FOOTER_PATH, {}));
});
app.put('/api/footer', (req, res) => {
  const obj = req.body && typeof req.body === 'object' ? req.body : {};
  writeJsonFile(FOOTER_PATH, obj);
  res.json(readJsonFile(FOOTER_PATH, {}));
});

app.get('/api/geo', async (req, res) => {
  try {
    const r = await fetch('http://ip-api.com/json/?fields=city,regionName,country,query&lang=zh-CN', { cache: 'no-store' });
    if (!r.ok) throw new Error('bad');
    const d = await r.json();
    res.json({
      city: d.city || '未知',
      regionName: d.regionName || '未知',
      country: d.country || '未知'
    });
  } catch {
    res.json({ city: '未知', regionName: '未知', country: '未知' });
  }
});

app.get('/healthz', (req, res) => {
  res.json({
    ok: true,
    frontendBuilt: fs.existsSync(path.join(DIST_DIR, 'index.html'))
  });
});

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  const indexFile = path.join(DIST_DIR, 'index.html');
  if (fs.existsSync(indexFile)) {
    return res.sendFile(indexFile);
  }
  return res.status(404).json({ error: 'frontend build not found' });
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  seedUploadsAndImages();
  seedExperiences();
  console.log(`API server listening on http://localhost:${port}`);
});
