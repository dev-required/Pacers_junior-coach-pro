
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Trash2, Layout, RefreshCw, Shield, ShieldAlert, Save, PlayCircle, History, X, Users, Settings2, UserRoundPlus, Anchor, Check, Play, Pause, Timer, Bell, Volume2, Info, Wifi, WifiOff, Swords, ShieldCheck, Library, ChevronLeft } from 'lucide-react';
import Court from './components/Court';
import BallTile from './components/BallTile';
import SubGenerator from './components/SubGenerator';
import RosterManager from './components/RosterManager';
import { Player, RotationConfig, Play as PlayType, Shift } from './types';
import { generateRotation } from './utils/subLogic';

const INITIAL_PLAYERS: Player[] = [
  // Home Team (1-5)
  { id: 'h1', name: 'Player 1', number: '', position: { x: 50, y: 75 }, team: 'home', available: true },
  { id: 'h2', name: 'Player 2', number: '', position: { x: 20, y: 60 }, team: 'home', available: true },
  { id: 'h3', name: 'Player 3', number: '', position: { x: 80, y: 60 }, team: 'home', available: true },
  { id: 'h4', name: 'Player 4', number: '', position: { x: 10, y: 30 }, team: 'home', available: true },
  { id: 'h5', name: 'Player 5', number: '', position: { x: 90, y: 30 }, team: 'home', available: true },
  // Away Team (1-5)
  { id: 'a1', name: 'Away 1', number: '1', position: { x: 50, y: 60 }, team: 'away', available: true },
  { id: 'a2', name: 'Away 2', number: '2', position: { x: 30, y: 50 }, team: 'away', available: true },
  { id: 'a3', name: 'Away 3', number: '3', position: { x: 70, y: 50 }, team: 'away', available: true },
  { id: 'a4', name: 'Away 4', number: '4', position: { x: 20, y: 35 }, team: 'away', available: true },
  { id: 'a5', name: 'Away 5', number: '5', position: { x: 80, y: 35 }, team: 'away', available: true },
];

// Coordinates for Offence Mode (White team attacking)
const OFFENCE_SETUP = [
  // Home (Attacking - 5 Out)
  { id: 'h1', x: 50, y: 80 }, // Top
  { id: 'h2', x: 15, y: 65 }, // Wing L
  { id: 'h3', x: 85, y: 65 }, // Wing R
  { id: 'h4', x: 8, y: 25 },  // Corner L
  { id: 'h5', x: 92, y: 25 }, // Corner R
  // Away (Defending - Man/Pack)
  { id: 'a1', x: 50, y: 65 },
  { id: 'a2', x: 25, y: 55 },
  { id: 'a3', x: 75, y: 55 },
  { id: 'a4', x: 20, y: 35 },
  { id: 'a5', x: 80, y: 35 },
];

// Coordinates for Defence Mode (White team defending)
const DEFENCE_SETUP = [
  // Home (Defending - 2-3 Zone / Shell)
  { id: 'h1', x: 35, y: 65 }, // Top L
  { id: 'h2', x: 65, y: 65 }, // Top R
  { id: 'h3', x: 15, y: 35 }, // Bottom L
  { id: 'h4', x: 50, y: 45 }, // Middle
  { id: 'h5', x: 85, y: 35 }, // Bottom R
  // Away (Attacking - 5 Out)
  { id: 'a1', x: 50, y: 85 },
  { id: 'a2', x: 15, y: 70 },
  { id: 'a3', x: 85, y: 70 },
  { id: 'a4', x: 5, y: 25 },
  { id: 'a5', x: 95, y: 25 },
];

const STORAGE_KEYS = {
  PLAYERS: 'coach_pro_players_v2',
  PLAYS: 'coach_pro_plays',
  DEFAULT_LAYOUT: 'coach_pro_default_layout'
};

const App: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PLAYERS);
    return saved ? JSON.parse(saved) : INITIAL_PLAYERS;
  });

  const [plays, setPlays] = useState<PlayType[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PLAYS);
    return saved ? JSON.parse(saved) : [];
  });

  const [activeTab, setActiveTab] = useState<'court' | 'subs' | 'roster'>('court');
  const [activeTeam, setActiveTeam] = useState<'home' | 'away'>('home'); // For Roster Management
  const [boardMode, setBoardMode] = useState<'offence' | 'defence'>('offence'); // For Tactics Board
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  
  const [rotationConfig, setRotationConfig] = useState<RotationConfig>({
    gameMinutes: 40,
    playersOnCourt: 5,
    periodLength: 5,
    useHalves: true,
    startingIds: []
  });

  const [gameSeconds, setGameSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showSubAlert, setShowSubAlert] = useState(false);
  const lastAlertTimeRef = useRef<number>(-1);

  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerNum, setNewPlayerNum] = useState('');
  const [isSavingPlay, setIsSavingPlay] = useState(false);
  const [playName, setPlayName] = useState('');
  const [isSettingDefault, setIsSettingDefault] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players));
  }, [players]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PLAYS, JSON.stringify(plays));
  }, [plays]);

  const playBuzzer = useCallback(() => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(120, audioCtx.currentTime);
      oscillator.frequency.linearRampToValueAtTime(80, audioCtx.currentTime + 0.8);
      gainNode.gain.setValueAtTime(0.4, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.8);
      if (navigator.vibrate) {
        navigator.vibrate([300, 100, 300, 100, 300]); 
      }
    } catch (e) {
      console.warn("Audio/Haptics failed", e);
    }
  }, []);

  useEffect(() => {
    let interval: number;
    if (isTimerRunning) {
      interval = window.setInterval(() => {
        setGameSeconds(prev => {
          const totalMax = rotationConfig.gameMinutes * 60;
          if (prev >= totalMax) {
            setIsTimerRunning(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, rotationConfig.gameMinutes]);

  const nextSubSeconds = useMemo(() => {
    const periodInSeconds = rotationConfig.periodLength * 60;
    if (periodInSeconds <= 0) return null;
    const currentPeriod = Math.floor(gameSeconds / periodInSeconds);
    return (currentPeriod + 1) * periodInSeconds;
  }, [gameSeconds, rotationConfig.periodLength]);

  const upcomingSubDetails = useMemo(() => {
    if (!nextSubSeconds) return null;
    const homeAvailable = players.filter(p => p.team === 'home' && p.available);
    if (homeAvailable.length === 0) return null;
    const shifts = generateRotation(homeAvailable, rotationConfig);
    const nextPeriodIndex = Math.floor(nextSubSeconds / (rotationConfig.periodLength * 60));
    if (nextPeriodIndex >= shifts.length) return null;
    const currentShift = shifts[nextPeriodIndex - 1];
    const nextShift = shifts[nextPeriodIndex];
    if (!currentShift || !nextShift) return null;
    const comingOn = nextShift.players.filter(id => !currentShift.players.includes(id));
    const goingOff = currentShift.players.filter(id => !nextShift.players.includes(id));
    return {
      comingOn: comingOn.map(id => players.find(p => p.id === id)).filter(Boolean) as Player[],
      goingOff: goingOff.map(id => players.find(p => p.id === id)).filter(Boolean) as Player[]
    };
  }, [nextSubSeconds, players, rotationConfig]);

  useEffect(() => {
    if (!nextSubSeconds) return;
    const diff = nextSubSeconds - gameSeconds;
    if (diff <= 30 && diff > -5) {
      if (!showSubAlert) {
        setShowSubAlert(true);
        const subWindowId = Math.floor(nextSubSeconds / 60);
        if (lastAlertTimeRef.current !== subWindowId) {
          playBuzzer();
          lastAlertTimeRef.current = subWindowId;
        }
      }
    } else if (diff < -5) {
      setShowSubAlert(false);
    }
  }, [gameSeconds, nextSubSeconds, showSubAlert, playBuzzer]);

  const updatePlayerPosition = useCallback((id: string, x: number, y: number) => {
    setPlayers(prev => prev.map(p => p.id === id ? { ...p, position: { x, y } } : p));
  }, []);

  const formatDisplayTime = (elapsedSeconds: number) => {
    const totalSecs = rotationConfig.gameMinutes * 60;
    let remaining = totalSecs - elapsedSeconds;
    if (rotationConfig.useHalves) {
      const halfLengthSecs = (rotationConfig.gameMinutes / 2) * 60;
      if (elapsedSeconds >= halfLengthSecs) {
        remaining = (halfLengthSecs * 2) - elapsedSeconds;
      } else {
        remaining = halfLengthSecs - elapsedSeconds;
      }
    }
    const mins = Math.floor(Math.max(0, remaining) / 60);
    const secs = Math.max(0, remaining) % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentHalf = useMemo(() => {
    if (!rotationConfig.useHalves) return null;
    const totalGameSecs = rotationConfig.gameMinutes * 60;
    return gameSeconds < (totalGameSecs / 2) ? 1 : 2;
  }, [gameSeconds, rotationConfig]);

  const availableHomePlayers = players.filter(p => p.team === 'home' && p.available);

  const resetCourtToMode = (mode: 'offence' | 'defence') => {
    const setup = mode === 'offence' ? OFFENCE_SETUP : DEFENCE_SETUP;
    
    // Create map for fast lookup
    const posMap = new Map(setup.map(s => [s.id, s]));

    const updatedPlayers = players.map(p => {
      // Find matching default position based on ID
      // If player ID matches the setup list (h1-h5, a1-a5), use it.
      // If we have dynamic IDs, we might need to map based on team index.
      let pos = posMap.get(p.id);
      
      // Fallback logic for dynamic players if they aren't h1-h5/a1-a5 exactly
      if (!pos) {
        const teamMembers = players.filter(pl => pl.team === p.team);
        const index = teamMembers.findIndex(tm => tm.id === p.id);
        if (index >= 0 && index < 5) {
            // Map index 0-4 to the default keys h1-h5 or a1-a5
            const key = `${p.team === 'home' ? 'h' : 'a'}${index + 1}`;
            pos = posMap.get(key);
        }
      }

      if (pos) return { ...p, position: { x: pos.x, y: pos.y } };
      return p;
    });

    setPlayers(updatedPlayers);
  };

  const switchMode = (mode: 'offence' | 'defence') => {
    setBoardMode(mode);
    resetCourtToMode(mode);
  };

  // Reset to current mode defaults
  const resetCourt = () => {
    const savedLayout = localStorage.getItem(STORAGE_KEYS.DEFAULT_LAYOUT + `_${boardMode}`);
    if (savedLayout) {
      const layoutData = JSON.parse(savedLayout);
      const updatedPlayers = players.map(p => {
        const snap = layoutData.find((s: any) => s.playerId === p.id) || 
                     layoutData.find((s: any) => s.playerNumber === p.number && p.team === (s.playerId.startsWith('h') ? 'home' : 'away'));
        if (snap) return { ...p, position: { x: snap.x, y: snap.y } };
        return p;
      });
      setPlayers(updatedPlayers);
    } else {
        resetCourtToMode(boardMode);
    }
  };

  const setAsDefaultLayout = () => {
    setIsSettingDefault(true);
    const layout = players.map(p => ({ playerId: p.id, playerNumber: p.number, x: p.position.x, y: p.position.y }));
    localStorage.setItem(STORAGE_KEYS.DEFAULT_LAYOUT + `_${boardMode}`, JSON.stringify(layout));
    setTimeout(() => setIsSettingDefault(false), 2000);
  };

  const saveCurrentPlay = () => {
    if (!playName.trim()) return;
    const newPlay: PlayType = {
      id: Date.now().toString(),
      name: playName,
      category: boardMode,
      timestamp: Date.now(),
      snapshots: players.map(p => ({ playerId: p.id, playerNumber: p.number, x: p.position.x, y: p.position.y }))
    };
    setPlays([newPlay, ...plays]);
    setPlayName('');
    setIsSavingPlay(false);
  };

  const loadPlay = (play: PlayType) => {
    const updatedPlayers = players.map(p => {
      const snap = play.snapshots.find(s => s.playerId === p.id) || 
                   play.snapshots.find(s => s.playerNumber === p.number && p.team === (s.playerId.startsWith('h') ? 'home' : 'away'));
      if (snap) return { ...p, position: { x: snap.x, y: snap.y } };
      return p;
    });
    setPlayers(updatedPlayers);
    setIsLibraryOpen(false); // Close library on selection for better UX
  };

  const deletePlay = (id: string) => {
    setPlays(plays.filter(p => p.id !== id));
  };

  // Filter plays based on current mode, default to 'offence' if category missing
  const filteredPlays = plays.filter(p => (p.category || 'offence') === boardMode);

  return (
    <div className="flex flex-col h-screen w-full bg-[#005C5C] text-zinc-100 overflow-hidden font-sans selection:bg-[#FF9100] selection:text-white">
      {/* MASSIVE SUB NOTIFICATION OVERLAY */}
      {showSubAlert && upcomingSubDetails && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-12 animate-in fade-in zoom-in-95 duration-300">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" />
          <div className="relative bg-white text-[#003D3D] rounded-[48px] shadow-[0_0_150px_rgba(255,255,255,0.3)] w-full max-w-4xl p-12 border-[12px] border-[#FF9100] overflow-hidden flex flex-col items-center animate-alert-pulse">
            <div className="w-full flex justify-between items-start mb-12">
               <div className="flex items-center gap-6">
                 <div className="w-24 h-24 bg-orange-100 rounded-[32px] flex items-center justify-center text-[#FF9100] animate-bounce">
                    <Volume2 className="w-12 h-12" />
                 </div>
                 <div>
                   <h2 className="text-8xl font-black italic uppercase tracking-tighter leading-none">SUB TIME</h2>
                   <p className="text-xl font-black uppercase tracking-[0.4em] text-[#FF9100] mt-2">Coach, Call them in now!</p>
                 </div>
               </div>
               <div className="bg-zinc-100 px-10 py-6 rounded-[32px] flex flex-col items-center border-2 border-zinc-200">
                 <span className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-1">Window In</span>
                 <span className="text-6xl font-mono font-black tabular-nums">{nextSubSeconds ? Math.max(0, nextSubSeconds - gameSeconds) : 0}s</span>
               </div>
            </div>
            <div className="w-full grid grid-cols-2 gap-16 flex-1">
              <div className="space-y-8">
                <div className="flex items-center gap-4 bg-[#FF9100] text-white px-8 py-4 rounded-3xl w-fit shadow-lg">
                  <UserRoundPlus className="w-7 h-7" />
                  <span className="text-xl font-black uppercase tracking-widest">Entering Game</span>
                </div>
                <div className="grid gap-4">
                  {upcomingSubDetails.comingOn.map(p => (
                    <div key={p.id} className="flex items-center gap-6 p-5 bg-zinc-50 rounded-[36px] border-2 border-orange-100 animate-in slide-in-from-left duration-500 shadow-sm">
                      <span className="bg-[#FF9100] text-white w-24 h-24 flex items-center justify-center rounded-[36px] text-5xl font-black shadow-xl">#{p.number}</span>
                      <span className="text-5xl font-black uppercase italic tracking-tight truncate">{p.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-8">
                <div className="flex items-center gap-4 bg-red-500 text-white px-8 py-4 rounded-3xl w-fit shadow-lg">
                  <X className="w-7 h-7" />
                  <span className="text-xl font-black uppercase tracking-widest">To The Bench</span>
                </div>
                <div className="grid gap-4">
                  {upcomingSubDetails.goingOff.map(p => (
                    <div key={p.id} className="flex items-center gap-6 p-5 bg-zinc-50 rounded-[36px] border-2 border-red-50 border-dashed opacity-50 grayscale animate-in slide-in-from-right duration-500">
                      <span className="bg-zinc-200 text-zinc-600 w-24 h-24 flex items-center justify-center rounded-[32px] text-5xl font-black">#{p.number}</span>
                      <span className="text-5xl font-black uppercase italic tracking-tight truncate">{p.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <button 
              onClick={() => setShowSubAlert(false)}
              className="mt-16 w-full bg-[#003D3D] text-white py-10 rounded-[40px] font-black text-3xl uppercase tracking-[0.2em] hover:bg-[#002929] transition-all active:scale-95 shadow-2xl flex items-center justify-center gap-4"
            >
              <Check className="w-10 h-10" /> GOT IT
            </button>
          </div>
        </div>
      )}

      {/* Two-Tier Header: Double Height, Raised Nav, Right Justified Nav Bar */}
      <header className="bg-[#003D3D] border-b border-[#002929] z-20 shrink-0 flex flex-col shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
        
        {/* Tier 1: Raised Navigation & Branding (Now Right Justified) */}
        <div className="px-4 py-3 md:px-8 md:py-4 flex items-center justify-between bg-[#003D3D]">
          <div className="flex items-center gap-4">
            <div className="bg-white p-2.5 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              <img 
                src="https://parkdalepacers.org/wp-content/uploads/2020/05/logo-300x275.png" 
                alt="Pacers Logo" 
                className="w-8 h-8 md:w-10 md:h-10 object-contain"
              />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg md:text-xl font-black tracking-tighter text-white uppercase italic leading-none">Parkdale <span className="opacity-40">Pacers</span></h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[8px] font-black uppercase tracking-widest text-[#FF9100] italic">Coach Pro V1.1</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => setActiveTab('court')} 
              className={`px-4 md:px-8 py-3 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${activeTab === 'court' ? 'bg-white text-[#003D3D] shadow-2xl scale-105' : 'bg-[#004E4E] text-white hover:bg-[#FF9100] hover:text-white'}`}
            >
              Tactics
            </button>
            <button 
              onClick={() => setActiveTab('roster')} 
              className={`px-4 md:px-8 py-3 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${activeTab === 'roster' ? 'bg-white text-[#003D3D] shadow-2xl scale-105' : 'bg-[#004E4E] text-white hover:bg-[#FF9100] hover:text-white'}`}
            >
              Roster
            </button>
            <button 
              onClick={() => setActiveTab('subs')} 
              className={`px-4 md:px-8 py-3 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${activeTab === 'subs' ? 'bg-white text-[#003D3D] shadow-2xl scale-105' : 'bg-[#004E4E] text-white hover:bg-[#FF9100] hover:text-white'}`}
            >
              Rotation
            </button>
          </div>
        </div>

        {/* Tier 2: Dedicated Clock Scoreboard Section (More compact height) */}
        {activeTab !== 'court' && (
          <div className="bg-[#005C5C]/40 py-3 border-t border-[#002929]/50 flex justify-center items-center relative">
            <div className="flex items-center gap-8 bg-[#004E4E] px-8 py-2.5 rounded-3xl border border-[#002929] shadow-[inset_0_4px_20px_rgba(0,0,0,0.8)] animate-in fade-in slide-in-from-top-2 duration-500">
              <div className="flex items-center gap-8">
                <div className="flex flex-col items-center">
                  {/* Half Indicator above the time */}
                  {currentHalf && (
                     <div className="mb-2 flex items-center gap-1.5 bg-[#FF9100]/10 px-3 py-0.5 rounded-full border border-[#FF9100]/20">
                       <span className="text-[10px] font-black uppercase text-[#FF9100] tracking-widest">Half {currentHalf}</span>
                     </div>
                  )}
                  
                  <div className={`flex items-baseline gap-4 ${showSubAlert ? 'text-[#FF9100]' : 'text-white'}`}>
                    <span className={`text-5xl font-mono font-black tabular-nums tracking-tight transition-all drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] ${isTimerRunning ? 'text-white' : 'text-teal-300'}`}>
                      {formatDisplayTime(gameSeconds)}
                    </span>
                    <div className="flex flex-col items-start">
                       <span className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-200 leading-none">Match Time</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 border-l-2 border-[#002929] pl-8">
                  <button 
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className={`w-12 h-12 rounded-xl transition-all flex items-center justify-center shadow-lg active:scale-90 ${isTimerRunning ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : 'bg-white text-[#003D3D] hover:bg-zinc-200'}`}
                  >
                    {isTimerRunning ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
                  </button>
                  <button 
                    onClick={() => { if(confirm('Reset match clock?')) { setIsTimerRunning(false); setGameSeconds(0); lastAlertTimeRef.current = -1; } }}
                    className="w-12 h-12 text-teal-300 hover:text-white transition-all rounded-xl flex items-center justify-center hover:bg-[#002929]"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 flex overflow-hidden min-h-0 relative">
        {/* SLIDE OVER SIDEBAR (LIBRARY/ROSTER) */}
        {isLibraryOpen && (
          <div className="absolute inset-0 bg-black/60 z-[100] backdrop-blur-sm transition-opacity animate-in fade-in" onClick={() => setIsLibraryOpen(false)} />
        )}
        <div className={`absolute top-0 left-0 h-full w-80 bg-[#003D3D] border-r border-[#002929] flex flex-col p-6 z-[110] transition-transform duration-300 ease-out shadow-[20px_0_50px_rgba(0,0,0,0.5)] ${isLibraryOpen ? 'translate-x-0' : '-translate-x-full'}`}>
           <div className="flex items-center justify-between mb-6 shrink-0">
              <div className="flex items-center gap-3">
                   {activeTab === 'court' ? (
                       <>
                         <History className="w-4 h-4 text-teal-200" />
                         <h3 className="text-[10px] font-black text-teal-200 uppercase tracking-[0.2em]">{boardMode} Library</h3>
                       </>
                   ) : (
                       <h2 className="text-[10px] font-black text-teal-200 uppercase tracking-[0.2em]">Roster Quick View</h2>
                   )}
              </div>
              <button onClick={() => setIsLibraryOpen(false)} className="p-2 text-teal-400 hover:text-white bg-[#004E4E] rounded-lg"><ChevronLeft className="w-4 h-4" /></button>
          </div>
          
          {activeTab === 'court' ? (
             <div className="flex flex-col h-full overflow-hidden">
                <div className="flex-1 overflow-y-auto no-scrollbar space-y-4">
                  {filteredPlays.length === 0 ? (
                    <div className="text-teal-300 text-[10px] font-black uppercase tracking-widest p-8 border border-[#004E4E] rounded-3xl border-dashed text-center">No {boardMode} plays</div>
                  ) : (
                    filteredPlays.map(play => (
                      <div key={play.id} className="group relative bg-[#004E4E] border border-[#002929] rounded-2xl p-4 cursor-pointer hover:border-white transition-all shadow-lg" onClick={() => loadPlay(play)}>
                        <button onClick={(e) => { e.stopPropagation(); deletePlay(play.id); }} className="absolute top-2 right-2 text-teal-200 hover:text-red-500 opacity-0 group-hover:opacity-100 p-1"><Trash2 className="w-4 h-4" /></button>
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border group-hover:bg-white group-hover:text-[#003D3D] transition-colors ${play.category === 'defence' ? 'bg-[#002929] border-red-900 text-red-400' : 'bg-[#003D3D] border-[#002929] text-white'}`}><PlayCircle className="w-6 h-6" /></div>
                          <div className="flex flex-col"><span className="text-sm font-black uppercase tracking-tighter truncate leading-none mb-1 text-white">{play.name}</span><span className="text-[9px] text-teal-300 font-bold uppercase tracking-widest">{new Date(play.timestamp).toLocaleDateString()}</span></div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="mt-6 pt-6 border-t border-[#002929] shrink-0">
                   <div className="flex items-center gap-3 mb-4"><Settings2 className="w-3 h-3 text-teal-200" /><span className="text-[10px] font-black text-teal-200 uppercase tracking-widest">Board Mode</span></div>
                   <div className="flex gap-2">
                     <button onClick={() => switchMode('offence')} className={`flex-1 py-3 px-2 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all flex items-center justify-center gap-2 ${boardMode === 'offence' ? 'bg-white text-[#003D3D] border-white' : 'border-[#002929] text-teal-400'}`}>
                        <Swords className="w-3 h-3" /> Offence
                     </button>
                     <button onClick={() => switchMode('defence')} className={`flex-1 py-3 px-2 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all flex items-center justify-center gap-2 ${boardMode === 'defence' ? 'bg-[#FF9100] text-white border-[#FF9100]' : 'border-[#002929] text-teal-400'}`}>
                        <ShieldCheck className="w-3 h-3" /> Defence
                     </button>
                   </div>
                </div>
            </div>
          ) : (
            <div className="flex flex-col h-full overflow-hidden">
               <div className="flex gap-2 mb-6 shrink-0">
                <button onClick={() => setActiveTeam('home')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all font-black text-[10px] uppercase tracking-wider ${activeTeam === 'home' ? 'bg-white text-[#003D3D] border-white' : 'border-[#002929] text-teal-400'}`}><Shield className="w-3 h-3" /> Home</button>
                <button onClick={() => setActiveTeam('away')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all font-black text-[10px] uppercase tracking-wider ${activeTeam === 'away' ? 'bg-white text-[#003D3D] border-white' : 'border-[#002929] text-teal-400'}`}><ShieldAlert className="w-3 h-3" /> Away</button>
              </div>
              <div className="flex-1 overflow-y-auto no-scrollbar">
                <h2 className="text-[10px] font-black text-teal-200 uppercase tracking-[0.2em] mb-4">Roster Quick View</h2>
                <div className="space-y-3">
                  {(activeTeam === 'home' ? players.filter(p=>p.team==='home') : players.filter(p=>p.team==='away')).map(p => (
                    <div key={p.id} className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${p.available ? 'bg-[#002929] border-[#004E4E]' : 'bg-[#002929]/50 border-[#003D3D] opacity-60'}`}>
                      <div className="flex items-center gap-4">
                        <span className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-xs border-2 ${p.team === 'home' ? 'bg-white text-[#003D3D] border-teal-200' : 'bg-[#FF9100] text-white border-orange-600'}`}>{p.number}</span>
                        <span className="text-xs font-bold text-white uppercase">{p.name}</span>
                      </div>
                      <button onClick={() => setPlayers(players.map(x=>x.id===p.id?{...x,available:!x.available}:x))} className="p-2 text-teal-300 hover:text-white"><UserRoundPlus className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={`flex-1 relative bg-[#005C5C] flex flex-col overflow-hidden min-h-0 ${activeTab === 'court' ? 'p-2 md:p-6' : 'p-4 md:px-8 md:py-6'}`}>
          {activeTab === 'court' && (
            <div className="w-full max-w-5xl mx-auto h-full flex flex-col gap-4 overflow-hidden">
              <div className="flex justify-between items-end shrink-0">
                <div>
                  <h2 className="text-2xl md:text-3xl font-black tracking-tighter text-white uppercase italic leading-none">Whiteboard</h2>
                  <p className="text-[9px] md:text-[10px] text-teal-200 uppercase tracking-widest font-black mt-1 flex items-center gap-2">
                     <span className={`w-2 h-2 rounded-full ${boardMode === 'offence' ? 'bg-white' : 'bg-[#FF9100]'}`}></span>
                     {boardMode} Mode
                  </p>
                </div>
              </div>
              <div className="flex-1 flex items-center justify-center min-h-0 relative">
                <div className="w-full h-full max-h-full aspect-[15/14]">
                  <Court players={players} onPlayerMove={updatePlayerPosition} />
                </div>
                {isSavingPlay && (
                  <div className="absolute inset-0 bg-black/80 z-50 rounded-2xl flex items-center justify-center p-8 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#003D3D] border border-[#002929] p-8 rounded-3xl w-full max-w-md shadow-2xl">
                      <div className="flex justify-between items-start mb-6">
                        <h3 className="text-xl font-black uppercase tracking-tighter italic text-white">Save {boardMode} Play</h3>
                        <button onClick={() => setIsSavingPlay(false)} className="text-teal-400 hover:text-white"><X className="w-5 h-5"/></button>
                      </div>
                      <input autoFocus placeholder="Play Name" value={playName} onChange={e => setPlayName(e.target.value)} onKeyDown={e => e.key === 'Enter' && saveCurrentPlay()} className="w-full bg-[#004E4E] border-2 border-[#002929] rounded-xl p-4 text-sm font-bold focus:border-white outline-none text-white placeholder:text-teal-400 mb-6" />
                      <button onClick={saveCurrentPlay} className="w-full bg-white text-[#003D3D] py-4 rounded-xl font-black text-xs uppercase tracking-widest">Confirm Save</button>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 md:p-5 rounded-2xl bg-[#003D3D]/60 border border-[#002929]/60 shadow-2xl backdrop-blur-md shrink-0">
                 <div className="flex items-center gap-4">
                    <button onClick={() => setIsLibraryOpen(!isLibraryOpen)} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#004E4E] border border-[#002929] text-teal-200 hover:text-white hover:bg-[#005C5C] hover:border-teal-700 transition-all group shadow-lg">
                        <Library className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Library</span>
                    </button>
                 </div>
                 <div className="flex gap-2 w-full md:w-auto">
                    <button onClick={setAsDefaultLayout} className={`flex-1 md:flex-none flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl border transition-all ${isSettingDefault ? 'bg-[#FF9100] border-[#FF9100] text-white' : 'bg-[#004E4E] border-[#002929] text-teal-200'}`}>{isSettingDefault ? <><Check className="w-3 h-3" /> Locked</> : <><Anchor className="w-3 h-3" /> Set Default</>}</button>
                    <button onClick={resetCourt} className="flex-1 md:flex-none flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest text-teal-200 bg-[#004E4E] border border-[#002929] px-4 py-2.5 rounded-xl"><RefreshCw className="w-3 h-3" /> Reset {boardMode}</button>
                    <button onClick={() => setIsSavingPlay(true)} className="flex-1 md:flex-none flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.1em] text-[#003D3D] bg-white px-6 py-2.5 rounded-xl"><Save className="w-4 h-4" /> Save Play</button>
                 </div>
              </div>
            </div>
          )}
          {activeTab === 'roster' && (
            <div className="w-full max-w-4xl mx-auto h-full overflow-hidden flex flex-col">
              <RosterManager players={players} team={activeTeam} onAddPlayer={(t)=>{if(newPlayerNum && newPlayerName){const p:Player={id:Date.now().toString(),name:newPlayerName,number:newPlayerNum,position:{x:50,y:50},team:t,available:true};setPlayers([...players,p]);setNewPlayerName('');setNewPlayerNum('');}}} onRemovePlayer={(id)=>setPlayers(players.filter(x=>x.id!==id))} onToggleAvailability={(id)=>setPlayers(players.map(x=>x.id===id?{...x,available:!x.available}:x))} onSaveRoster={()=>localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players))} newName={newPlayerName} setNewName={setNewPlayerName} newNum={newPlayerNum} setNewNum={setNewPlayerNum} />
            </div>
          )}
          {activeTab === 'subs' && (
            <div className="w-full max-w-3xl mx-auto h-full overflow-y-auto no-scrollbar py-4">
              <SubGenerator players={availableHomePlayers} config={rotationConfig} onConfigChange={setRotationConfig} currentGameSeconds={gameSeconds} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
