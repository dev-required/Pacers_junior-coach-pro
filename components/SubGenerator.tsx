
import React, { useState, useEffect, useMemo } from 'react';
import { Player, Shift, RotationConfig } from '../types';
import { generateRotation } from '../utils/subLogic';
import { 
  Users, Clock, AlertCircle, ChevronDown, ChevronUp, 
  RefreshCcw, ArrowRightLeft, UserPlus, UserMinus, 
  Split, ToggleLeft, ToggleRight, Repeat, Info, CheckCircle2 
} from 'lucide-react';

interface SubGeneratorProps {
  players: Player[];
  config: RotationConfig;
  onConfigChange: (config: RotationConfig) => void;
  currentGameSeconds?: number;
}

const SubGenerator: React.FC<SubGeneratorProps> = ({ players, config, onConfigChange, currentGameSeconds = 0 }) => {
  const [isConfigExpanded, setIsConfigExpanded] = useState(false);
  const [calculatedShifts, setCalculatedShifts] = useState<Shift[]>([]);
  const [hasCalculated, setHasCalculated] = useState(false);

  // Initialization logic for Starting Five
  useEffect(() => {
    if (players.length >= config.playersOnCourt && config.startingIds.length === 0) {
      const initialStarters = players.slice(0, config.playersOnCourt).map(p => p.id);
      onConfigChange({ ...config, startingIds: initialStarters });
    }
  }, [players.length, config.playersOnCourt, config.startingIds.length, onConfigChange]);

  useEffect(() => {
    if (players.length >= config.playersOnCourt) {
      handleCalculate();
    }
  }, [players, config.playersOnCourt, config.startingIds, config.gameMinutes, config.periodLength, config.useHalves]);

  const handleCalculate = () => {
    const shifts = generateRotation(players, config);
    setCalculatedShifts(shifts);
    setHasCalculated(true);
  };

  const swapStarter = (playerId: string) => {
    const benchIds = players
      .filter(p => !config.startingIds.includes(p.id))
      .map(p => p.id);
      
    if (benchIds.length === 0) return;

    const nextBenchId = benchIds[0];
    const newStarters = config.startingIds.map(id => id === playerId ? nextBenchId : id);
    
    onConfigChange({ 
      ...config, 
      startingIds: newStarters 
    });
  };

  const formatSubTime = (period: number) => {
    const totalElapsedMins = (period - 1) * config.periodLength;
    const totalGameMins = config.gameMinutes;
    
    if (config.useHalves) {
      const halfMins = totalGameMins / 2;
      const remainingInHalf = halfMins - (totalElapsedMins % halfMins);
      return `${remainingInHalf}'`;
    }
    
    const remaining = totalGameMins - totalElapsedMins;
    return `${remaining}'`;
  };

  const isInvalid = config.periodLength <= 0 || config.gameMinutes <= 0;
  const halfTimePeriod = config.useHalves ? Math.ceil((config.gameMinutes / 2) / config.periodLength) : -1;

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="bg-[#003D3D] border border-[#002929] rounded-[32px] shadow-2xl overflow-hidden transition-all shrink-0">
        <button onClick={() => setIsConfigExpanded(!isConfigExpanded)} className="w-full p-8 flex items-center justify-between hover:bg-[#004E4E]/50 transition-colors">
          <div className="flex flex-col items-start">
            <h3 className="text-white text-sm font-black uppercase tracking-[0.2em] flex items-center gap-3">
              <Clock className="w-6 h-6 text-[#FF9100]" /> Rotation Logic
            </h3>
            <p className="text-[11px] text-teal-400 font-bold uppercase mt-1">
              {config.gameMinutes}m Game • {config.periodLength}m Shifts • <span className="text-[#FF9100]">{calculatedShifts.length} Windows</span> • {config.useHalves ? 'Halves' : 'Full'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex bg-[#004E4E] px-4 py-1.5 rounded-full border border-[#002929] text-[10px] font-black text-[#FF9100] uppercase tracking-widest">
              {calculatedShifts.length} Units
            </div>
            {isConfigExpanded ? <ChevronUp className="w-6 h-6 text-teal-200" /> : <ChevronDown className="w-6 h-6 text-teal-200" />}
          </div>
        </button>
        {isConfigExpanded && (
          <div className="px-8 pb-8 pt-0 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="space-y-3">
                <label className="text-[11px] text-teal-300 uppercase font-black tracking-widest ml-1">Total Game Minutes</label>
                <input type="number" name="gameMinutes" min="1" value={config.gameMinutes === 0 ? '' : config.gameMinutes} onChange={e => onConfigChange({...config, gameMinutes: parseInt(e.target.value)||0})} className="w-full bg-[#004E4E] border-2 border-[#002929] rounded-2xl p-5 text-base font-black focus:border-white outline-none transition-all text-white" />
              </div>
              <div className="space-y-3">
                <label className="text-[11px] text-teal-300 uppercase font-black tracking-widest ml-1">Shift Interval (m)</label>
                <input type="number" name="periodLength" min="1" value={config.periodLength === 0 ? '' : config.periodLength} onChange={e => onConfigChange({...config, periodLength: parseInt(e.target.value)||0})} className="w-full bg-[#004E4E] border-2 border-[#002929] rounded-2xl p-5 text-base font-black focus:border-white outline-none transition-all text-white" />
              </div>
            </div>
            <div onClick={() => onConfigChange({...config, useHalves: !config.useHalves})} className="flex items-center justify-between bg-[#004E4E] p-6 rounded-[24px] border-2 border-[#002929] cursor-pointer hover:border-teal-600 transition-colors group">
              <div className="flex items-center gap-5">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${config.useHalves ? 'bg-[#FF9100] text-white shadow-[0_0_20px_rgba(255,145,0,0.3)]' : 'bg-[#002929] text-teal-600 group-hover:text-teal-400'}`}>
                  <Split className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-sm font-black uppercase text-white tracking-widest">Two Halves Mode</p>
                  <p className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mt-0.5">Timer & Timeline reset at half-time</p>
                </div>
              </div>
              {config.useHalves ? <ToggleRight className="w-12 h-12 text-[#FF9100]" /> : <ToggleLeft className="w-12 h-12 text-teal-700" />}
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pr-2 no-scrollbar space-y-6">
        {isInvalid || players.length < config.playersOnCourt ? (
          <div className="bg-[#003D3D]/30 border-4 border-dashed border-[#002929] rounded-[48px] p-24 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-[#002929] rounded-[32px] flex items-center justify-center mb-8">
              <Info className="w-10 h-10 text-teal-500" />
            </div>
            <p className="text-teal-500 text-xl font-black uppercase tracking-widest leading-tight">Timeline Pending</p>
            <p className="text-teal-300 text-sm mt-4 max-w-xs font-bold">Please configure the match duration and ensure your roster is ready.</p>
          </div>
        ) : (
          <div className="space-y-16 pb-32">
            {calculatedShifts.map((shift, idx) => {
              const isStarting = idx === 0;
              const prevShift = idx > 0 ? calculatedShifts[idx - 1] : null;
              const goingOnIds = isStarting ? shift.players : shift.players.filter(p => !prevShift?.players.includes(p));
              const comingOffIds = isStarting ? [] : prevShift?.players.filter(p => !shift.players.includes(p)) || [];
              const isHalfTime = config.useHalves && shift.period === (halfTimePeriod + 1);
              
              const windowElapsedSeconds = (shift.period - 1) * config.periodLength * 60;
              const isPassed = currentGameSeconds > windowElapsedSeconds + 10;
              const isCurrent = currentGameSeconds >= windowElapsedSeconds && currentGameSeconds < windowElapsedSeconds + (config.periodLength * 60);

              return (
                <React.Fragment key={shift.period}>
                  {isHalfTime && (
                    <div className="relative py-14 flex items-center justify-center">
                      <div className="absolute inset-0 flex items-center"><div className="w-full border-t-4 border-dashed border-[#002929]"></div></div>
                      <div className="relative bg-[#004E4E] px-12 py-5 border-4 border-[#FF9100] rounded-full shadow-[0_0_50px_rgba(255,145,0,0.3)]">
                        <span className="text-base font-black uppercase text-[#FF9100] tracking-[0.6em] italic animate-pulse">2ND HALF START</span>
                      </div>
                    </div>
                  )}

                  <div className={`relative flex gap-10 transition-all duration-500 ${isPassed ? 'opacity-40 grayscale-[0.5]' : ''}`}>
                    <div className="flex flex-col items-center shrink-0">
                      <div className={`w-14 h-14 rounded-2xl border-2 flex flex-col items-center justify-center shadow-lg transition-all duration-500 ${
                        isCurrent ? 'bg-[#FF9100] border-white scale-105 shadow-orange-500/20' : 
                        isStarting ? 'bg-white border-white scale-105' : 
                        'bg-[#003D3D] border-[#002929]'
                      }`}>
                        <span className={`font-black text-lg italic leading-none ${isCurrent ? 'text-white' : isStarting ? 'text-zinc-950' : 'text-white'}`}>
                          {formatSubTime(shift.period)}
                        </span>
                        {isPassed && <CheckCircle2 className={`w-4 h-4 mt-0.5 ${isStarting ? 'text-zinc-950/40' : 'text-[#FF9100]'}`} />}
                      </div>
                      <div className={`w-1.5 flex-1 rounded-full mt-4 transition-colors duration-500 ${isCurrent ? 'bg-[#FF9100]' : 'bg-[#002929]'}`} />
                    </div>

                    <div className="flex-1 space-y-5">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                           <span className={`text-xl font-black uppercase tracking-tighter italic ${isCurrent ? 'text-[#FF9100]' : 'text-white'}`}>
                            {isStarting ? "Starting Five" : `Time Remaining: ${formatSubTime(shift.period)}`}
                           </span>
                           {isCurrent && (
                             <span className="bg-[#FF9100] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full animate-pulse">Active Shift</span>
                           )}
                         </div>
                      </div>

                      <div className={`bg-[#003D3D] border-2 rounded-[40px] overflow-hidden shadow-2xl transition-all duration-500 ${isCurrent ? 'border-[#FF9100] ring-4 ring-orange-500/10' : 'border-[#002929] hover:border-teal-800'}`}>
                        {!isStarting && (
                          <div className="grid grid-cols-2 border-b-2 border-[#002929]">
                             <div className="p-6 border-r-2 border-[#002929] bg-red-500/[0.02]">
                               <div className="flex items-center gap-3 mb-5">
                                 <div className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center">
                                   <UserMinus className="w-3.5 h-3.5 text-red-500" />
                                 </div>
                                 <span className="text-[10px] font-black text-red-500/60 uppercase tracking-widest">Heads to Bench</span>
                               </div>
                               <div className="flex flex-wrap gap-3">
                                 {comingOffIds.map(pid => {
                                   const p = players.find(x => x.id === pid);
                                   return (
                                     <div key={pid} className="bg-[#004E4E] px-3 py-2 rounded-xl border border-[#002929] shadow-sm flex items-center gap-3 transition-transform active:scale-95 group">
                                       <div className="bg-[#002929] text-teal-400 w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs border border-teal-800">
                                         {p?.number}
                                       </div>
                                       <span className="text-teal-200 font-bold text-[11px] uppercase truncate max-w-[80px]">{p?.name}</span>
                                     </div>
                                   );
                                 })}
                                 {comingOffIds.length === 0 && <span className="text-[10px] text-teal-700 font-black uppercase italic opacity-30">Static Unit</span>}
                               </div>
                             </div>
                             
                             <div className="p-6 bg-emerald-500/[0.02]">
                               <div className="flex items-center gap-3 mb-5">
                                 <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                   <UserPlus className="w-3.5 h-3.5 text-emerald-500" />
                                 </div>
                                 <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Enters Game</span>
                               </div>
                               <div className="flex flex-wrap gap-3">
                                 {goingOnIds.map(pid => {
                                   const p = players.find(x => x.id === pid);
                                   return (
                                     <div key={pid} className="bg-white px-3 py-2 rounded-xl flex items-center gap-3 shadow-lg transform active:scale-95 transition-all border border-zinc-200">
                                       <div className="bg-[#003D3D] text-white w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs">
                                         {p?.number}
                                       </div>
                                       <span className="text-[#003D3D] font-black text-[11px] uppercase truncate max-w-[80px]">{p?.name}</span>
                                     </div>
                                   );
                                 })}
                                 {goingOnIds.length === 0 && <span className="text-[10px] text-teal-700 font-black uppercase italic opacity-30">Static Unit</span>}
                               </div>
                             </div>
                          </div>
                        )}

                        <div className="p-8 bg-[#004E4E]/40">
                          <div className="flex items-center justify-between mb-5">
                            <span className="text-[11px] font-black text-teal-500 uppercase tracking-widest">
                              {isStarting ? "Set Starting Five" : "Unit Configuration"}
                            </span>
                            {isStarting && (
                              <div className="flex items-center gap-2 text-teal-500">
                                <Repeat className="w-3 h-3" />
                                <span className="text-[9px] font-bold uppercase">Swap with bench</span>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-4">
                            {shift.players.map(pid => {
                              const p = players.find(x => x.id === pid);
                              const isNew = goingOnIds.includes(pid);
                              return (
                                <div key={pid} className={`relative group px-5 py-3 rounded-2xl flex items-center gap-4 border-2 transition-all duration-300 ${
                                  isNew ? 'bg-white border-white scale-105 z-10 shadow-2xl' : 
                                  'bg-[#003D3D] border-[#002929] opacity-60'
                                }`}>
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${isNew ? 'bg-[#003D3D] text-white' : 'bg-[#002929] text-teal-500 border border-teal-800'}`}>
                                    {p?.number}
                                  </div>
                                  <span className={`font-black text-xs uppercase tracking-widest ${isNew ? 'text-[#003D3D]' : 'text-teal-400'}`}>{p?.name}</span>
                                  {isStarting && (
                                    <button 
                                      onClick={() => swapStarter(pid)} 
                                      className="ml-1 p-1.5 text-teal-400 hover:text-white hover:bg-white/10 rounded-lg transition-all active:rotate-180 duration-500"
                                      title="Swap with bench"
                                    >
                                      <Repeat className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubGenerator;
