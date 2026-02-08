import React, { useEffect, useState } from 'react';
import { DailyReport } from '../types';
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db, APP_ID_DB, auth, isOffline } from '../services/firebase';
import { CheckCircle2, ChevronRight, CalendarClock } from 'lucide-react';
import { SectionHeader } from '../components/UI';

interface StreamProps {
    onOpenReport: (report: DailyReport) => void;
}

export const Stream: React.FC<StreamProps> = ({ onOpenReport }) => {
    const [reports, setReports] = useState<DailyReport[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            if (isOffline) {
                const saved = JSON.parse(localStorage.getItem('titan_reports') || '[]');
                saved.sort((a: DailyReport, b: DailyReport) => b.timestamp - a.timestamp);
                setReports(saved);
                setLoading(false);
                return;
            }

            if (!auth?.currentUser) return;
            
            try {
                if (db) {
                    const q = query(
                        collection(db, 'artifacts', APP_ID_DB, 'users', auth.currentUser.uid, 'daily_reports'),
                        orderBy('timestamp', 'desc')
                    );
                    const snap = await getDocs(q);
                    const data = snap.docs.map(d => ({ ...d.data(), id: d.id } as DailyReport));
                    setReports(data);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    return (
        <div className="pb-32 animate-fade-in pt-6 px-4">
            <header className="mb-6">
                <h1 className="text-2xl font-display font-bold text-white">Registro de Campo</h1>
                <p className="text-sm text-gray-500 mt-1">Histórico de missões e análises táticas.</p>
            </header>
            
            <SectionHeader title="Timeline" subtitle="Execuções Recentes" />

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 opacity-50">
                    <div className="w-8 h-8 border-2 border-accent-lime border-t-transparent rounded-full animate-spin mb-4"></div>
                    <span className="text-xs uppercase tracking-widest text-accent-lime">Sincronizando...</span>
                </div>
            ) : reports.length === 0 ? (
                <div className="text-center py-16 px-6 border border-dashed border-white/10 rounded-3xl bg-surface-1">
                    <CalendarClock className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-white mb-2">Sem registros</h3>
                    <p className="text-sm text-gray-500">Complete sua primeira missão para iniciar o log.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {reports.map((report, idx) => (
                        <div 
                            key={report.id || idx}
                            onClick={() => onOpenReport(report)}
                            className="group flex items-start gap-4 p-5 bg-surface-1 rounded-2xl border border-white/5 cursor-pointer hover:border-accent-lime/30 hover:bg-surface-2 transition-all active:scale-[0.99]"
                        >
                            {/* Icon Indicator */}
                            <div className="mt-1 flex-shrink-0">
                                <div className="w-8 h-8 rounded-full bg-accent-lime/10 flex items-center justify-center text-accent-lime border border-accent-lime/20 group-hover:bg-accent-lime group-hover:text-black transition-colors">
                                    <CheckCircle2 size={16} />
                                </div>
                                {idx !== reports.length - 1 && (
                                    <div className="w-0.5 h-full bg-white/5 mx-auto mt-2 min-h-[20px]"></div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-bold text-white text-base">Missão Cumprida</h4>
                                    <span className="text-[10px] font-mono text-gray-500 bg-surface-3 px-2 py-1 rounded-md">{report.date}</span>
                                </div>
                                <p className="text-sm text-gray-400 mt-2 line-clamp-2 leading-relaxed">
                                    {report.analysis}
                                </p>
                            </div>
                            
                            <ChevronRight className="text-gray-600 group-hover:text-white mt-1" size={16} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};