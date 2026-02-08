import React, { useState, useEffect } from 'react';
import { ViewState, UserProfile, WorkoutPlan, ExecutionLog, DailyReport } from './types';
import { Dock } from './components/Dock';
import { Sheet } from './components/Sheet';
import { Nexus } from './views/Nexus';
import { Forge } from './views/Forge';
import { Stream } from './views/Stream';
import { Button3D, TactileInput, BentoCard } from './components/UI';
import { smartSwapExercise, analyzeDebrief } from './services/gemini';
import { auth, db, isOffline, APP_ID_DB } from './services/firebase';
import { doc, getDoc, setDoc, addDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { getImageForFocus } from './constants';
import { Check, Clock, Edit2, Zap, Play } from 'lucide-react';

export default function App() {
    // -- State --
    const [view, setView] = useState<ViewState>('nexus');
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<UserProfile>({
        name: '', weight: 70, height: 175, age: 25, activity: 1.2, maturity: 0,
        days: [], modules: [], priorities: [], customGoal: '', plan: null
    });
    
    // Sheet States
    const [activeSheet, setActiveSheet] = useState<'none' | 'day' | 'review' | 'execution' | 'debrief'>('none');
    
    // Temporary States for Sheets
    const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);
    const [tempPlan, setTempPlan] = useState<WorkoutPlan | null>(null);
    const [tempAnalysis, setTempAnalysis] = useState('');
    const [activeExercise, setActiveExercise] = useState<{name: string, index: number} | null>(null);
    const [executionData, setExecutionData] = useState<{sets: any[], notes: string}>({sets: [], notes: ''});
    const [timer, setTimer] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [completedExercisesToday, setCompletedExercisesToday] = useState<string[]>([]);
    
    // -- Effects --

    // Auth & Load
    useEffect(() => {
        if (isOffline) {
            setUser({ uid: 'offline-agent', isAnonymous: true });
            const saved = localStorage.getItem('titan_profile');
            if (saved) {
                try { setProfile(JSON.parse(saved)); } catch(e) { console.error("Profile parse error", e); }
            }
            return;
        }

        if (auth) {
            const unsub = onAuthStateChanged(auth, async (u) => {
                if (u) {
                    setUser(u);
                    if (db) {
                        try {
                            const docRef = doc(db, 'artifacts', APP_ID_DB, 'users', u.uid, 'data', 'profile');
                            const snap = await getDoc(docRef);
                            if (snap.exists()) {
                                setProfile(prev => ({ ...prev, ...snap.data() as Partial<UserProfile> }));
                            }
                        } catch (e) {
                            console.error("Fetch profile error", e);
                        }
                    }
                } else {
                    await signInAnonymously(auth);
                }
            });
            return () => unsub();
        }
    }, []);

    // Timer
    useEffect(() => {
        let interval: any;
        if (isTimerRunning) {
            interval = setInterval(() => setTimer(t => t + 1), 1000);
        }
        return () => clearInterval(interval);
    }, [isTimerRunning]);

    // Check completed exercises
    useEffect(() => {
        const checkCompleted = async () => {
            if(!user || !selectedDayKey) return;
            const todayStr = new Date().toISOString().split('T')[0];
            
            if (isOffline) {
                const logs = JSON.parse(localStorage.getItem('titan_logs') || '[]');
                const done = logs
                    .filter((l: any) => l.date === todayStr)
                    .map((l: any) => l.exercise);
                setCompletedExercisesToday(done);
                return;
            }

            if (db) {
                try {
                    const q = query(collection(db, 'artifacts', APP_ID_DB, 'users', user.uid, 'logs'), where('date', '==', todayStr));
                    const snap = await getDocs(q);
                    const done = snap.docs.map(d => d.data().exercise);
                    setCompletedExercisesToday(done);
                } catch (e) {
                    console.error("Check completed error", e);
                }
            }
        };
        checkCompleted();
    }, [user, selectedDayKey, activeSheet]);


    // -- Handlers --

    const saveProfile = async (newProfile: UserProfile) => {
        if (!user) return;
        
        if (isOffline) {
            localStorage.setItem('titan_profile', JSON.stringify(newProfile));
            return;
        }

        if (db) {
            await setDoc(doc(db, 'artifacts', APP_ID_DB, 'users', user.uid, 'data', 'profile'), newProfile, { merge: true });
        }
    };

    const handleUpdateProfile = (partial: Partial<UserProfile>) => {
        const updated = { ...profile, ...partial };
        setProfile(updated);
        saveProfile(updated);
    };

    const handlePlanGenerated = (plan: WorkoutPlan, analysis: string) => {
        setTempPlan(plan);
        setTempAnalysis(analysis);
        setActiveSheet('review');
    };

    const confirmPlan = () => {
        if(tempPlan) {
            handleUpdateProfile({ plan: tempPlan });
            setActiveSheet('none');
            setView('nexus');
        }
    };

    const handleOpenDay = (day: string) => {
        setSelectedDayKey(day);
        setActiveSheet('day');
    };

    const handleStartExecution = (exercise: string, index: number) => {
        setActiveExercise({ name: exercise, index });
        setExecutionData({ sets: [], notes: '' });
        setTimer(0);
        setIsTimerRunning(true);
        setActiveSheet('execution');
    };

    const handleSaveExecution = async () => {
        if(!user || !activeExercise) return;
        const todayStr = new Date().toISOString().split('T')[0];
        const log: ExecutionLog = {
            date: todayStr,
            exercise: activeExercise.name,
            sets: executionData.sets,
            notes: executionData.notes,
            timestamp: Date.now()
        };

        if (isOffline) {
            const existing = JSON.parse(localStorage.getItem('titan_logs') || '[]');
            existing.push(log);
            localStorage.setItem('titan_logs', JSON.stringify(existing));
        } else if (db) {
            await addDoc(collection(db, 'artifacts', APP_ID_DB, 'users', user.uid, 'logs'), log);
        }

        setCompletedExercisesToday(prev => [...prev, activeExercise.name]);
        setIsTimerRunning(false);
        setActiveSheet('day');
    };

    const handleFinishDay = async () => {
        if(!user) return;
        const todayStr = new Date().toISOString().split('T')[0];
        let logs = [];

        if (isOffline) {
            const allLogs = JSON.parse(localStorage.getItem('titan_logs') || '[]');
            logs = allLogs.filter((l: any) => l.date === todayStr);
        } else if (db) {
            const q = query(collection(db, 'artifacts', APP_ID_DB, 'users', user.uid, 'logs'), where('date', '==', todayStr));
            const snap = await getDocs(q);
            logs = snap.docs.map(d => d.data());
        }

        if(logs.length === 0) {
            alert("Nenhum exercício registrado hoje.");
            return;
        }

        const analysis = await analyzeDebrief(logs, profile.name);
        const report = {
            date: todayStr,
            analysis,
            timestamp: Date.now()
        };

        if (isOffline) {
            const existingReports = JSON.parse(localStorage.getItem('titan_reports') || '[]');
            existingReports.push({...report, id: Date.now().toString() });
            localStorage.setItem('titan_reports', JSON.stringify(existingReports));
        } else if (db) {
            await addDoc(collection(db, 'artifacts', APP_ID_DB, 'users', user.uid, 'daily_reports'), report);
        }

        alert("Missão Concluída. Relatório Gerado.");
        setActiveSheet('none');
    };
    
    const handleSwapExercise = async (index: number) => {
        if(!tempPlan || !selectedDayKey) return;
        const ex = tempPlan[selectedDayKey].exercicios[index];
        const reason = prompt("Motivo da troca (ex: Dor, Sem equipamento):");
        if(reason) {
            const newEx = await smartSwapExercise(ex, reason);
            if(newEx) {
                const newPlan = {...tempPlan};
                newPlan[selectedDayKey].exercicios[index] = newEx;
                setTempPlan(newPlan);
            }
        }
    };

    const formatTime = (s: number) => {
        const min = Math.floor(s / 60).toString().padStart(2, '0');
        const sec = (s % 60).toString().padStart(2, '0');
        return `${min}:${sec}`;
    };

    // -- Renderers --

    const renderDayContent = () => {
        const planToUse = activeSheet === 'review' ? tempPlan : profile.plan;
        if (!selectedDayKey || !planToUse) return null;
        const dayData = planToUse[selectedDayKey];
        const coverImg = getImageForFocus(dayData.foco);

        return (
            <div className="space-y-6">
                 {/* Hero Header */}
                <div className="h-48 w-full rounded-3xl bg-surface-2 relative overflow-hidden border border-white/5 shadow-2xl group">
                    <img src={coverImg} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-deep via-deep/50 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4">
                        <div className="flex justify-between items-end">
                            <div>
                                <span className="inline-block px-2 py-1 bg-accent-lime/20 text-accent-lime text-[10px] font-bold uppercase tracking-wider rounded mb-2 backdrop-blur-md border border-accent-lime/20">
                                    Foco Tático
                                </span>
                                <h2 className="text-3xl font-display font-bold text-white uppercase leading-none tracking-tight">{dayData.foco}</h2>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Exercise List */}
                <div className="space-y-3">
                    {dayData.exercicios.map((ex, idx) => {
                        const isDone = activeSheet === 'day' && completedExercisesToday.includes(ex);
                        return (
                            <BentoCard 
                                key={idx} 
                                className={`flex items-center gap-4 p-4 ${isDone ? 'opacity-60 grayscale' : ''} transition-all`}
                                onClick={activeSheet === 'day' && !isDone ? () => handleStartExecution(ex, idx) : undefined}
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 transition-colors ${isDone ? 'bg-accent-lime text-black' : 'bg-surface-2 text-white border border-white/10'}`}>
                                    {isDone ? <Check size={18} /> : idx + 1}
                                </div>
                                
                                <div className="flex-1">
                                    <span className={`text-sm font-bold block leading-snug ${isDone ? 'line-through text-gray-500' : 'text-white'}`}>
                                        {ex}
                                    </span>
                                    {!isDone && activeSheet === 'day' && <span className="text-[10px] text-accent-electric uppercase tracking-wider font-bold">Toque para iniciar</span>}
                                </div>

                                {activeSheet === 'review' ? (
                                    <button onClick={(e) => { e.stopPropagation(); handleSwapExercise(idx); }} className="p-3 rounded-xl bg-surface-2 text-gray-400 hover:text-white hover:bg-surface-3 transition-colors">
                                        <Edit2 size={16}/>
                                    </button>
                                ) : (
                                    !isDone && (
                                        <div className="w-8 h-8 rounded-full bg-accent-electric/10 flex items-center justify-center text-accent-electric">
                                            <Play size={14} fill="currentColor" />
                                        </div>
                                    )
                                )}
                            </BentoCard>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-deep text-white font-sans selection:bg-accent-lime selection:text-black">
            <main className="h-full w-full overflow-y-auto scrollbar-hide max-w-md mx-auto relative bg-deep">
                {view === 'nexus' && <Nexus profile={profile} onNavigate={setView} onOpenDay={handleOpenDay} />}
                {view === 'forge' && <Forge profile={profile} updateProfile={handleUpdateProfile} onPlanGenerated={handlePlanGenerated} />}
                {view === 'stream' && <Stream onOpenReport={(r) => { setTempAnalysis(r.analysis); setActiveSheet('debrief'); }} />}
            </main>

            <Dock currentView={view} onChange={setView} />

            {/* --- SHEETS --- */}

            {/* DAY DETAIL / REVIEW SHEET */}
            <Sheet 
                isOpen={activeSheet === 'day' || activeSheet === 'review'} 
                onClose={() => setActiveSheet('none')}
                title={selectedDayKey ? `${selectedDayKey} - Detalhes` : 'Protocolo'}
                footer={
                    activeSheet === 'review' ? (
                        <div className="space-y-3">
                             <div className="p-4 bg-surface-2 rounded-2xl border border-white/5 mb-2 flex gap-3">
                                <Zap className="text-accent-electric shrink-0" size={20} />
                                <div>
                                    <span className="text-xs text-accent-electric font-bold block mb-1 uppercase tracking-wide">Análise IA</span>
                                    <p className="text-xs text-gray-400 leading-relaxed">{tempAnalysis}</p>
                                </div>
                            </div>
                            <Button3D variant="lime" onClick={confirmPlan}>Confirmar Protocolo</Button3D>
                        </div>
                    ) : (
                         <Button3D variant="lime" onClick={handleFinishDay}>
                            <Check className="mr-2" size={18}/> Concluir Missão
                         </Button3D>
                    )
                }
            >
                {renderDayContent()}
            </Sheet>

            {/* EXECUTION SHEET */}
            <Sheet
                isOpen={activeSheet === 'execution'}
                onClose={() => setActiveSheet('day')}
                title="Execução em Curso"
                footer={<Button3D variant="electric" onClick={handleSaveExecution}>Registrar Série</Button3D>}
            >
                <div className="flex flex-col items-center pt-4">
                    <h3 className="text-xl font-bold text-white mb-6 text-center max-w-[80%]">{activeExercise?.name}</h3>

                    {/* Reactor Timer */}
                    <div className="relative w-56 h-56 flex items-center justify-center mb-10">
                        {/* Outer static ring */}
                        <div className="absolute inset-0 rounded-full border border-white/5 bg-surface-2/50 backdrop-blur-sm"></div>
                        {/* Spinning ring */}
                        <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-accent-electric border-r-accent-electric/30 animate-spin duration-[4s]"></div>
                        {/* Pulse glow */}
                        <div className="absolute inset-0 rounded-full bg-accent-electric/5 animate-pulse-ring"></div>
                        
                        <div className="absolute inset-4 rounded-full bg-deep border border-white/10 flex flex-col items-center justify-center shadow-inner">
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                                <Clock size={12}/> Tempo Decorrido
                            </span>
                            <div className="text-5xl font-mono font-bold text-white tracking-tighter tabular-nums text-shadow-glow">
                                {formatTime(timer)}
                            </div>
                        </div>
                    </div>

                    {/* Sets Input Grid */}
                    <div className="w-full space-y-3 mb-6 bg-surface-1 p-4 rounded-2xl border border-white/5">
                        <div className="grid grid-cols-[30px_1fr_1fr] gap-3 mb-2 px-2">
                            <span className="text-[10px] text-gray-500 uppercase font-bold text-center">Set</span>
                            <span className="text-[10px] text-gray-500 uppercase font-bold text-center">Carga (kg)</span>
                            <span className="text-[10px] text-gray-500 uppercase font-bold text-center">Reps</span>
                        </div>
                        {[1, 2, 3, 4].map(s => (
                            <div key={s} className="grid grid-cols-[30px_1fr_1fr] gap-3 items-center">
                                <div className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center text-gray-400 font-bold text-xs border border-white/5">
                                    {s}
                                </div>
                                <TactileInput 
                                    className="h-10 p-2 text-center font-mono text-lg bg-deep border-white/10 focus:border-accent-electric" 
                                    type="number"
                                    placeholder="-"
                                    onBlur={(e) => {
                                        const newSets = [...executionData.sets];
                                        if(!newSets[s-1]) newSets[s-1] = {set: s, weight: '', reps: '', rpe: ''};
                                        newSets[s-1].weight = e.target.value;
                                        setExecutionData({...executionData, sets: newSets});
                                    }} 
                                />
                                <TactileInput 
                                    className="h-10 p-2 text-center font-mono text-lg bg-deep border-white/10 focus:border-accent-lime" 
                                    type="number"
                                    placeholder="-"
                                    onBlur={(e) => {
                                        const newSets = [...executionData.sets];
                                        if(!newSets[s-1]) newSets[s-1] = {set: s, weight: '', reps: '', rpe: ''};
                                        newSets[s-1].reps = e.target.value;
                                        setExecutionData({...executionData, sets: newSets});
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                    
                    <TactileInput 
                        as="textarea" 
                        placeholder="Observações técnicas ou sensações..." 
                        className="h-24 resize-none mb-20"
                        value={executionData.notes}
                        onChange={e => setExecutionData({...executionData, notes: e.target.value})}
                    />
                </div>
            </Sheet>

            {/* DEBRIEF SHEET */}
            <Sheet
                isOpen={activeSheet === 'debrief'}
                onClose={() => setActiveSheet('none')}
                title="Relatório de Campo"
            >
                <div className="space-y-4 pt-2">
                     <div className="p-6 bg-surface-2 rounded-3xl border border-white/5 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-accent-lime"></div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-accent-lime/10 flex items-center justify-center text-accent-lime">
                                <Zap size={20} />
                            </div>
                            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Feedback do Comando</h4>
                        </div>
                        <p className="text-sm text-gray-300 leading-relaxed font-medium">
                            {tempAnalysis || "Análise em processamento..."}
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-gray-600 mt-4">Dados sincronizados com a nuvem neural.</p>
                    </div>
                </div>
            </Sheet>
        </div>
    );
}