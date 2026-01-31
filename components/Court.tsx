
import React, { useRef, useEffect, useState } from 'react';
import PlayerTile from './PlayerTile';
import BallTile from './BallTile';
import { Player } from '../types';
import { Pencil, Move, Eraser } from 'lucide-react';

interface CourtProps {
  players: Player[];
  onPlayerMove: (id: string, x: number, y: number) => void;
}

const Court: React.FC<CourtProps> = ({ players, onPlayerMove }) => {
  const [mode, setMode] = useState<'move' | 'draw'>('move');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas internal size to match displayed size
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      const context = canvas.getContext('2d');
      if (context) {
        context.scale(window.devicePixelRatio, window.devicePixelRatio);
        context.lineCap = 'round';
        context.strokeStyle = 'white';
        context.lineWidth = 3;
        contextRef.current = context;
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (mode !== 'draw') return;
    isDrawing.current = true;
    
    const canvas = canvasRef.current;
    if (!canvas || !contextRef.current) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    contextRef.current.beginPath();
    contextRef.current.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing.current || mode !== 'draw') return;
    
    const canvas = canvasRef.current;
    if (!canvas || !contextRef.current) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    contextRef.current.lineTo(clientX - rect.left, clientY - rect.top);
    contextRef.current.stroke();
  };

  const stopDrawing = () => {
    isDrawing.current = false;
    contextRef.current?.closePath();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas && contextRef.current) {
      contextRef.current.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  return (
    <div className="relative w-full aspect-[15/14] bg-[#005C5C] rounded-2xl overflow-hidden shadow-[0_0_50px_-12px_rgba(0,0,0,0.8)] border-4 border-[#002929] touch-none">
      {/* Basketball Court SVG Background - Lines reverted to white on Green */}
      <svg viewBox="0 0 500 470" className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
        <rect x="0" y="0" width="500" height="470" fill="none" stroke="white" strokeWidth="2" />
        <line x1="0" y1="470" x2="500" y2="470" stroke="white" strokeWidth="2" />
        <rect x="170" y="280" width="160" height="190" fill="none" stroke="white" strokeWidth="2" />
        <line x1="170" y1="330" x2="330" y2="330" stroke="white" strokeWidth="1" strokeDasharray="4 4" />
        <circle cx="250" y="280" r="60" fill="none" stroke="white" strokeWidth="2" />
        <path d="M 45,470 L 45,380 A 205,205 0 0 1 455,380 L 455,470" fill="none" stroke="white" strokeWidth="2" />
        <line x1="220" y1="430" x2="280" y2="430" stroke="white" strokeWidth="2" />
        <circle cx="250" y="415" r="15" fill="none" stroke="white" strokeWidth="2" />
      </svg>

      {/* Modern Grid Overlay */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* Canvas Layer */}
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        className={`absolute inset-0 w-full h-full z-30 ${mode === 'draw' ? 'cursor-crosshair' : 'pointer-events-none'}`}
      />

      {/* Players Layer */}
      <div className={`absolute inset-0 ${mode === 'draw' ? 'opacity-50 pointer-events-none' : 'z-40'}`}>
        {players.map((p) => (
          <PlayerTile
            key={p.id}
            number={p.team === 'home' ? '' : p.number}
            initialX={p.position.x}
            initialY={p.position.y}
            team={p.team}
            onPositionChange={(x, y) => onPlayerMove(p.id, x, y)}
          />
        ))}
        <BallTile initialX={50} initialY={40} />
      </div>

      {/* Drawing Controls Overlay */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-50">
        <div className="bg-[#003D3D]/80 backdrop-blur-md p-1.5 rounded-2xl border border-[#002929] flex flex-col gap-1">
          <button 
            onClick={() => setMode('move')}
            className={`p-3 rounded-xl transition-all ${mode === 'move' ? 'bg-white text-[#003D3D] shadow-lg' : 'text-teal-200 hover:text-white'}`}
          >
            <Move className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setMode('draw')}
            className={`p-3 rounded-xl transition-all ${mode === 'draw' ? 'bg-white text-[#003D3D] shadow-lg' : 'text-teal-200 hover:text-white'}`}
          >
            <Pencil className="w-5 h-5" />
          </button>
          <div className="h-px bg-[#004E4E] mx-2" />
          <button 
            onClick={clearCanvas}
            className="p-3 rounded-xl text-teal-200 hover:text-red-400 hover:bg-red-400/10 transition-all"
          >
            <Eraser className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* Mode Indicator Toast (Top Left) */}
      <div className="absolute top-4 left-4 z-50">
        <div className="bg-[#003D3D]/80 backdrop-blur-md px-4 py-2 rounded-full border border-[#002929]">
           <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white flex items-center gap-2">
             <div className={`w-2 h-2 rounded-full ${mode === 'draw' ? 'bg-red-500 animate-pulse' : 'bg-[#FF9100]'}`} />
             {mode === 'move' ? 'Move Mode' : 'Draw Mode'}
           </span>
        </div>
      </div>
    </div>
  );
};

export default Court;
