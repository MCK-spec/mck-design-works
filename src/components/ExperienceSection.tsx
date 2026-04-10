import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import './ExperienceSection.css';
import '../styles/placeholder.css';
import { API_BASE } from '../utils/api';
import { useStore } from '../utils/useStore';

interface ExperienceItem {
  company: string;
  role: string;
  time: string;
  details: string[];
  tags: string[];
}

const defaultExperiences: ExperienceItem[] = [
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

const AccordionItem = ({ 
  item, 
  isOpen, 
  onClick 
}: { 
  item: ExperienceItem; 
  isOpen: boolean; 
  onClick: () => void;
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | undefined>(isOpen ? undefined : 0);

  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure content is rendered before measuring
      setTimeout(() => {
        if (contentRef.current) {
          setHeight(contentRef.current.scrollHeight);
        }
      }, 0);
    } else {
      setHeight(0);
    }
  }, [isOpen]);

  return (
    <div className={`experience-item ${isOpen ? 'is-open' : ''}`}>
      <div className="experience-item-header" onClick={onClick}>
        <div className="experience-header-left">
          <span className="experience-company">{item.company}</span>
          <span className="experience-role">{item.role}</span>
        </div>
        <div className="experience-header-right">
          <span className="experience-time">{item.time}</span>
          <span className="experience-arrow">↓</span>
        </div>
      </div>
      
      <div 
        className="experience-item-content-wrapper" 
        style={{ height: isOpen ? height : 0 }}
      >
        <div className="experience-item-content" ref={contentRef}>
          <div className="experience-details">
            {item.details.map((detail, idx) => (
              <p key={idx} className="experience-detail-line">{detail}</p>
            ))}
          </div>
          <div className="experience-tags">
            {item.tags.map((tag, idx) => (
              <span key={idx} className="experience-tag">{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const ExperienceSection = () => {
  const [openIndex, setOpenIndex] = useState<number>(0);
  const [apiList, setApiList] = useState<ExperienceItem[] | null>(null);
  const exp = useStore<any[]>('mck_experience', []);
  const normalize = (i: any): ExperienceItem => ({
    company: i?.company || '',
    role: i?.role || i?.position || '',
    time: i?.time || i?.period || '',
    details: Array.isArray(i?.details) ? i.details : (Array.isArray(i?.points) ? i.points : []),
    tags: Array.isArray(i?.tags) ? i.tags : []
  });
  useEffect(() => {
    fetch(`${API_BASE}/experiences`)
      .then(r => r.json())
      .then((arr: any[]) => {
        if (Array.isArray(arr) && arr.length) {
          setApiList(arr.map(normalize));
        } else {
          setApiList(null);
        }
      })
      .catch(() => setApiList(null));
  }, []);
  const list = apiList
    ? apiList
    : (Array.isArray(exp) && exp.length ? (exp as any[]).map(normalize) : defaultExperiences);

  const handleItemClick = (index: number) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <section className="experience-section">
      <div className="experience-corner-label">—— 实习经历</div>
      <motion.div 
        className="experience-content-container"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="experience-title-group">
          <h2 className="experience-title">
            <div className="experience-line">这是我真实的</div>
            <div className="experience-line"><span className="experience-highlight">实战经历</span></div>
            <div className="experience-line">在一线磨出来的</div>
          </h2>
        </div>

        <div className="experience-list">
          {(list.length ? list : defaultExperiences).map((exp, index) => (
            <AccordionItem 
              key={index} 
              item={exp} 
              isOpen={openIndex === index}
              onClick={() => handleItemClick(index)}
            />
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default ExperienceSection;
