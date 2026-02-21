import React, { useEffect, useRef } from 'react';

// Bauhaus Palette: Red, Blue, Yellow, Black
const COLORS = ['#D02028', '#1D4E89', '#EBB602', '#121212']; 

type ShapeType = 'circle' | 'square' | 'triangle';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  type: ShapeType;
  rotation: number;
  rotationSpeed: number;
  alpha: number;
  decay: number;
  filled: boolean;
}

interface WinEffectProps {
  isBauhausMode: boolean;
}

const WinEffect: React.FC<WinEffectProps> = ({ isBauhausMode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles: Particle[] = [];
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const createBurst = () => {
        const count = 50;
        
        for (let i = 0; i < count; i++) {
            let angle = Math.random() * Math.PI * 2;
            let type: ShapeType = 'square';

            if (isBauhausMode) {
                // Bauhaus Logic: Structured chaos.
                // 50% chance to snap angle to 45-degree increments (Constructivism)
                if (Math.random() > 0.5) {
                    const snap = Math.PI / 4; // 45 degrees
                    angle = Math.round(angle / snap) * snap;
                }

                // Random geometric primitive (Restricted to Square, Circle, Triangle)
                const types: ShapeType[] = ['circle', 'square', 'triangle'];
                type = types[Math.floor(Math.random() * types.length)];
            } else {
                // Square Mode: Only Squares
                type = 'square';
            }

            // Speed
            const speed = Math.random() * 15 + 4; 
            
            // Varied sizes
            const size = Math.random() < 0.2 ? Math.random() * 65 + 30 : Math.random() * 15 + 4;

            particles.push({
                x: centerX,
                y: centerY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: size,
                color: COLORS[Math.floor(Math.random() * COLORS.length)],
                type: type,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.1,
                alpha: 1,
                // Decay
                decay: 0.015 + Math.random() * 0.025,
                filled: Math.random() > 0.4 // Mix of solid forms and wireframes
            });
        }
    };

    createBurst();

    let animationId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        
        // Strong Friction for a "Punchy" stop
        p.vx *= 0.90;
        p.vy *= 0.90;

        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.alpha;

        if (p.filled) {
            ctx.fillStyle = p.color;
        } else {
            ctx.strokeStyle = p.color;
            ctx.lineWidth = 2.5; // Slightly thinner line width
        }

        ctx.beginPath();

        switch (p.type) {
            case 'circle':
                ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                break;
            case 'square':
                ctx.rect(-p.size / 2, -p.size / 2, p.size, p.size);
                break;
            case 'triangle':
                const h = p.size * (Math.sqrt(3)/2);
                ctx.moveTo(0, -h/2);
                ctx.lineTo(-p.size/2, h/2);
                ctx.lineTo(p.size/2, h/2);
                ctx.closePath();
                break;
        }

        if (p.filled) ctx.fill();
        else ctx.stroke();

        ctx.restore();
      }

      if (particles.length > 0) {
        animationId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, [isBauhausMode]);

  return (
    <canvas 
        ref={canvasRef} 
        className="absolute inset-0 z-40 pointer-events-none mix-blend-multiply" 
    />
  );
};

export default WinEffect;