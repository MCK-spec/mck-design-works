import './Footer.css';
import { useStore } from '../utils/useStore';
import { useEffect } from 'react';
import { store } from '../utils/store';
import { API_BASE } from '../utils/api';

const Footer = () => {
  const footer = useStore<any>('mck_footer', {});
  const contact = useStore<any>('mck_contact', {});
  useEffect(() => {
    fetch(`${API_BASE}/footer`, { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) store.set('mck_footer', data); })
      .catch(() => {});
    fetch(`${API_BASE}/contact`, { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) store.set('mck_contact', data); })
      .catch(() => {});
  }, []);
  const brand = footer?.brand || 'MCK Design';
  const year = footer?.year || String(new Date().getFullYear());
  const ctaLine1 = footer?.ctaLine1 || '待填写...';
  const ctaLine2 = footer?.ctaLine2 || '待填写...';
  const ctaBtn = footer?.ctaBtn || '联系我';
  const wechat = contact?.wechat || '待填写...';
  return (
    <footer id="contact" className="site-footer">
      {/* Top CTA Area */}
      <div className="cta-container">
        <div className="cta-content">
          <div className="cta-text-area">
            <h2 className="cta-title">
              {ctaLine1}<br />
              {ctaLine2}
            </h2>
            <button className="cta-button">{ctaBtn}</button>
          </div>
          
          <div className="cta-decoration-area">
            <svg className="spinning-text" viewBox="0 0 200 200" width="200" height="200">
              <defs>
                <path
                  id="circlePath"
                  d="M 100, 100
                     m -75, 0
                     a 75,75 0 1,1 150,0
                     a 75,75 0 1,1 -150,0"
                />
              </defs>
              <text fill="#ffffff" fontSize="18" letterSpacing="3" fontWeight="600">
                <textPath href="#circlePath" startOffset="0%">
                  THANK YOU FOR WATCHING. THANK YOU FOR WATCHING. 
                </textPath>
              </text>
            </svg>
          </div>
        </div>
      </div>

      {/* Footer Bottom Section */}
      <div className="footer-bottom">
        <div className="footer-col footer-left">
          <div className="footer-logo">{brand}</div>
          <div className="footer-copyright">
            © {year} MCK Brand Design. All rights reserved.
          </div>
        </div>

        <div className="footer-col footer-center">
          <nav className="footer-nav">
            <a href="#about-me">关于我</a>
            <a href="#portfolio">目录</a>
            <a href="#selected-work">精选作品</a>
            <a href="#all-works">全部作品</a>
            <a href="#honors">荣誉</a>
          </nav>
        </div>

        <div className="footer-col footer-right">
          <div className="footer-social">
            <span>微信号：{wechat}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
