import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import Intro from './components/Intro';
import Home from './components/Home';
import CustomCursor from './components/CustomCursor';
import ProjectModal from './components/ProjectModal';
import type { ProjectData } from './components/ProjectModal';
import { initTracker } from './utils/tracker';
import { useStore } from './utils/useStore';

function App() {
  const [introDone, setIntroDone] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeProject, setActiveProject] = useState<ProjectData | null>(null);
  const notices = useStore<any[]>('mck_notices', []);
  const [banner, setBanner] = useState<any>(null);
  const [bubble, setBubble] = useState<any>(null);
  const [center, setCenter] = useState<any>(null);
  const [closedMap, setClosedMap] = useState<Record<string, boolean>>({});
  const [centerVisible, setCenterVisible] = useState(false);

  useEffect(() => {
    initTracker();
    const now = Date.now();
    const arr = Array.isArray(notices) ? notices : [];
    const enabled = arr.filter((n: any) => n.enabled && (!n.expiresAt || now < n.expiresAt));
    const latest = (pos: string) => enabled.filter((n: any) => n.position === pos).sort((a: any, b: any) => b.createdAt - a.createdAt)[0];
    const b = latest('banner');
    const bub = latest('bubble');
    const cen = latest('modal');
    const cm: Record<string, boolean> = {};
    [b, bub, cen].forEach((n: any) => {
      if (n) cm[n.id] = sessionStorage.getItem(`notice_closed_${n.id}`) === 'true';
    });
    setClosedMap(cm);
    setBanner(b || null);
    setBubble(bub || null);
    setCenter(cen || null);
    setTimeout(() => setCenterVisible(true), 1000);
  }, [notices]);

  const closeById = (id: string) => {
    sessionStorage.setItem(`notice_closed_${id}`, 'true');
    setClosedMap({ ...closedMap, [id]: true });
  };

  useEffect(() => {
    // 正常定时器逻辑
    const timer = setTimeout(() => {
      setIntroDone(true);
    }, 11500);

    // 添加点击/触摸事件监听，允许用户跳过开场动画
    const handleSkipIntro = () => {
      if (!introDone) {
        setIntroDone(true);
        clearTimeout(timer);
      }
    };

    // 如果开场动画还没结束，监听全局的点击和触摸事件
    if (!introDone) {
      window.addEventListener('click', handleSkipIntro);
      window.addEventListener('touchstart', handleSkipIntro);
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener('click', handleSkipIntro);
      window.removeEventListener('touchstart', handleSkipIntro);
    };
  }, [introDone]);

  return (
    <div className="app-container" style={{ width: '100%', minHeight: '100vh' }}>
      {banner && !closedMap[banner.id] && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, background: '#00BFA5', color: '#fff', padding: '10px 16px', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span dangerouslySetInnerHTML={{ __html: banner.content }}></span>
          <button onClick={() => closeById(banner.id)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>关闭</button>
        </div>
      )}
      {bubble && !closedMap[bubble.id] && (
        <div style={{ position: 'fixed', right: 24, bottom: 24, background: '#141414', color: '#fff', border: '1px solid #00BFA5', borderRadius: 8, padding: '12px 16px', zIndex: 10000, maxWidth: 320 }}>
          <div style={{ marginBottom: 8 }} dangerouslySetInnerHTML={{ __html: bubble.content }} />
          <div style={{ textAlign: 'right' }}>
            <button onClick={() => closeById(bubble.id)} style={{ background: '#00BFA5', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 12px', cursor: 'pointer' }}>关闭</button>
          </div>
        </div>
      )}
      {center && !closedMap[center.id] && centerVisible && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#141414', color: '#fff', border: '1px solid #222', borderRadius: 16, padding: 40, maxWidth: 480 }}>
            <div dangerouslySetInnerHTML={{ __html: center.content }} />
            <div style={{ textAlign: 'right', marginTop: 16 }}>
              <button onClick={() => closeById(center.id)} style={{ background: '#00BFA5', color: '#000', border: 'none', borderRadius: 8, padding: '10px 14px', cursor: 'pointer' }}>知道了</button>
            </div>
          </div>
        </div>
      )}
      <AnimatePresence>
        {!introDone && <Intro key="intro" />}
      </AnimatePresence>
      {introDone && (
        <Home 
          onOpenProject={(project) => {
            setActiveProject(project);
            setIsModalOpen(true);
          }} 
          activeProjectId={isModalOpen ? activeProject?.id : null}
        />
      )}
      <ProjectModal 
        isOpen={isModalOpen} 
        project={activeProject} 
        onClose={() => setIsModalOpen(false)} 
      />
      <CustomCursor />
    </div>
  );
}

export default App;
