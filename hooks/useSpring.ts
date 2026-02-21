import { useState, useEffect, useRef } from 'react';

interface SpringConfig {
  stiffness: number;
  damping: number;
  mass: number;
  precision: number;
}

const DEFAULT_CONFIG: SpringConfig = {
  stiffness: 170, // High stiffness for snappy "Swiss" feel
  damping: 26,    // Critical damping to prevent wobble
  mass: 1,
  precision: 0.005
};

export function useSpring(targetValue: number, config: Partial<SpringConfig> = {}) {
  const [value, setValue] = useState(targetValue);
  const velocity = useRef(0);
  const current = useRef(targetValue);
  const rafRef = useRef<number | null>(null);
  const lastTime = useRef<number | null>(null);
  
  // Merge config
  const { stiffness, damping, mass, precision } = { ...DEFAULT_CONFIG, ...config };

  useEffect(() => {
    const animate = (time: number) => {
      if (lastTime.current === null) {
        lastTime.current = time;
        rafRef.current = requestAnimationFrame(animate);
        return;
      }
      
      // Calculate delta time in seconds, capped at 50ms to prevent instability
      const dt = Math.min((time - lastTime.current) / 1000, 0.05);
      lastTime.current = time;

      const displacement = current.current - targetValue;
      const springForce = -stiffness * displacement;
      const dampingForce = -damping * velocity.current;
      const acceleration = (springForce + dampingForce) / mass;

      velocity.current += acceleration * dt;
      current.current += velocity.current * dt;

      // Check for equilibrium
      if (Math.abs(displacement) < precision && Math.abs(velocity.current) < precision) {
        current.current = targetValue;
        setValue(targetValue);
        rafRef.current = null;
        lastTime.current = null;
        return; 
      }

      setValue(current.current);
      rafRef.current = requestAnimationFrame(animate);
    };

    if (rafRef.current === null) {
        lastTime.current = null;
        rafRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (rafRef.current !== null) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
      }
    };
  }, [targetValue, stiffness, damping, mass, precision]);

  return value;
}
