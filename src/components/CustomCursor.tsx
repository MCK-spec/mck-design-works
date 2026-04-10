import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './CustomCursor.css';

interface TrailPoint {
  x: number;
  y: number;
  age: number;
  maxAge: number;
}

const CustomCursor = () => {
  const innerCursorRef = useRef<HTMLDivElement>(null);
  const outerCursorRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isHovering, setIsHovering] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Mouse position state for the logic
  const mouse = useRef({ x: -100, y: -100 });
  const outerMouse = useRef({ x: -100, y: -100 });
  
  // Trail state
  const trails = useRef<TrailPoint[]>([]);

  useEffect(() => {
    // Check if it's a touch device
    const checkTouch = () => {
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };
    checkTouch();

    if (isTouchDevice) return;

    // Handle mouse move
    const onMouseMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;

      // Update inner cursor immediately
      if (innerCursorRef.current) {
        innerCursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }

      // Add point to trail
      trails.current.push({
        x: e.clientX,
        y: e.clientY,
        age: 0,
        maxAge: 30 // ~500ms at 60fps
      });
    };

    // Handle hover states on clickable elements
    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Check if hovering over a, button, or elements with cursor: pointer
      if (
        target.tagName.toLowerCase() === 'a' ||
        target.tagName.toLowerCase() === 'button' ||
        target.closest('a') ||
        target.closest('button') ||
        window.getComputedStyle(target).cursor === 'pointer'
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseover', onMouseOver);

    // Animation loop for outer cursor and canvas trail
    let animationFrameId: number;

    const render = () => {
      // Lerp for outer cursor
      outerMouse.current.x += (mouse.current.x - outerMouse.current.x) * 0.15;
      outerMouse.current.y += (mouse.current.y - outerMouse.current.y) * 0.15;

      if (outerCursorRef.current) {
        outerCursorRef.current.style.transform = `translate3d(${outerMouse.current.x}px, ${outerMouse.current.y}px, 0)`;
      }

      // Render Canvas Trail
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Resize canvas if needed
          if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
          }

          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Update and draw trails
          for (let i = 0; i < trails.current.length; i++) {
            const p = trails.current[i];
            p.age += 1;

            if (p.age >= p.maxAge) {
              trails.current.splice(i, 1);
              i--;
              continue;
            }

            const lifeProgress = p.age / p.maxAge;
            const size = 8 - (6 * lifeProgress); // 8px down to 2px
            const opacity = 0.5 * (1 - lifeProgress);

            ctx.beginPath();
            ctx.arc(p.x, p.y, size / 2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 191, 165, ${opacity})`;
            ctx.fill();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', onMouseOver);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isTouchDevice]);

  if (isTouchDevice) return null;

  const cursorContent = (
    <>
      <canvas ref={canvasRef} className="cursor-canvas-trail" />
      <div 
        ref={outerCursorRef} 
        className={`cursor-outer ${isHovering ? 'hover' : ''}`} 
      />
      <div 
        ref={innerCursorRef} 
        className={`cursor-inner ${isHovering ? 'hover' : ''}`} 
      />
    </>
  );

  return createPortal(cursorContent, document.body);
};

export default CustomCursor;
