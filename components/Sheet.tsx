import React from 'react';
import { X } from 'lucide-react';

interface SheetProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    headerAction?: React.ReactNode;
}

export const Sheet: React.FC<SheetProps> = ({ isOpen, onClose, title, children, footer, headerAction }) => {
    return (
        <>
            {/* Overlay */}
            <div 
                className={`fixed inset-0 bg-black/80 backdrop-blur-md z-[200] transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />
            
            {/* Sheet Content */}
            <div 
                className={`fixed bottom-0 left-0 w-full bg-surface-1 rounded-t-[32px] z-[210] flex flex-col shadow-[-20px_0_80px_rgba(0,0,0,0.8)] border-t border-white/10 transition-transform duration-400 cubic-bezier(0.34, 1.56, 0.64, 1) ${isOpen ? 'translate-y-0' : 'translate-y-[110%]'}`}
                style={{ maxHeight: '94vh', height: 'auto' }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex-shrink-0 px-6 py-5 flex justify-between items-center border-b border-white/5">
                    {title ? (
                        <h2 className="text-xl font-display font-bold text-white uppercase">{title}</h2>
                    ) : (
                        <div>{headerAction}</div>
                    )}
                    <button 
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-surface-3 text-white flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Scrollable Body */}
                <div className="flex-1 overflow-y-auto px-6 py-6 overscroll-contain pb-20">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="flex-shrink-0 px-6 py-4 bg-gradient-to-t from-surface-1 via-surface-1 to-transparent pb-[calc(20px+env(safe-area-inset-bottom))]">
                        {footer}
                    </div>
                )}
            </div>
        </>
    );
};