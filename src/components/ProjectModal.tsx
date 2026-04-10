import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './ProjectModal.css';

export interface ProjectData {
  id: string;
  category: string;
  meta: string;
  modalMeta?: string;
  title: string;
  description: string;
  modalDescription?: string;
  details?: string[];
  tags: string[];
  modalTags?: string[];
  coverImage?: string;
  images?: string[]; // 新增：用于详情页展示的多张图片数组
  hasVideo?: boolean;
  modalDetails?: {
    background: string;
    designConcept: string;
    outputs: string[];
    colors?: { hex: string; name: string }[];
    quote?: string;
  };
}

interface ProjectModalProps {
  isOpen: boolean;
  project: ProjectData | null;
  onClose: () => void;
}

const ProjectModal = ({ isOpen, project, onClose }: ProjectModalProps) => {
  // 处理滚动锁定和 ESC 键关闭
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      // 记录当前滚动位置
      const scrollY = window.scrollY;
      
      // 添加全局 class
      document.body.classList.add('modal-open');
      
      // 锁定位置，必须设置 top 才能保持视觉上不跳动
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      
      // 将 scrollY 存入 body 的 data 属性中，以便恢复时使用
      document.body.dataset.scrollY = scrollY.toString();
      
      window.addEventListener('keydown', handleKeyDown);
    } else {
      // 恢复全局状态前，先读取之前保存的滚动位置
      const scrollY = document.body.dataset.scrollY || '0';
      
      document.body.classList.remove('modal-open');
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      
      // 恢复滚动位置 (使用 'instant' 行为避免平滑滚动导致闪烁)
      window.scrollTo({
        top: parseInt(scrollY),
        behavior: 'instant'
      });
    }

    return () => {
      if (isOpen) {
         // Cleanup if unmounted while open
         const scrollY = document.body.dataset.scrollY || '0';
         document.body.classList.remove('modal-open');
         document.body.style.position = '';
         document.body.style.top = '';
         document.body.style.width = '';
         window.scrollTo({ top: parseInt(scrollY), behavior: 'instant' });
      }
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!project) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 背景蒙层 */}
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
          />

          {/* 浮窗主体 */}
          <motion.div
            className="modal-container"
            initial={{ y: '100%', opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: '100%', opacity: 0, scale: 0.97 }}
            transition={{ 
              duration: 1, // 增加到 1s
              ease: [0.16, 1, 0.3, 1] // 弹性缓动
            }}
          >
            {/* 顶部操作栏 (Sticky) */}
            <div className="modal-header">
              <span className="modal-category">{project.category}</span>
              <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
                ✕
              </button>
            </div>

            {/* 内部可滚动内容区 */}
            <div className="modal-content-scroll">
              {/* 项目标题区 */}
              <div className="modal-title-section">
                <span className="modal-meta">{project.modalMeta || project.meta}</span>
                <h1 className="modal-title">{project.title}</h1>
                <p className="modal-description">{project.modalDescription || project.description}</p>
                <div className="modal-tags">
                  {(project.modalTags || project.tags).map((tag, idx) => (
                    <span key={idx} className="modal-tag">{tag}</span>
                  ))}
                </div>
              </div>

              {/* 项目详情文字区 (移到图片上方) */}
              <div className="modal-details-section">
                <div className="detail-block">
                  <h3 className="detail-heading">项目背景</h3>
                  <p className="detail-text">
                    {project.modalDetails?.background || "在这里填入项目的详细背景信息。描述项目的起因、目标受众以及需要解决的核心问题。这部分内容帮助读者理解设计的出发点。"}
                  </p>
                </div>
                <div className="detail-block">
                  <h3 className="detail-heading">设计思路</h3>
                  <p className="detail-text">
                    {project.modalDetails?.designConcept || "在这里阐述具体的设计策略和思考过程。分享创意是如何产生的，以及在视觉风格、色彩搭配、排版布局上做出了哪些关键决策。"}
                  </p>
                </div>
                <div className="detail-block">
                  <h3 className="detail-heading">最终产出</h3>
                  <div className="detail-text outputs-list">
                    {project.modalDetails?.outputs ? (
                      project.modalDetails.outputs.map((output, idx) => (
                        <div key={idx}>— {output}</div>
                      ))
                    ) : (
                      <p>总结项目最终交付的成果及其带来的影响。可以提及设计方案是如何在实际场景中落地并发挥作用的。</p>
                    )}
                  </div>
                  {project.modalDetails?.colors && project.modalDetails.colors.length > 0 && (
                    <div className="detail-colors">
                      <div className="detail-colors-label">—— 色彩 & 工艺</div>
                      <div className="detail-colors-row">
                        {project.modalDetails.colors.map((c, i) => (
                          <div key={i} className="color-item">
                            <span className="color-swatch" style={{ backgroundColor: c.hex }} />
                            <span className="color-text">{c.hex} ｜ {c.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {project.modalDetails?.quote && (
                    <div className="detail-quote">
                      {project.modalDetails.quote}
                    </div>
                  )}
                </div>
              </div>

              {/* 主视觉大图区 */}
              <div className="modal-images-section">
                {project.images && project.images.length > 0 ? (
                  // 如果提供了真实图片数组，则遍历渲染
                  project.images.map((imgSrc, idx) => (
                    <img 
                      key={idx} 
                      src={imgSrc} 
                      alt={`${project.title} detail ${idx + 1}`} 
                      className="modal-detail-image" 
                    />
                  ))
                ) : null}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

export default ProjectModal;
