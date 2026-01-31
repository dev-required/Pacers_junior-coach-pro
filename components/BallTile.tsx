
import React, { useState, useRef, useEffect } from 'react';

interface BallTileProps {
  initialX: number;
  initialY: number;
}

const BallTile: React.FC<BallTileProps> = ({ initialX, initialY }) => {
  const [pos, setPos] = useState({ x: initialX, y: initialY });
  const [isDragging, setIsDragging] = useState(false);
  const tileRef = useRef<HTMLDivElement>(null);

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const parent = tileRef.current?.parentElement;
      if (!parent) return;

      const rect = parent.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * 100;
      const y = ((clientY - rect.top) / rect.height) * 100;

      const constrainedX = Math.max(2, Math.min(98, x));
      const constrainedY = Math.max(2, Math.min(98, y));

      setPos({ x: constrainedX, y: constrainedY });
    };

    const handleEnd = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleMove, { passive: false });
      window.addEventListener('touchend', handleEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging]);

  return (
    <div
      ref={tileRef}
      onMouseDown={handleStart}
      onTouchStart={handleStart}
      className={`absolute w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing shadow-2xl transition-transform border border-[#FF9100] touch-none z-50 bg-[#FF9100] ${isDragging ? 'scale-125' : 'hover:scale-110'}`}
      style={{
        left: `${pos.x}%`,
        top: `${pos.y}%`,
        transform: 'translate(-50%, -50%)',
        backgroundImage: 'radial-gradient(circle at 30% 30%, #FFB74D, #E65100)'
      }}
    >
      <div className="absolute w-full h-[1px] bg-black/40 rotate-45"></div>
      <div className="absolute w-full h-[1px] bg-black/40 -rotate-45"></div>
      <div className="absolute w-full h-[1px] bg-black/40"></div>
    </div>
  );
};

export default BallTile;
