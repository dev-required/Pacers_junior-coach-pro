
import React, { useState } from 'react';
import { Player } from '../types';
import { UserPlus, Trash2, CheckCircle, Circle, Users, Save, Check } from 'lucide-react';

interface RosterManagerProps {
  players: Player[];
  team: 'home' | 'away';
  onAddPlayer: (team: 'home' | 'away') => void;
  onRemovePlayer: (id: string) => void;
  onToggleAvailability: (id: string) => void;
  onSaveRoster: () => void;
  newName: string;
  setNewName: (val: string) => void;
  newNum: string;
  setNewNum: (val: string) => void;
}

const RosterManager: React.FC<RosterManagerProps> = ({
  players,
  team,
  onAddPlayer,
  onRemovePlayer,
  onToggleAvailability,
  onSaveRoster,
  newName,
  setNewName,
  newNum,
  setNewNum
}) => {
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const teamPlayers = players.filter(p => p.team === team);

  const handleSave = () => {
    setSaveStatus('saving');
    onSaveRoster();
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 600);
  };

  return (
    <div className="flex flex-col h-full space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-black tracking-tighter text-white uppercase italic leading-none">Roster Management</h2>
          <p className="text-[10px] text-teal-300 uppercase tracking-widest font-black">Manage players and availability</p>
        </div>
        
        <button
          onClick={handleSave}
          disabled={saveStatus !== 'idle'}
          className={`flex items-center gap-3 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95 ${
            saveStatus === 'saved' 
              ? 'bg-[#FF9100] text-white' 
              : 'bg-[#002929] text-white hover:bg-[#003D3D]'
          }`}
        >
          {saveStatus === 'saved' ? (
            <><Check className="w-4 h-4" /> Roster Saved</>
          ) : (
            <><Save className="w-4 h-4" /> Save Roster</>
          )}
        </button>
      </div>

      {/* Add Player Form */}
      <div className="bg-[#003D3D] border border-[#002929] rounded-3xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <UserPlus className="w-4 h-4 text-teal-400" />
          <h3 className="text-xs font-black uppercase tracking-widest text-teal-400">Add New Player to {team === 'home' ? 'Home' : 'Away'}</h3>
        </div>
        <div className="flex flex-col md:flex-row gap-4">
          <input
            placeholder="Full Name"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            className="flex-1 bg-[#004E4E] border-2 border-[#002929] rounded-xl p-4 text-sm font-bold focus:border-white outline-none transition-all placeholder:text-teal-600 text-white"
          />
          <div className="flex gap-4">
            <input
              placeholder="#"
              value={newNum}
              onChange={e => setNewNum(e.target.value)}
              className="w-24 bg-[#004E4E] border-2 border-[#002929] rounded-xl p-4 text-sm font-bold focus:border-white outline-none transition-all placeholder:text-teal-600 text-white text-center"
            />
            <button
              onClick={() => onAddPlayer(team)}
              className="bg-white text-[#003D3D] px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-100 active:scale-95 transition-all shadow-lg"
            >
              Add Player
            </button>
          </div>
        </div>
      </div>

      {/* Players List */}
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pb-20">
        <div className="flex items-center justify-between mb-2">
           <div className="flex items-center gap-3">
             <span className="text-[10px] font-black text-teal-300 uppercase tracking-widest flex items-center gap-2">
               <Users className="w-4 h-4" /> Team List ({teamPlayers.length})
             </span>
           </div>
           <span className="text-[10px] font-black text-teal-300 uppercase tracking-widest italic">Check to set active for rotation</span>
        </div>
        
        {teamPlayers.length === 0 ? (
          <div className="bg-[#002929]/40 border-2 border-dashed border-[#003D3D] rounded-3xl p-12 text-center">
            <p className="text-teal-500 font-black uppercase tracking-widest text-xs">No players on the {team} team yet</p>
          </div>
        ) : (
          teamPlayers.map(player => (
            <div 
              key={player.id} 
              className={`group flex items-center justify-between p-5 rounded-3xl border-2 transition-all ${player.available ? 'bg-[#002929] border-[#004E4E]' : 'bg-[#002929]/50 border-[#003D3D] opacity-60'}`}
            >
              <div className="flex items-center gap-6">
                <button 
                  onClick={() => onToggleAvailability(player.id)}
                  className={`transition-transform active:scale-90 ${player.available ? 'text-white' : 'text-teal-700'}`}
                >
                  {player.available ? <CheckCircle className="w-8 h-8 fill-white text-[#003D3D]" /> : <Circle className="w-8 h-8 text-teal-700" />}
                </button>
                <div className="flex items-center gap-4">
                  <span className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg border-2 ${player.team === 'home' ? 'bg-zinc-300 text-zinc-900 border-zinc-400' : 'bg-[#005C5C] text-white border-[#003D3D]'}`}>
                    {player.number}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-lg font-black tracking-tight text-white uppercase italic">{player.name}</span>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${player.available ? 'text-[#FF9100]' : 'text-teal-700'}`}>
                      {player.available ? 'Available' : 'Resting / Out'}
                    </span>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => onRemovePlayer(player.id)}
                className="p-3 text-teal-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RosterManager;
