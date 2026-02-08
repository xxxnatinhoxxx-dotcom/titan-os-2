import React from 'react';

// Section Header for consistent spacing
export const SectionHeader = ({ title, subtitle, action }: { title: string, subtitle?: string, action?: React.ReactNode }) => (
    <div className="flex justify-between items-end mb-4 px-1">
        <div>
            {subtitle && <span className="text-[10px] font-bold text-accent-lime uppercase tracking-widest mb-1 block">{subtitle}</span>}
            <h3 className="text-lg font-display font-bold text-white leading-none">{title}</h3>
        </div>
        {action}
    </div>
);

export const TactileInput = React.forwardRef<HTMLInputElement | HTMLTextAreaElement, React.ComponentProps<'input'> & { as?: 'textarea', label?: string }>(
    ({ className, as, label, ...props }, ref) => {
        const BaseComp = as === 'textarea' ? 'textarea' : 'input';
        return (
            <div className="w-full">
                {label && <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 block ml-1">{label}</label>}
                <BaseComp
                    // @ts-ignore
                    ref={ref}
                    className={`bg-surface-2 border border-white/5 rounded-xl p-4 text-white w-full text-sm font-medium focus:bg-surface-3 focus:border-accent-electric outline-none transition-all placeholder-gray-600 shadow-inner ${className}`}
                    {...props}
                />
            </div>
        );
    }
);

export const Button3D = ({ children, variant = 'surface', className, ...props }: React.ComponentProps<'button'> & { variant?: 'surface' | 'lime' | 'electric' | 'danger' }) => {
    let baseStyles = "relative group overflow-hidden flex items-center justify-center gap-2 font-bold text-sm uppercase tracking-wide py-4 px-6 rounded-xl w-full transition-all duration-200 active:scale-[0.98] ";
    
    switch(variant) {
        case 'lime': 
            baseStyles += "bg-accent-lime text-black shadow-[0_0_20px_rgba(212,255,0,0.3)] hover:shadow-[0_0_30px_rgba(212,255,0,0.5)]"; 
            break;
        case 'electric': 
            baseStyles += "bg-accent-electric text-white shadow-[0_0_20px_rgba(46,92,255,0.4)] hover:shadow-[0_0_30px_rgba(46,92,255,0.6)]"; 
            break;
        case 'danger': 
            baseStyles += "bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500 hover:text-white"; 
            break;
        default: 
            baseStyles += "bg-surface-3 text-white border border-white/5 hover:bg-surface-2"; 
            break;
    }

    return (
        <button className={`${baseStyles} ${className}`} {...props}>
            {children}
        </button>
    );
};

export const BentoCard = ({ children, className, onClick, style }: React.ComponentProps<'div'>) => (
    <div 
        onClick={onClick}
        style={style}
        className={`bg-surface-1 rounded-2xl p-5 border border-white/5 relative overflow-hidden transition-all ${onClick ? 'active:scale-[0.98] cursor-pointer hover:border-white/10' : ''} ${className}`}
    >
        {children}
    </div>
);