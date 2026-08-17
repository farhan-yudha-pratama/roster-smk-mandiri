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
    wali
}: {
    time: string;
    status: 'Active' | 'Upcoming';
    title: string;
    teacher: string;
    location: string;
    LocationIcon: LucideIcon;
    className: string;
    wali: string;
}) {
    return (
        <div className="bg-card text-card-foreground border border-border p-6 rounded-lg hover:border-primary group shadow-sm">
            <div className="flex justify-between items-start mb-4">
                <span className="text-[12px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">{time}</span>
                {status === 'Active' ? (
                    <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span className="text-[12px] font-medium text-muted-foreground">Active</span>
                    </div>
                ) : (
                    <span className="text-[12px] font-medium text-muted-foreground">Upcoming</span>
                )}
            </div>

            <h3 className="text-[18px] font-semibold text-foreground group-hover:text-primary">{title}</h3>

            <div className="flex items-center gap-2 mt-4 text-muted-foreground">
                <User size={18} />
                <span className="text-[14px]">{teacher}</span>
            </div>

            <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center gap-1 px-4 py-1 bg-secondary border border-border rounded-full text-secondary-foreground">
                    <LocationIcon size={16} />
                    <span className="text-[12px] font-medium uppercase">{location}</span>
                </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border flex justify-between items-center text-muted-foreground">
                <span className="text-[12px] font-medium">Kelas: <span className="font-bold text-foreground">{className}</span></span>
                <span className="text-[12px] font-medium">Wali: {wali}</span>
            </div>
        </div>
    );
}
