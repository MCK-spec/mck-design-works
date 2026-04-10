import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Hero from './Hero';
import ExperienceSection from './ExperienceSection';
import ServicesList from './ServicesList';
import ProjectShowcase from './ProjectShowcase';
import WorkCarousel from './WorkCarousel';
import Testimonials from './Testimonials';
import Footer from './Footer';
import type { ProjectData } from './ProjectModal';
import '../styles/placeholder.css';
import './Home.css';
import { useStore } from '../utils/useStore';
import { store } from '../utils/store';
import { API_BASE, assetUrl } from '../utils/api';

// 精选作品 1（project-1）图片
import p1img1 from '../assets/作品集-05.png';
import p1img2 from '../assets/作品集-06.png';
import p1img3 from '../assets/作品集-07.png';
import p1img4 from '../assets/作品集-08.png';
import p1img5 from '../assets/作品集-09.png';
import p1img6 from '../assets/作品集-10.png';
import p1img7 from '../assets/作品集-11.png';
import p1img8 from '../assets/作品集-12.png';
import p1img9 from '../assets/作品集-13.png';
import p1img10 from '../assets/作品集-14.png';
import p1img11 from '../assets/作品集-15.png';
import p1img12 from '../assets/作品集-16.png';
import p1img13 from '../assets/作品集-17.png';
import p1img14 from '../assets/作品集-18.png';
import p1img15 from '../assets/作品集-19.png';
import p1img16 from '../assets/作品集-20.png';
import p1img17 from '../assets/作品集-21.png';
import p1img18 from '../assets/作品集-22.png';
import p1img19 from '../assets/作品集-23.png';

// 精选作品 2（project-2）图片
import p2img1 from '../assets/作品集-25.png';
import p2img2 from '../assets/作品集-26.png';
import p2img3 from '../assets/作品集-27.png';
import p2img4 from '../assets/作品集-28.png';
import p2img5 from '../assets/作品集-29.png';
import p2img6 from '../assets/作品集-30.png';
import p2img7 from '../assets/作品集-31.png';
import p2img8 from '../assets/作品集-32.png';
import p2img9 from '../assets/作品集-33.png';
import p2img10 from '../assets/作品集-34.png';

// 精选作品 3（project-3）图片
import p3img1 from '../assets/作品集-42.png';
import p3img2 from '../assets/作品集-43.png';
import p3img3 from '../assets/作品集-44.png';
import p3img4 from '../assets/作品集-45.png';
import p3img5 from '../assets/作品集-46.png';
import p3img6 from '../assets/作品集-47.png';
import p3img7 from '../assets/作品集-48.png';

interface HomeProps {
  onOpenProject?: (project: ProjectData) => void;
  activeProjectId?: string | null;
}

const fallbackImagesById: Record<string, string[]> = {
  'project-1': [
    p1img1, p1img2, p1img3, p1img4, p1img5, p1img6, p1img7, p1img8, p1img9, p1img10,
    p1img11, p1img12, p1img13, p1img14, p1img15, p1img16, p1img17, p1img18, p1img19
  ],
  'project-2': [
    p2img1, p2img2, p2img3, p2img4, p2img5, p2img6, p2img7, p2img8, p2img9, p2img10
  ],
  'project-3': [
    p3img1, p3img2, p3img3, p3img4, p3img5, p3img6, p3img7
  ]
};

function mapWorkToProjectData(w: any): ProjectData {
  return {
    id: w.id || `work-${Math.random()}`,
    category: w.category || '',
    meta: w.meta || '',
    modalMeta: w.meta || '',
    title: w.title || '',
    description: w.description || '',
    modalDescription: w.description || '',
    details: w.details || [],
    tags: w.tags || [],
    modalTags: w.tags || [],
    coverImage: assetUrl(w.coverImage || (Array.isArray(w.images) && w.images[0]) || ''),
    images: (Array.isArray(w.images) && w.images.length) ? w.images.map((s: string) => assetUrl(s)) : (fallbackImagesById[w.id]?.map((s) => assetUrl(s)) || []),
    hasVideo: false,
    modalDetails: {
      background: w.background || '',
      designConcept: w.designConcept || '',
      outputs: w.outputs || [],
      quote: w.quote || ''
    }
  };
}

const Home = ({ onOpenProject, activeProjectId }: HomeProps) => {
  const [time, setTime] = useState('');
  const [projects, setProjects] = useState<ProjectData[]>([]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const marqueeText = "about me © about me © about me © about me © ";
  const profile = useStore<any>('mck_profile', {});
  const city = profile?.city || '';

  useEffect(() => {
    const load = () => {
      fetch(`${API_BASE}/works`, { cache: 'no-store' })
        .then(r => r.json())
        .then((arr: any[]) => {
          const mapped: ProjectData[] = Array.isArray(arr) ? arr.map(mapWorkToProjectData) : [];
          setProjects(mapped);
        })
        .catch(() => setProjects([]));
    };
    load();
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'mck_works_data') load();
    };
    window.addEventListener('storage', onStorage);
    const onChannel = (ev: MessageEvent) => {
      if (ev?.data?.api === 'works') load();
    };
    store.channel?.addEventListener('message', onChannel);
    return () => {
      window.removeEventListener('storage', onStorage);
      store.channel?.removeEventListener('message', onChannel);
    };
  }, []);

  return (
    <div className="home-page">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-logo">
          <motion.span layoutId="logo-mck" className="logo-part">MCK</motion.span>
          <motion.span layoutId="logo-design" className="logo-part">Design</motion.span>
        </div>
        
        <motion.div 
          className="nav-links"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <a href="#about-me" className="nav-link">关于我</a>
          <a href="#portfolio" className="nav-link">目录</a>
          <a href="#selected-work" className="nav-link">精选作品</a>
          <a href="#all-works" className="nav-link">全部作品</a>
          <a href="#honors" className="nav-link">荣誉</a>
          <a href="#contact" className="nav-link">联系我</a>
        </motion.div>
        
        <motion.div 
          className="nav-status"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <div>
            <span className="status-location">
              {city ? `Based in ${city}` : <span className="placeholder-text">常驻 待填写</span>}
            </span>
            <span className="status-time">{time}</span>
          </div>
          <div className="status-desc">Brand Visual Solutions</div>
        </motion.div>
      </nav>

      {/* Hero Section */}
      <main className="home-hero-section">
        <div className="home-hero-content">
          <motion.p 
            className="home-hero-text"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 1, ease: 'easeOut' }}
          >
            视觉传达专业应届生<br />
            不只会做好看的图<br />
            我关注品牌如何被感知，营销如何被记住<br />
            品牌形象、包装、物料、活动视觉<br />
            这是我过去四年一直在做、也一直在想的事
          </motion.p>
        </div>
        
        <motion.div 
          className="home-hero-footer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          <a href="#about" className="footer-link">© About Me</a>
          <span className="footer-center">VISUAL DESIGN</span>
          <a href="#work" className="footer-link">BRAND DESIGN</a>
        </motion.div>
      </main>

      {/* Marquee Section */}
      <motion.section 
        className="marquee-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
      >
        <div className="marquee-wrapper">
          <div className="marquee-content">
            {marqueeText}{marqueeText}
          </div>
        </div>
      </motion.section>

      {/* Intro Info Section */}
      <Hero />

      {/* Experience Section */}
      <ExperienceSection />

      {/* Services List Section */}
      <ServicesList />

      {/* Bottom Marquee Section */}
      <motion.section 
        className="marquee-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
      >
        <div className="marquee-wrapper">
          <div className="marquee-content">
            {marqueeText}{marqueeText}
          </div>
        </div>
      </motion.section>

      {/* Project Showcase Sections（精选作品固定前 3 条） */}
      {projects.slice(0, 3).map((project, index) => (
        <ProjectShowcase 
          key={project.id}
          project={project}
          onOpenProject={onOpenProject} 
          activeProjectId={activeProjectId}
          isFirst={index === 0}
        />
      ))}

      {/* Work Carousel Section */}
      <WorkCarousel onOpenProject={onOpenProject} />

      {/* Testimonials Section */}
      <Testimonials />

      {/* Contact CTA & Footer */}
      <Footer />
    </div>
  );
};

export default Home;
