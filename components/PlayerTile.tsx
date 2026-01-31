
import React, { useState, useRef, useEffect } from 'react';

interface PlayerTileProps {
  number: string;
  initialX: number;
  initialY: number;
  onPositionChange: (x: number, y: number) => void;
  team: 'home' | 'away';
}

const PlayerTile: React.FC<PlayerTileProps> = ({ number, initialX, initialY, onPositionChange, team }) => {
  const [pos, setPos] = useState({ x: initialX, y: initialY });
  const [isDragging, setIsDragging] = useState(false);
  const tileRef = useRef<HTMLDivElement>(null);

  // Sync with props when external state changes
  useEffect(() => {
    if (!isDragging) {
      setPos({ x: initialX, y: initialY });
    }
  }, [initialX, initialY, isDragging]);

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
      onPositionChange(constrainedX, constrainedY);
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
  }, [isDragging, onPositionChange]);

  // Home = Light Grey, Away = Pacers Green (#005C5C)
  const bgColor = team === 'home' ? 'bg-zinc-300' : 'bg-[#005C5C]';
  const textColor = team === 'home' ? 'text-zinc-900' : 'text-white';
  const borderColor = team === 'home' ? 'border-zinc-400' : 'border-[#003D3D]';

  return (
    <div
      ref={tileRef}
      onMouseDown={handleStart}
      onTouchStart={handleStart}
      className={`absolute w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing shadow-2xl transition-transform border-2 touch-none before:content-[''] before:absolute before:-inset-4 before:rounded-full ${bgColor} ${borderColor} ${isDragging ? 'scale-125 z-50 ring-8 ring-white/5' : 'z-10 hover:scale-105 active:scale-110'}`}
      style={{
        left: `${pos.x}%`,
        top: `${pos.y}%`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <span className={`font-black text-lg md:text-2xl leading-none select-none ${textColor}`}>{number}</span>
    </div>
  );
};

export default PlayerTile;
