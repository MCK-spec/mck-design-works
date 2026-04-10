import { useState, useRef, useEffect } from 'react';
import type { TouchEvent } from 'react';
import type { ProjectData } from './ProjectModal';
import { store } from '../utils/store';
import { API_BASE, assetUrl } from '../utils/api';
import './WorkCarousel.css';
 

interface WorkCarouselProps {
  onOpenProject?: (project: ProjectData) => void;
}

function mapWorkToProjectData(w: any): ProjectData {
  return {
    id: w.id || `work-${Math.random()}`,
    category: w.category || '',
    meta: w.year || w.meta || '',
    title: w.title || '',
    description: w.description || '',
    details: w.details || [],
    tags: w.tags || [],
    coverImage: assetUrl(w.coverImage || ''),
    images: Array.isArray(w.images) ? w.images.map((s: string) => assetUrl(s)) : [],
    hasVideo: false,
    modalDetails: {
      background: w.background || '',
      designConcept: w.designConcept || '',
      outputs: w.outputs || [],
      quote: w.quote || ''
    }
  };
}

const bgColors = ['#1a0a00', '#0a1a0a', '#0a0a1a', '#1a1a0a', '#1a0a1a'];

const WorkCarousel = ({ onOpenProject }: WorkCarouselProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [mappedAll, setMappedAll] = useState<ProjectData[]>([]);
  useEffect(() => {
    const load = () => {
      fetch(`${API_BASE}/works`, { cache: 'no-store' })
        .then(r => r.json())
        .then((arr: any[]) => {
          const mapped = Array.isArray(arr) ? arr.map(mapWorkToProjectData) : [];
          setMappedAll(mapped);
        })
        .catch(() => setMappedAll([]));
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
  // 规则：前三个为精选作品，后面的用于“全部作品”轮播；当不足 4 个时，用全部
  const others = mappedAll.length > 3 ? mappedAll.slice(3) : mappedAll;
  const data = others;
  const totalCards = data.length;
  const carouselRef = useRef<HTMLDivElement>(null);
  
  // 触摸滑动状态
  const touchStartX = useRef<number | null>(null);

  const handlePrev = () => {
    setActiveIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => Math.min(totalCards - 1, prev + 1));
  };

  const handleWheel = (e: WheelEvent) => {
    // 阻止默认滚动，当鼠标在轮播区域内横向滑动时
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      e.preventDefault();
      if (e.deltaX > 0) {
        handleNext();
      } else if (e.deltaX < 0) {
        handlePrev();
      }
    }
  };

  useEffect(() => {
    const el = carouselRef.current;
    if (el) {
      // 需要 passive: false 才能 preventDefault
      el.addEventListener('wheel', handleWheel, { passive: false });
    }
    return () => {
      if (el) {
        el.removeEventListener('wheel', handleWheel);
      }
    };
  }, []);

  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) > 50) { // 阈值
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartX.current = null;
  };

  const getCardStyle = (index: number) => {
    const diff = index - activeIndex;
    let translateX = diff * 344; // 320px 宽 + 24px 间距
    let rotateY = 0;
    let scale = 1;
    let zIndex = totalCards - Math.abs(diff);

    // 计算 3D 效果
    if (diff < 0) {
      rotateY = 8;
      scale = 0.95;
    } else if (diff > 0) {
      rotateY = -8;
      scale = 0.95;
    }

    return {
      transform: `translateX(${translateX}px) perspective(1000px) rotateY(${rotateY}deg) scale(${scale})`,
      zIndex
    };
  };

  return (
    <section id="all-works" className="work-carousel-section">
      <div className="corner-label carousel-corner">
        <span className="corner-line"></span>
        <span className="corner-text">全部作品</span>
      </div>

      <div className="carousel-header">
        <h2 className="carousel-title">作品一览</h2>
        <div className="carousel-controls">
          <a href="#all-works" className="view-all-link">查看全部 →</a>
          <div className="carousel-arrows">
            <button 
              className={`carousel-arrow ${activeIndex === 0 ? 'disabled' : ''}`}
              onClick={handlePrev}
              disabled={activeIndex === 0}
            >
              ←
            </button>
            <button 
              className={`carousel-arrow ${activeIndex === totalCards - 1 ? 'disabled' : ''}`}
              onClick={handleNext}
              disabled={activeIndex === totalCards - 1}
            >
              →
            </button>
          </div>
        </div>
      </div>

      <div 
        className="carousel-track-container"
        ref={carouselRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="carousel-track">
          {data.map((project, index) => (
            <div 
              key={project.id} 
              className={`carousel-card ${index === activeIndex ? 'is-active' : ''}`}
              style={getCardStyle(index)}
              onClick={() => onOpenProject && onOpenProject(project)}
            >
              <div 
                className="carousel-card-inner"
                style={{ backgroundColor: bgColors[index % bgColors.length] }}
              >
                <div className="card-top-tags">
                  <span className="card-category">{project.category}</span>
                  <span className="card-year">{project.meta}</span>
                </div>
                
                <div className="card-image-wrapper">
                  { (project.coverImage || (project.images && project.images[0])) ? (
                    <img
                      src={project.coverImage || (project.images && project.images[0])}
                      alt={project.title}
                      className="card-image"
                    />
                  ) : (
                    <span className="card-placeholder-text">{project.title.charAt(0)}</span>
                  )}
                  <div className="card-hover-btn">查看详情 →</div>
                </div>

                <div className="card-info">
                  <h3 className="card-title">{project.title}</h3>
                  <p className="card-desc">{project.description}</p>
                  <div className="card-bottom-tags">
                    {project.tags.slice(0, 2).map((tag, idx) => (
                      <span key={idx} className="card-pill-tag">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="carousel-progress-bar">
        <div 
          className="carousel-progress-indicator"
          style={{ 
            width: `${100 / totalCards}%`,
            left: `${(activeIndex / totalCards) * 100}%`
          }}
        ></div>
      </div>
    </section>
  );
};

export default WorkCarousel;
