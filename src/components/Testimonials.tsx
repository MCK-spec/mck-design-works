import { useState, useEffect, useRef } from 'react';
import './Testimonials.css';

const testimonialsData = [
  {
    id: 1,
    text: "他是一位出色的设计师，在品牌视觉系统方面非常专业。从组件搭建到文档规范，每个环节都处理得非常到位，和他合作非常高效。",
    name: "ZHANG WEI",
    title: "Brand Director",
    rotation: -2
  },
  {
    id: 2,
    text: "他在 Figma 里的操作速度惊人，跟他合作就像看魔术一样。对品牌细节的把控力让人印象深刻。",
    name: "LI NA",
    title: "Senior Visual Designer",
    rotation: 1
  },
  {
    id: 3,
    text: "他不只是一个执行者，他真正理解品牌策略，能把创意想法落地成完整的视觉系统，是团队里不可缺少的人。",
    name: "CHEN HAO",
    title: "Creative Director",
    rotation: -1.5
  }
];

const Testimonials = () => {
  const [activeIndex, setActiveIndex] = useState(-1);
  const [showGroup, setShowGroup] = useState(false); // 新增：是否显示最终的三卡片合影
  const [hasPlayed, setHasPlayed] = useState(false); // 新增：是否已经完整播放过一次
  
  const sectionRef = useRef<HTMLElement>(null);
  const isLockedRef = useRef(false);
  const activeIndexRef = useRef(-1);
  const showGroupRef = useRef(false); // Ref for event listeners
  const hasPlayedRef = useRef(false); // Ref for event listeners

  // Keep ref in sync with state for event listeners
  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    showGroupRef.current = showGroup;
  }, [showGroup]);

  useEffect(() => {
    hasPlayedRef.current = hasPlayed;
  }, [hasPlayed]);

  useEffect(() => {
    let lastWheelTime = 0;
    let scrollTicks = 0; // 新增滚动计数器
    
    // 监听滚轮事件以拦截页面滚动
    const handleWheel = (e: WheelEvent) => {
      // 如果已经完整播放过一次，直接退出，不再拦截页面滚动
      if (hasPlayedRef.current) return;
      if (!sectionRef.current) return;
      
      const { top, bottom } = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // 扩大检测范围，防止过快滑动错过。
      // 只要板块顶部在视口上半部分，或者整个板块占据了大部分视口，就认为应该开始锁定
      const isPinned = (top <= 100 && top >= -windowHeight / 2) || (top < 0 && bottom > windowHeight);
      
      // 如果还没进入锁定状态，检查是否需要锁定
      if (!isLockedRef.current) {
        if (isPinned) {
          // 向下滚且未到达最终合影状态，或向上滚且未退回到最初状态
          if ((e.deltaY > 0 && !showGroupRef.current) || 
              (e.deltaY < 0 && (showGroupRef.current || activeIndexRef.current > -1))) {
            isLockedRef.current = true;
            scrollTicks = 0; // 刚进入锁定状态时重置计数器
            
            // 强制将页面精确锁定到该板块的顶部
            // 先尝试把 top 对齐，考虑到如果滚动过快可能 top 已经是负数，所以要平滑归位
            window.scrollTo({
              top: window.scrollY + top,
              behavior: 'auto' // 使用 auto 快速归位
            });
          }
        }
      }

      // 如果当前处于锁定状态
      if (isLockedRef.current) {
        // 强制阻止页面滚动
        e.preventDefault();
        
        // 进一步强制固定位置，防止有些触摸板产生惯性滚动逃脱
        window.scrollTo({
          top: window.scrollY + sectionRef.current.getBoundingClientRect().top,
          behavior: 'instant'
        });

        // 节流处理，防止一次过快的连续滚动导致计数异常
        const now = Date.now();
        if (now - lastWheelTime < 50) return; // 50ms防抖
        lastWheelTime = now;
        
        // 必须有足够的滚动强度才算一次有效滚动 (tick)
        if (Math.abs(e.deltaY) < 5) return;

        // 根据滚动方向累加或减少 ticks
        if (e.deltaY > 0) {
          scrollTicks += 1;
        } else {
          scrollTicks -= 1;
        }

        // 判断是否积累了足够的 ticks (1 下) 来切换状态
        if (scrollTicks >= 1) {
          // 向下切换
          if (activeIndexRef.current < 2) {
            // 正常切换单张卡片
            setActiveIndex(prev => prev + 1);
            scrollTicks = 0;
            lastWheelTime = Date.now() + 600; 
          } else if (!showGroupRef.current) {
            // 3张全播完了，进入最终合影状态
            setShowGroup(true);
            scrollTicks = 0;
            lastWheelTime = Date.now() + 600;
          } else {
            // 合影状态也播完了，解除锁定，允许页面向下滚，并标记已播放完毕
            isLockedRef.current = false;
            setHasPlayed(true);
            scrollTicks = 0;
          }
        } else if (scrollTicks <= -1) {
          // 向上切换
          if (showGroupRef.current) {
            // 从合影状态退回到第3张单卡状态
            setShowGroup(false);
            scrollTicks = 0;
            lastWheelTime = Date.now() + 600;
          } else if (activeIndexRef.current > -1) {
            // 正常回退单张卡片
            setActiveIndex(prev => prev - 1);
            scrollTicks = 0;
            lastWheelTime = Date.now() + 600; 
          } else {
            // 回退完了，解除锁定，允许页面向上滚
            isLockedRef.current = false;
            scrollTicks = 0;
          }
        }
      }
    };

    // 必须设置为 passive: false 才能 preventDefault
    window.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, [hasPlayed]);

  const marqueeText = "HONORS & AWARDS ";
  
  // 如果 activeIndex 为 -1，说明卡片还没出现，此时背景文字高亮显示纯白
  const isMarqueeHighlight = activeIndex === -1;

  return (
    <section id="honors" className="testimonials-section" ref={sectionRef}>
      <div className="corner-label testimonials-corner">
        <span className="corner-text" style={{ color: '#00BFA5' }}>—— 奖项&荣誉</span>
      </div>

      <div className={`bg-marquee-container ${isMarqueeHighlight ? 'highlight' : ''}`}>
        <div className="bg-marquee-content">
          {marqueeText.repeat(10)}
        </div>
        <div className="bg-marquee-content">
          {marqueeText.repeat(10)}
        </div>
      </div>

      <div className="testimonials-sticky-wrapper">
        <div className={`testimonials-content ${showGroup ? 'show-group' : ''}`}>
          <div className="testimonial-card-wrapper">
            {testimonialsData.map((item, index) => {
              // Determine card state based on index relation to activeIndex
              let cardState = 'hidden-bottom';
              if (showGroup) {
                cardState = `group-card group-card-${index + 1}`;
              } else if (index === activeIndex) {
                cardState = 'active';
              } else if (index < activeIndex) {
                cardState = 'hidden-top';
              }

              return (
                <div
                  key={item.id}
                  className={`testimonial-card ${cardState}`}
                  style={{ 
                    '--card-rotation': showGroup ? '0deg' : `${item.rotation}deg` 
                  } as React.CSSProperties}
                >
                  <span className="quote-mark">"</span>
                  <p className="testimonial-text">{item.text}</p>
                  <div className="testimonial-author">
                    <span className="author-name">{item.name}</span>
                    <span className="author-title">{item.title}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
