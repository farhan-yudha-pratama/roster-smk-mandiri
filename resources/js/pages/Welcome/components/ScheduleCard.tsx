import { User } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export function ScheduleCard({
    time,
    status,
    title,
    teacher,
    location,
    LocationIcon,
    className,
    wali,
    isActiveNow = false,
    id
}: {
    time: string;
    status: string;
    title: string;
    teacher: string;
    location: string;
    LocationIcon: LucideIcon;
    className: string;
    wali: string;
    isActiveNow?: boolean;
    id?: string;
}) {
    return (
        <div id={id} className={`bg-card text-card-foreground border p-6 rounded-xl transition-all group relative overflow-hidden ${
            isActiveNow 
            ? 'border-primary border-2 shadow-md bg-primary/5' 
            : 'border-border shadow-sm hover:border-primary/50'
        }`}>
            {isActiveNow && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1.5 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    SEDANG BERLANGSUNG
                </div>
            )}
            
            <div className="flex justify-between items-start mb-4">
                <span className={`text-[12px] font-mono px-2 py-0.5 rounded font-bold ${isActiveNow ? 'bg-primary text-primary-foreground' : 'text-primary bg-primary/10'}`}>
                    {time}
                </span>
                
                <div className="flex items-center gap-1.5">
                    {status === 'SEKARANG' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>}
                    {status === 'SELESAI' && <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>}
                    {status === 'MENDATANG' && <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>}
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{status}</span>
                </div>
            </div>

            <h3 className="text-[18px] font-semibold text-foreground group-hover:text-primary">{title}</h3>

            <div className="flex items-center gap-2 mt-4 text-muted-foreground">
                <User size={18} />
                <span className="text-[14px] font-medium">{teacher}</span>
            </div>

            <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary border border-border rounded-lg text-secondary-foreground shadow-sm">
                    <LocationIcon size={14} className="text-muted-foreground" />
                    <span className="text-[11px] font-bold uppercase tracking-widest">{location}</span>
                </div>
            </div>

            <div className="mt-5 pt-4 border-t border-border flex justify-between items-center text-muted-foreground">
                <span className="text-[12px] font-medium">Kelas: <span className="font-bold text-foreground">{className}</span></span>
                <span className="text-[12px] font-medium">Wali: <span className="text-foreground">{wali}</span></span>
            </div>
        </div>
    );
}
