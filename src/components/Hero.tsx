import { motion } from 'framer-motion';
import heroImage from '../assets/hero.png';
import '../styles/placeholder.css';
import { useStore } from '../utils/useStore';
import { useEffect } from 'react';
import { store } from '../utils/store';
import { API_BASE } from '../utils/api';
import './Hero.css';
const Hero = () => {
  const profile = useStore<any>('mck_profile', {});
  useEffect(() => {
    fetch(`${API_BASE}/profile`, { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data && typeof data === 'object') {
          store.set('mck_profile', data);
        }
      })
      .catch(() => {});
  }, []);
  const renderField = (v?: string, ph = '待填写...') => v ? <span>{v}</span> : <span className="placeholder-text">{ph}</span>;
  const name = profile?.name;
  const title = profile?.title || profile?.tagline;
  const intro = profile?.intro;
  const school = profile?.educationSchool || profile?.school;
  const major = profile?.educationInfo || profile?.major;
  const designTags: string[] = profile?.skillDesign || profile?.skillTags || [];
  const toolTags: string[] = profile?.skillTools || profile?.toolTags || [];
  return (
    <section id="about-me" className="hero-section">
      {/* Corner Label */}
      <div className="corner-label">
        <span className="corner-line"></span>
        <span className="corner-text">WELCOME</span>
      </div>

      <motion.div 
        className="hero-content"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
      >
        <div className="hero-title-group">
          <h1 className="hero-title">
            <div className="hero-line">Hi I'm {renderField(name, '待填写...')}</div>
            <div className="hero-line">{renderField(title, '待填写...')}</div>
            <div className="hero-line"><span className="hero-highlight">建立记忆点</span></div>
          </h1>
        </div>

        <div className="hero-bottom-area">
          <div className="hero-subtitle-group">
            {/* 第一段：自我介绍 */}
            <p className="hero-subtitle">
              {intro ? intro : <span className="placeholder-text">待填写...</span>}
            </p>

            {/* 第二段：教育背景 */}
            <div className="hero-education">
              <span className="hero-sub-label">—— 教育背景</span>
              <p className="hero-education-text">
                {renderField(school, '待填写...')} · {renderField(major, '待填写...')}
              </p>
            </div>

            {/* 第三段：技能标签 */}
            <div className="hero-skills">
              <span className="hero-sub-label">—— 擅长领域</span>
              <div className="hero-tags-group">
                {(designTags.length ? designTags : ['待填写','待填写','待填写']).map((t, i) => (
                  <span key={i} className="hero-tag">{t}</span>
                ))}
              </div>
              <div className="hero-tags-group">
                {(toolTags.length ? toolTags : ['待填写','待填写','待填写']).map((t, i) => (
                  <span key={i} className="hero-tag">{t}</span>
                ))}
              </div>
            </div>

            {/* 结尾句 */}
            <p className="hero-closing-text">
              我喜欢清晰明了。我喜欢系统。我喜欢当一切都有迹可循。
            </p>
          </div>
          
          <div className="hero-image-container">
            <img src={heroImage} alt="MCK Portrait" className="hero-image" />
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
