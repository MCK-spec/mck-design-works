import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './ServicesList.css';

const services = [
  { id: '01', name: '整合营销案例', rotation: -5 },
  { id: '02', name: '品牌与包装设计', rotation: 8 },
  { id: '03', name: 'IP形象设计', rotation: -12 },
  { id: '04', name: 'UI界面设计', rotation: 15 },
  { id: '05', name: 'AIGC视觉设计', rotation: -8 },
];

const ServicesList = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section id="portfolio" className="services-section">
      <div className="corner-label services-corner">
        <span className="corner-line"></span>
        <span className="corner-text">目录</span>
      </div>

      <div className="services-list-container">
        {services.map((service, index) => (
          <div 
            key={service.id} 
            className="service-row"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div className="service-content">
              <span className="service-number">({service.id})</span>
              <span className="service-name">{service.name}</span>
            </div>

            {/* Hover Preview Card */}
            <AnimatePresence>
              {hoveredIndex === index && (
                <motion.div 
                  className="service-preview-card"
                  initial={{ opacity: 0, scale: 0.95, y: '-50%', rotate: 0 }}
                  animate={{ opacity: 1, scale: 1, y: '-50%', rotate: service.rotation }}
                  exit={{ opacity: 0, scale: 0.95, y: '-50%', rotate: 0 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                  <div className="preview-placeholder">
                    <span className="preview-text">{service.name} Preview</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ServicesList;
