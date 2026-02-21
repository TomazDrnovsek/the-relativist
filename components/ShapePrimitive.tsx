import React from 'react';
import { getBauhausShape } from '../utils/shapes';
import { BauhausShapeType } from '../types';

interface ShapePrimitiveProps {
  hue: number;
  color: string;
  isBauhausMode: boolean;
  hasBorder?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const ShapePrimitive: React.FC<ShapePrimitiveProps> = ({ 
  hue, 
  color, 
  isBauhausMode,
  hasBorder = false,
  className = '',
  style = {}
}) => {
  // 1. Standard Mode: Return a simple div (Truth to Materials)
  if (!isBauhausMode) {
    return (
      <div 
        className={className}
        style={{ 
          backgroundColor: color,
          ...style
        }} 
      />
    );
  }

  // 2. Bauhaus Mode: Render SVG Primitive
  const shape: BauhausShapeType = getBauhausShape(hue);

  // Full Bleed 64x64 Geometry (Maximum Visual Weight)
  // Added vectorEffect="non-scaling-stroke" for crisp 1px hairlines regardless of scaling
  const getShapePath = (s: BauhausShapeType) => {
    switch (s) {
      case 'square': 
        // 0°-40°: Full Bleed Square
        return <rect x="0" y="0" width="64" height="64" vectorEffect="non-scaling-stroke" />;
      
      case 'triangle': 
        // 46°-75°: Full width, full height (Base 64px)
        return <polygon points="32,0 64,64 0,64" vectorEffect="non-scaling-stroke" />;
      
      case 'trapezoid': 
        // 41°-45°: Wide base, touches bottom corners
        return <polygon points="12,0 52,0 64,64 0,64" vectorEffect="non-scaling-stroke" />;
      
      case 'rhombus': 
        // 76°-105°: Touches all 4 midpoints
        return <polygon points="32,0 64,32 32,64 0,32" vectorEffect="non-scaling-stroke" />;
        
      case 'l-beam': 
        // 106°-150°: Thick structural L, hugs bottom-left
        return <path d="M0,0 H24 V40 H64 V64 H0 Z" vectorEffect="non-scaling-stroke" />;
        
      case 'semi-circle': 
        // 151°-190°: Full width arch, vertically centered (Top at y=16, Bottom at y=48)
        return <path d="M0,48 A32,32 0 0,1 64,48 Z" vectorEffect="non-scaling-stroke" />;
        
      case 'circle': 
        // 191°-260°: Touches all 4 edges (Radius 32)
        return <circle cx="32" cy="32" r="32" vectorEffect="non-scaling-stroke" />;
        
      case 'capsule': 
        // 261°-300°: Full width, centered vertically
        return <rect x="0" y="16" width="64" height="32" rx="16" vectorEffect="non-scaling-stroke" />;
        
      case 'cross': 
        // 301°-340°: Thick bars (16px wide), full span
        return <path d="M24,0 H40 V24 H64 V40 H40 V64 H24 V40 H0 V24 H24 Z" vectorEffect="non-scaling-stroke" />;
        
      default: 
        // Fallback to Full Bleed Square
        return <rect x="0" y="0" width="64" height="64" vectorEffect="non-scaling-stroke" />;
    }
  };

  return (
    <div className={`${className} flex items-center justify-center`} style={style}>
        <svg 
            viewBox="0 0 64 64" 
            className="w-full h-full transition-all duration-300"
            style={{ 
                fill: color,
                stroke: hasBorder ? '#121212' : 'none',
                strokeWidth: hasBorder ? '0.8px' : '0', // Optical adjustment: 0.8px looks like 1px CSS border
                overflow: 'visible',
                transform: 'translateZ(0)',
            }}
        >
            {getShapePath(shape)}
        </svg>
    </div>
  );
};

export default ShapePrimitive;