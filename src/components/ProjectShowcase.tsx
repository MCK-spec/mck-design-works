import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import type { ProjectData } from './ProjectModal';
import './ProjectShowcase.css';
import '../styles/placeholder.css';

interface ProjectShowcaseProps {
  project: ProjectData;
  onOpenProject?: (project: ProjectData) => void;
  activeProjectId?: string | null;
  isFirst?: boolean; // 用于控制是否显示“精选作品”角标和 ID
}

// 定义交错动画的容器 variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

// 定义单行文字的滑入 variants
const itemVariants: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.6, ease: 'easeOut' }
  },
};

const ProjectShowcase = ({ project, onOpenProject, activeProjectId, isFirst = false }: ProjectShowcaseProps) => {
  const handleProjectClick = () => {
    if (onOpenProject) {
      onOpenProject(project);
    }
  };

  const isActive = activeProjectId === project.id;

  return (
    <section id={isFirst ? 'selected-work' : undefined} className={`project-showcase-section ${!isFirst ? 'not-first' : ''}`}>
      {/* Corner Label - 只有第一个展示 */}
      {isFirst && (
        <div className="corner-label showcase-corner">
          <span className="corner-line"></span>
          <span className="corner-text">精选作品</span>
        </div>
      )}

      <div 
        className={`showcase-container ${isActive ? 'is-active' : ''}`} 
        onClick={handleProjectClick} 
        style={{ cursor: 'pointer' }}
      >
        {/* Left Side - Images */}
        <div className="showcase-left">
          <motion.div 
            className="single-image-wrapper"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {project.coverImage ? (
              (() => {
                const src = project.coverImage || '';
                if (src.startsWith('data:')) {
                  return <img src={src} alt={project.title} className="showcase-single-image" />;
                }
                const normalized = (src.startsWith('http') || src.startsWith('/') || src.startsWith('./'))
                  ? src
                  : `/uploads/${src}`;
                return <img src={normalized} alt={project.title} className="showcase-single-image" onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                  const ph = document.createElement('div');
                  ph.className = 'placeholder-image';
                  ph.innerText = '封面图 · 建议尺寸 800×600';
                  e.currentTarget.parentElement?.appendChild(ph);
                }} />;
              })()
            ) : (
              <div className="placeholder-image">封面图 · 建议尺寸 800×600</div>
            )}
          </motion.div>
        </div>

        {/* Right Side: Text Information */}
        <div className="showcase-right">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div variants={itemVariants} className="showcase-meta">{project.meta || <span className="placeholder-text">待填写...</span>}</motion.div>
            
            <motion.h2 variants={itemVariants} className="showcase-title">{project.title || <span className="placeholder-text">待填写...</span>}</motion.h2>
            
            <motion.p variants={itemVariants} className="showcase-description">
              {project.description || <span className="placeholder-text">待填写...</span>}
            </motion.p>
            
            <motion.div variants={itemVariants}>
              <ul className="showcase-details">
                {(project.details && project.details.length ? project.details : ['待填写...','待填写...']).map((detail, index) => (
                  <li key={index}>— {detail}</li>
                ))}
              </ul>
            </motion.div>

            <motion.div variants={itemVariants} className="showcase-tags">
              {(project.tags && project.tags.length ? project.tags : ['待填写']).map((tag, index) => (
                <span key={index} className="showcase-tag">{tag}</span>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ProjectShowcase;
