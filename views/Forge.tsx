import React from 'react';
import { UserProfile, DAYS_OF_WEEK } from '../types';
import { MUSCLE_GROUPS } from '../constants';
import { TactileInput, Button3D, SectionHeader, BentoCard } from '../components/UI';
import { generateWorkoutPlan } from '../services/gemini';
import { User, Dumbbell, Calendar, Target } from 'lucide-react';

interface ForgeProps {
    profile: UserProfile;
    updateProfile: (p: Partial<UserProfile>) => void;
    onPlanGenerated: (plan: any, analysis: string) => void;
}

export const Forge: React.FC<ForgeProps> = ({ profile, updateProfile, onPlanGenerated }) => {
    const [loading, setLoading] = React.useState(false);

    const handleGenerate = async () => {
        if(profile.days.length === 0) {
            alert("Selecione os dias de treino.");
            return;
        }
        setLoading(true);
        const result = await generateWorkoutPlan(profile);
        setLoading(false);
        if(result) {
            onPlanGenerated(result.rotina, result.analise);
        } else {
            alert("Falha ao gerar protocolo. Tente novamente.");
        }
    };

    const toggleDay = (day: string) => {
        const newDays = profile.days.includes(day) 
            ? profile.days.filter(d => d !== day)
            : [...profile.days, day];
        updateProfile({ days: newDays });
    };

    const togglePriority = (id: string) => {
        const newPrio = profile.priorities.includes(id)
            ? profile.priorities.filter(p => p !== id)
            : [...profile.priorities, id];
        updateProfile({ priorities: newPrio });
    };

    return (
        <div className="pb-32 animate-fade-in pt-6 px-4 space-y-8">
            <header>
                <h1 className="text-2xl font-display font-bold text-white">Forja Neural</h1>
                <p className="text-sm text-gray-500 mt-1">Configure os parâmetros para o algoritmo tático.</p>
            </header>

            {/* SECTION 1: IDENTITY */}
            <section>
                <SectionHeader title="Identidade" subtitle="Dados do Agente" />
                <BentoCard className="space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                        <User className="text-accent-electric" size={20} />
                        <span className="text-sm font-bold text-white">Perfil Básico</span>
                    </div>
                    <TactileInput 
                        label="Codinome"
                        value={profile.name} 
                        onChange={(e) => updateProfile({ name: e.target.value })} 
                        placeholder="Ex: Titan 01"
                    />
                    <div className="grid grid-cols-3 gap-3">
                        <TactileInput label="Peso (kg)" type="number" value={profile.weight} onChange={(e) => updateProfile({ weight: Number(e.target.value) })} />
                        <TactileInput label="Altura (cm)" type="number" value={profile.height} onChange={(e) => updateProfile({ height: Number(e.target.value) })} />
                        <TactileInput label="Idade" type="number" value={profile.age} onChange={(e) => updateProfile({ age: Number(e.target.value) })} />
                    </div>
                    
                    <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 block ml-1">Nível de Experiência</label>
                        <div className="flex bg-surface-2 p-1 rounded-xl border border-white/5">
                            {['Iniciante', 'Interm.', 'Elite'].map((label, idx) => (
                                <button 
                                    key={idx}
                                    onClick={() => updateProfile({ maturity: idx })}
                                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${profile.maturity === idx ? 'bg-accent-electric text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                </BentoCard>
            </section>

            {/* SECTION 2: STRATEGY */}
            <section>
                <SectionHeader title="Estratégia" subtitle="Parâmetros de Missão" />
                
                {/* Days Selector - Improved Touch Targets */}
                <div className="mb-6">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3 block">Disponibilidade Operacional</label>
                    <div className="flex justify-between gap-1">
                        {DAYS_OF_WEEK.map(day => {
                             const isSelected = profile.days.includes(day);
                             return (
                                <button
                                    key={day}
                                    onClick={() => toggleDay(day)}
                                    className={`
                                        flex-1 h-12 rounded-xl flex flex-col items-center justify-center transition-all duration-200 border-2
                                        ${isSelected 
                                            ? 'bg-accent-lime border-accent-lime text-black shadow-[0_4px_12px_rgba(212,255,0,0.3)] -translate-y-1' 
                                            : 'bg-surface-2 border-transparent text-gray-600 hover:bg-surface-3'
                                        }
                                    `}
                                >
                                    <span className="text-[10px] font-bold uppercase">{day.substring(0, 1)}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Focus Grid */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                        <Dumbbell className="text-accent-purple" size={16} />
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Foco Prioritário</label>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {MUSCLE_GROUPS.map(grp => (
                            <button
                                key={grp.id}
                                onClick={() => togglePriority(grp.id)}
                                className={`
                                    py-3 px-2 rounded-xl text-xs font-bold text-center transition-all border
                                    ${profile.priorities.includes(grp.id) 
                                        ? 'bg-accent-purple text-white border-accent-purple shadow-[0_4px_12px_rgba(112,0,255,0.4)]' 
                                        : 'bg-surface-1 text-gray-400 border-white/5 hover:border-white/20'
                                    }
                                `}
                            >
                                {grp.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Custom Goal */}
                <TactileInput 
                    as="textarea"
                    label="Diretriz Específica (Prompt)"
                    value={profile.customGoal}
                    onChange={(e) => updateProfile({ customGoal: e.target.value })}
                    placeholder="Ex: Quero focar na parte superior do peito e melhorar minha resistência cardiovascular..."
                    className="h-24 resize-none mb-4"
                />

                <div className="flex gap-3">
                    {['DailyAbs', 'DailyCardio'].map(mod => {
                        const isActive = profile.modules.includes(mod);
                        return (
                            <button
                                key={mod}
                                onClick={() => {
                                    const newMods = isActive ? profile.modules.filter(m => m !== mod) : [...profile.modules, mod];
                                    updateProfile({ modules: newMods });
                                }}
                                className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition-all ${isActive ? 'bg-accent-electric border-accent-electric text-white' : 'bg-surface-1 border-white/5 text-gray-500'}`}
                            >
                                <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-white' : 'bg-gray-600'}`}></div>
                                {mod === 'DailyAbs' ? 'Mod: Abdômen' : 'Mod: Cardio'}
                            </button>
                        )
                    })}
                </div>
            </section>

            <div className="pt-4">
                <Button3D variant="electric" onClick={handleGenerate} disabled={loading} className="py-5 text-base">
                    {loading ? (
                        <span className="flex items-center gap-2">
                            <span className="animate-spin">⚙️</span> Processando Dados...
                        </span>
                    ) : (
                        <>
                            <Target size={20} />
                            <span>Gerar Protocolo Tático</span>
                        </>
                    )}
                </Button3D>
            </div>
        </div>
    );
};