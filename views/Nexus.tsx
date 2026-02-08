import React, { useEffect, useState } from 'react';
import { UserProfile, WorkoutDay, DAYS_OF_WEEK } from '../types';
import { BentoCard, Button3D, SectionHeader } from '../components/UI';
import { Play, Calendar, Trophy, Zap, ChevronRight, Activity } from 'lucide-react';

interface NexusProps {
    profile: UserProfile;
    onNavigate: (view: 'forge') => void;
    onOpenDay: (day: string) => void;
}

export const Nexus: React.FC<NexusProps> = ({ profile, onNavigate, onOpenDay }) => {
    const [currentDayIndex, setCurrentDayIndex] = useState(0);

    useEffect(() => {
        // Javascript getDay(): 0 = Sunday.
        // We want to map this to our array standard or just highlight the current day card.
        // Let's find the current day string match.
        const d = new Date();
        const dayMap = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
        setCurrentDayIndex(d.getDay()); 
    }, []);

    const dayMap = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
    const currentDayStr = dayMap[currentDayIndex];
    
    // Logic: Find today's workout in the plan
    const todaysWorkout = profile.plan && profile.plan[currentDayStr] ? profile.plan[currentDayStr] : null;

    return (
        <div className="space-y-6 pb-32 animate-fade-in pt-6 px-4">
            {/* 1. Header: Greeting & Avatar */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-display font-bold text-white tracking-tight">
                        Olá, <span className="text-accent-lime">{profile.name.split(' ')[0] || 'Operador'}</span>
                    </h1>
                    <p className="text-xs text-gray-500 font-medium mt-1">Sistemas Online • {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                </div>
                <div onClick={() => onNavigate('forge')} className="w-10 h-10 rounded-full bg-surface-2 border border-white/10 flex items-center justify-center text-xs font-bold text-gray-400 cursor-pointer hover:text-white transition-colors">
                    {profile.name[0]?.toUpperCase() || 'T'}
                </div>
            </div>

            {/* 2. Weekly Calendar Strip - Horizontal Scroll */}
            {/* This aligns with user habits of checking "Where am I in the week?" */}
            <div>
                <div className="flex justify-between items-center mb-3 px-1">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Cronograma Tático</span>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide snap-x">
                    {dayMap.map((day, idx) => {
                        const isToday = idx === currentDayIndex;
                        const hasWorkout = profile.plan && profile.plan[day];
                        
                        return (
                            <div 
                                key={day}
                                onClick={() => hasWorkout && onOpenDay(day)}
                                className={`
                                    flex-shrink-0 w-[52px] h-[72px] rounded-xl flex flex-col items-center justify-center gap-1 border snap-center transition-all
                                    ${isToday 
                                        ? 'bg-accent-electric text-white border-accent-electric shadow-[0_4px_20px_rgba(46,92,255,0.4)] scale-105' 
                                        : 'bg-surface-2 border-transparent text-gray-500'
                                    }
                                    ${hasWorkout && !isToday ? 'border-b-2 border-b-accent-lime/50 cursor-pointer hover:bg-surface-3' : ''}
                                `}
                            >
                                <span className="text-[10px] font-bold uppercase opacity-60">{day.substring(0,3)}</span>
                                <span className={`text-lg font-display font-bold ${isToday ? 'text-white' : 'text-gray-300'}`}>
                                    {/* Using a dummy date calculation relative to today for demo visual */}
                                    {new Date(new Date().setDate(new Date().getDate() - (currentDayIndex - idx))).getDate()}
                                </span>
                                {hasWorkout && (
                                    <div className={`w-1 h-1 rounded-full ${isToday ? 'bg-white' : 'bg-accent-lime'}`}></div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 3. Hero Section: The "Mission" Card */}
            {/* If there is a workout today, this takes dominance. Best practice for fitness apps. */}
            <SectionHeader title="Missão Atual" subtitle="Status Operacional" />
            
            {todaysWorkout ? (
                <div className="relative group overflow-hidden rounded-3xl bg-surface-1 border border-white/10 shadow-2xl">
                    {/* Background Visuals */}
                    <div className="absolute inset-0 bg-gradient-to-br from-accent-electric/10 to-transparent pointer-events-none"></div>
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-accent-lime/5 blur-[80px] rounded-full pointer-events-none"></div>

                    <div className="p-6 relative z-10">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <span className="inline-block px-3 py-1 rounded-full bg-accent-lime text-black text-[10px] font-bold uppercase tracking-wider mb-2">
                                    Hoje • {currentDayStr}
                                </span>
                                <h2 className="text-3xl font-display font-bold text-white uppercase leading-none">
                                    {todaysWorkout.foco}
                                </h2>
                                <p className="text-gray-400 text-sm mt-2 font-medium">
                                    {todaysWorkout.exercicios.length} Exercícios Estimados
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-surface-3 flex items-center justify-center text-accent-lime border border-white/5">
                                <Zap size={24} fill="currentColor" />
                            </div>
                        </div>

                        <div className="space-y-3 mb-8">
                            {todaysWorkout.exercicios.slice(0, 3).map((ex, i) => (
                                <div key={i} className="flex items-center gap-3 text-sm text-gray-300">
                                    <div className="w-1.5 h-1.5 rounded-full bg-accent-electric"></div>
                                    {ex}
                                </div>
                            ))}
                            {todaysWorkout.exercicios.length > 3 && (
                                <span className="text-xs text-gray-500 pl-4">+ {todaysWorkout.exercicios.length - 3} outros exercícios</span>
                            )}
                        </div>

                        <Button3D 
                            variant="lime" 
                            onClick={() => onOpenDay(currentDayStr)}
                            className="w-full flex justify-between items-center group-hover:scale-[1.02] transition-transform"
                        >
                            <span>Iniciar Protocolo</span>
                            <Play size={18} fill="currentColor" />
                        </Button3D>
                    </div>
                </div>
            ) : (
                // Rest Day State
                <BentoCard className="flex flex-col items-center justify-center py-10 gap-4 border-dashed border-white/10">
                    <div className="w-16 h-16 rounded-full bg-surface-2 flex items-center justify-center text-gray-600 mb-2">
                        <Calendar size={32} />
                    </div>
                    <div className="text-center">
                        <h3 className="text-xl font-bold text-white mb-1">Descanso Estratégico</h3>
                        <p className="text-sm text-gray-500 max-w-[200px] mx-auto">Nenhuma missão programada para hoje. Recupere-se ou configure um novo plano.</p>
                    </div>
                    {!profile.plan && (
                        <Button3D variant="electric" onClick={() => onNavigate('forge')} className="max-w-[200px] mt-4">
                            Gerar Plano
                        </Button3D>
                    )}
                </BentoCard>
            )}

            {/* 4. Secondary Metrics / Quick Access */}
            <div className="grid grid-cols-2 gap-3">
                <BentoCard onClick={() => onNavigate('forge')} className="flex flex-col gap-3 group">
                    <div className="w-10 h-10 rounded-xl bg-surface-2 flex items-center justify-center text-accent-purple group-hover:text-white group-hover:bg-accent-purple transition-colors">
                        <Trophy size={20} />
                    </div>
                    <div>
                        <span className="text-2xl font-display font-bold text-white block">
                            {['Iniciante', 'Inter.', 'Elite'][profile.maturity] || 'N/A'}
                        </span>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Nível Atual</span>
                    </div>
                </BentoCard>

                <BentoCard className="flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                        <div className="w-10 h-10 rounded-xl bg-surface-2 flex items-center justify-center text-accent-electric">
                            <Activity size={20} />
                        </div>
                        <span className="text-xs font-mono text-accent-lime bg-accent-lime/10 px-2 py-0.5 rounded">
                            {profile.weight}kg
                        </span>
                    </div>
                    <div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide block mb-1">Objetivo</span>
                        <span className="text-sm font-bold text-white leading-tight line-clamp-2">
                            {profile.customGoal || 'Definir objetivo na Forja'}
                        </span>
                    </div>
                </BentoCard>
            </div>
        </div>
    );
};