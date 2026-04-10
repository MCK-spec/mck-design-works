import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Intro.css';

const Intro = () => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Sequence timing
    const timers = [
      setTimeout(() => setStep(1), 1500), // 1.5秒开始隐藏第一句标语
      setTimeout(() => setStep(2), 2000), // 2.0秒显示第二句标语
      setTimeout(() => setStep(3), 3500), // 3.5秒开始隐藏第二句标语
      setTimeout(() => setStep(4), 4000), // 4.0秒显示第三句标语
      setTimeout(() => setStep(5), 5500), // 5.5秒开始隐藏第三句标语
      setTimeout(() => setStep(6), 6000), // 6.0秒显示第四句标语
      setTimeout(() => setStep(7), 7500), // 7.5秒开始隐藏第四句标语
      setTimeout(() => setStep(8), 8000), // 8.0秒开始合并两侧文字
    ];

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <motion.div 
      className="hero-container"
      exit={{ y: "-100vh" }}
      transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
    >
      {/* Background and Slogans */}
      <div className="slogan-container">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="slogan1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="slogan-text"
            >
              MARKETING DESIGN
            </motion.div>
          )}
          {step === 2 && (
            <motion.div
              key="slogan2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="slogan-text"
            >
              BRAND VISUAL DESIGN
            </motion.div>
          )}
          {step === 4 && (
            <motion.div
              key="slogan3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="slogan-text"
            >
              IP CHARACTER DESIGN
            </motion.div>
          )}
          {step === 6 && (
            <motion.div
              key="slogan4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="slogan-text"
            >
              UI DESIGN
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Title */}
      <motion.div 
        className="title-container"
        style={{
          justifyContent: step >= 8 ? 'center' : 'space-between',
        }}
        layout
      >
        <motion.div
          layoutId="logo-mck"
          layout
          className="title-part"
          animate={{
            scale: step >= 8 ? 1.3 : 1,
            originX: 1,
            originY: 0.5
          }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
        >
          MCK
        </motion.div>
        
        <motion.div
          layoutId="logo-design"
          layout
          className="title-part"
          animate={{
            scale: step >= 8 ? 1.3 : 1,
            originX: 0,
            originY: 0.5
          }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
        >
          Design
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Intro;
