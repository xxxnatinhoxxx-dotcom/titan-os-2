import React from 'react';
import { Grid, Settings, Activity } from 'lucide-react';
import { ViewState } from '../types';

interface DockProps {
    currentView: ViewState;
    onChange: (view: ViewState) => void;
}

export const Dock: React.FC<DockProps> = ({ currentView, onChange }) => {
    return (
        <nav className="fixed bottom-[calc(24px+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 bg-[#141418]/90 backdrop-blur-xl border border-white/10 rounded-full px-4 py-3 flex gap-4 shadow-[0_10px_40px_rgba(0,0,0,0.6)] z-[100]">
            <DockItem 
                active={currentView === 'nexus'} 
                onClick={() => onChange('nexus')} 
                icon={<Grid size={24} />} 
            />
            <DockItem 
                active={currentView === 'forge'} 
                onClick={() => onChange('forge')} 
                icon={<Settings size={24} />} 
            />
            <DockItem 
                active={currentView === 'stream'} 
                onClick={() => onChange('stream')} 
                icon={<Activity size={24} />} 
            />
        </nav>
    );
};

const DockItem = ({ active, onClick, icon }: { active: boolean, onClick: () => void, icon: React.ReactNode }) => (
    <button 
        onClick={onClick}
        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${active ? 'bg-accent-electric text-white -translate-y-2 scale-110 shadow-[0_8px_20px_-4px_rgba(46,92,255,0.6)]' : 'text-gray-500 hover:text-white'}`}
    >
        {icon}
    </button>
);