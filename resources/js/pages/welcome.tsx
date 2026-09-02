import { Head, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { WelcomeHeader } from './Welcome/components/WelcomeHeader';
import { WelcomeFilters } from './Welcome/components/WelcomeFilters';
import { ScheduleCard } from './Welcome/components/ScheduleCard';
import { MapPin, Clock, CalendarDays, BookOpen, Coffee, CheckCircle2, AlarmClock, XCircle } from 'lucide-react';

interface RosterSchedule {
    id: string;
    period_number: number;
    period_duration_hours: number;
    subject?: { subject_name: string };
    teacher?: { teacher_name: string };
    classroom?: { room_name: string };
    master_class?: {
        class_name: string;
        homeroom_teacher?: { teacher_name: string };
    };
    start_time?: string;
    end_time?: string;
}

interface TimeAllocation {
    id: string;
    name: string;
    type: string;
    period_number: number | null;
    start_time: string;
    end_time: string;
    description: string | null;
}

interface ScheduleStatus {
    status: 'NO_SCHEDULE' | 'NOT_STARTED' | 'ENDED' | 'ACTIVE' | 'BREAK';
    message: string;
    allocation: TimeAllocation | null;
    first_time: string | null;
    last_time: string | null;
    all_allocations: TimeAllocation[];
}

function formatTime(startTime?: string, endTime?: string) {
    if (!startTime || !endTime) return '-';
    const fmt = (t: string) => t.split(':').slice(0, 2).join(':');
    return `${fmt(startTime)} - ${fmt(endTime)}`;
}

function fmt(t?: string | null) {
    if (!t) return '--:--';
    return t.split(':').slice(0, 2).join(':');
}

export default function Welcome({
    schedules = [],
    filters = {},
    currentScheduleStatus,
    currentTime,
}: {
    schedules: RosterSchedule[];
    filters: any;
    currentScheduleStatus?: ScheduleStatus;
    currentTime?: string;
}) {
    const { auth } = usePage().props;

    const getIndonesianDay = (day: string) => {
        const map: Record<string, string> = {
            Monday: 'Senin', Tuesday: 'Selasa', Wednesday: 'Rabu',
            Thursday: 'Kamis', Friday: 'Jumat', Saturday: 'Sabtu', Sunday: 'Minggu',
        };
        return map[day] || day;
    };

    const displayDay =
        filters.day && filters.day !== 'all'
            ? getIndonesianDay(filters.day)
            : getIndonesianDay(new Date().toLocaleDateString('en-US', { weekday: 'long' }));
    const displayCycle =
        filters.week_cycle === 'all' ? 'SEMUA SIKLUS' : `MINGGU ${filters.week_cycle}`;
    const actualCurrentDay = getIndonesianDay(
        new Date().toLocaleDateString('en-US', { weekday: 'long' })
    );
    const isToday = displayDay === actualCurrentDay;

    // Auto-scroll ke jam aktif
    useEffect(() => {
        if (currentTime && schedules.length > 0 && isToday) {
            const activeSchedule = schedules.find(
                s => currentTime >= (s.start_time || '') && currentTime <= (s.end_time || '')
            );
            
            if (activeSchedule) {
                // Beri sedikit delay agar DOM dirender
                setTimeout(() => {
                    const el = document.getElementById(`schedule-${activeSchedule.id}`);
                    if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }, 100);
            }
        }
    }, [currentTime, schedules, isToday]);

    const sortedSchedules = [...schedules].sort((a, b) => {
        if (!isToday || !currentTime) return 0;
        const aActive = currentTime >= (a.start_time || '') && currentTime <= (a.end_time || '');
        const bActive = currentTime >= (b.start_time || '') && currentTime <= (b.end_time || '');
        if (aActive && !bActive) return -1;
        if (!aActive && bActive) return 1;
        return 0;
    });

    type StatusKey = 'ACTIVE' | 'BREAK' | 'NOT_STARTED' | 'ENDED' | 'NO_SCHEDULE';

    const statusConfig: Record<StatusKey, {
        outerBg: string;
        iconColor: string;
        dotClass: string;
        labelColor: string;
        valueColor: string;
        noteColor: string;
        Icon: React.ElementType;
    }> = {
        ACTIVE: {
            outerBg: 'bg-emerald-500/10 border-emerald-500/30',
            iconColor: 'text-emerald-500',
            dotClass: 'bg-emerald-500 animate-pulse',
            labelColor: 'text-emerald-600 dark:text-emerald-400',
            valueColor: 'text-emerald-700 dark:text-emerald-300',
            noteColor: 'text-emerald-600/70 dark:text-emerald-400/70',
            Icon: BookOpen,
        },
        BREAK: {
            outerBg: 'bg-sky-500/10 border-sky-500/30',
            iconColor: 'text-sky-500',
            dotClass: 'bg-sky-500 animate-pulse',
            labelColor: 'text-sky-600 dark:text-sky-400',
            valueColor: 'text-sky-700 dark:text-sky-300',
            noteColor: 'text-sky-600/70 dark:text-sky-400/70',
            Icon: Coffee,
        },
        NOT_STARTED: {
            outerBg: 'bg-amber-500/10 border-amber-500/30',
            iconColor: 'text-amber-500',
            dotClass: 'bg-amber-400',
            labelColor: 'text-amber-600 dark:text-amber-400',
            valueColor: 'text-amber-700 dark:text-amber-300',
            noteColor: 'text-amber-600/70 dark:text-amber-400/70',
            Icon: AlarmClock,
        },
        ENDED: {
            outerBg: 'bg-rose-500/10 border-rose-500/30',
            iconColor: 'text-rose-500',
            dotClass: 'bg-rose-500',
            labelColor: 'text-rose-600 dark:text-rose-400',
            valueColor: 'text-rose-700 dark:text-rose-300',
            noteColor: 'text-rose-600/70 dark:text-rose-400/70',
            Icon: CheckCircle2,
        },
        NO_SCHEDULE: {
            outerBg: 'bg-secondary border-border',
            iconColor: 'text-muted-foreground',
            dotClass: 'bg-muted-foreground',
            labelColor: 'text-muted-foreground',
            valueColor: 'text-muted-foreground',
            noteColor: 'text-muted-foreground/60',
            Icon: XCircle,
        },
    };

    const status: StatusKey = (currentScheduleStatus?.status as StatusKey) ?? 'NO_SCHEDULE';
    const cfg = statusConfig[status];
    const { Icon } = cfg;
    const alloc = currentScheduleStatus?.allocation;

    let jpValueText = currentScheduleStatus?.message ?? 'Tidak Ada Jadwal';
    if (status === 'ACTIVE' && alloc) jpValueText = alloc.name;
    else if (status === 'BREAK' && alloc) jpValueText = alloc.name;

    let jpTimeText: string | null = null;
    if ((status === 'ACTIVE' || status === 'BREAK') && alloc) {
        jpTimeText = formatTime(alloc.start_time, alloc.end_time);
    }

    let jpNote: string | null = null;
    if (status === 'NOT_STARTED' && currentScheduleStatus?.first_time) {
        jpNote = `Mulai pukul ${fmt(currentScheduleStatus.first_time)} WIB`;
    } else if (status === 'ENDED' && currentScheduleStatus?.last_time) {
        jpNote = `Berakhir pukul ${fmt(currentScheduleStatus.last_time)} WIB`;
    }

    return (
        <>
            <Head title="Roster SMK Mandiri" />
            <div className="bg-background text-foreground min-h-screen pb-16 pt-8">
                <WelcomeHeader auth={auth} />

                <main className="mt-20 px-4 md:px-6 pb-16 max-w-7xl mx-auto">

                    {/* Premium Welcome & Status */}
                    <section className="mb-10">
                        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
                            <div>
                                <h2 className="text-3xl md:text-[40px] font-extrabold text-foreground leading-tight tracking-tight drop-shadow-sm">
                                    Dashboard Jadwal
                                </h2>
                                <p className="text-base md:text-lg text-muted-foreground mt-2 font-medium">
                                    Tahun Pelajaran 2026/2027
                                </p>
                            </div>

                            {/* Minimalist Premium Status Panel for Desktop, Grid for Mobile */}
                            <div className="flex flex-col md:flex-row gap-3 md:items-stretch xl:items-end">
                                {/* Date & Time Group - unified on desktop */}
                                <div className="flex gap-3">
                                    {/* Hari & Siklus */}
                                    <div className="flex items-center gap-3 p-3 md:px-4 md:py-3 rounded-2xl bg-secondary/40 border border-border/60 shadow-sm backdrop-blur-md hover:bg-secondary/60 transition-all group flex-1 md:flex-initial">
                                        <div className="p-2 bg-background/80 rounded-lg group-hover:scale-110 transition-transform shadow-sm">
                                            <CalendarDays className="w-4 h-4 text-primary" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                                                Hari & Siklus
                                            </span>
                                            <div className="flex items-baseline gap-1.5 mt-0.5">
                                                <span className="text-sm md:text-base font-black text-foreground">{displayDay}</span>
                                                <span className="text-[10px] md:text-xs text-primary font-bold">{displayCycle}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Jam */}
                                    {/* <div className="flex items-center gap-3 p-3 md:px-4 md:py-3 rounded-2xl bg-secondary/40 border border-border/60 shadow-sm backdrop-blur-md hover:bg-secondary/60 transition-all group flex-1 md:flex-initial">
                                        <div className="p-2 bg-background/80 rounded-lg group-hover:scale-110 transition-transform shadow-sm">
                                            <Clock className="w-4 h-4 text-primary" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                                                Waktu Lokal
                                            </span>
                                            <div className="flex items-baseline gap-1 mt-0.5">
                                                <span className="text-sm md:text-base font-black text-foreground tabular-nums">{currentTime ?? '--:--'}</span>
                                                <span className="text-[10px] text-muted-foreground font-semibold">WIB</span>
                                            </div>
                                        </div>
                                    </div> */}
                                </div>

                                {/* JP Status Panel */}
                                <div className={`flex items-center gap-3 p-3 md:px-5 md:py-3 rounded-2xl border ${cfg.outerBg} shadow-sm backdrop-blur-md hover:shadow-md transition-all relative overflow-hidden group flex-1 md:flex-initial md:min-w-[280px]`}>
                                    {/* Glowing background accent */}
                                    <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-2xl opacity-20 ${cfg.dotClass}`} />

                                    <div className={`p-2 rounded-lg bg-background/60 shadow-sm backdrop-blur-sm group-hover:scale-110 transition-transform border border-border/30 relative z-10`}>
                                        <Icon className={`w-4 h-4 ${cfg.iconColor}`} />
                                    </div>

                                    <div className="flex flex-col relative z-10 w-full">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[10px] uppercase tracking-widest font-bold ${cfg.labelColor}`}>
                                                Status JP • {actualCurrentDay}
                                            </span>
                                            <span className={`w-1.5 h-1.5 rounded-full shadow-sm ${cfg.dotClass}`} />
                                        </div>

                                        <div className="flex flex-col md:flex-row md:items-baseline md:gap-2 mt-0.5">
                                            <span className={`text-sm md:text-base font-black tracking-tight ${cfg.valueColor}`}>
                                                {jpValueText}
                                            </span>
                                            {jpTimeText && (
                                                <span className={`text-[11px] md:text-xs font-bold ${cfg.labelColor} opacity-90`}>
                                                    {jpTimeText}
                                                </span>
                                            )}
                                        </div>
                                        {jpNote && (
                                            <span className={`text-[10px] font-semibold mt-0.5 ${cfg.noteColor}`}>
                                                {jpNote}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <WelcomeFilters filters={filters} />

                    {/* Schedule Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="schedule-container">
                        {sortedSchedules.map((schedule) => {
                            const startTime = schedule.start_time || '';
                            const endTime = schedule.end_time || '';
                            let scheduleStatus = 'MENDATANG';
                            let isActiveNow = false;
                            
                            if (currentTime) {
                                if (!isToday) {
                                    const dayIndices: Record<string, number> = { 'Senin': 1, 'Selasa': 2, 'Rabu': 3, 'Kamis': 4, 'Jumat': 5, 'Sabtu': 6, 'Minggu': 7 };
                                    const dIdx = dayIndices[displayDay] || 0;
                                    const aIdx = dayIndices[actualCurrentDay] || 0;
                                    if (dIdx < aIdx) {
                                        scheduleStatus = 'SELESAI';
                                    } else {
                                        scheduleStatus = 'MENDATANG';
                                    }
                                } else {
                                    if (currentTime > endTime) {
                                        scheduleStatus = 'SELESAI';
                                    } else if (currentTime >= startTime && currentTime <= endTime) {
                                        scheduleStatus = 'SEKARANG';
                                        isActiveNow = true;
                                    }
                                }
                            }

                            return (
                                <ScheduleCard
                                    key={schedule.id}
                                    id={`schedule-${schedule.id}`}
                                    isActiveNow={isActiveNow}
                                    time={formatTime(schedule.start_time, schedule.end_time)}
                                    status={scheduleStatus}
                                    title={schedule.subject?.subject_name || 'Belum Ditentukan'}
                                    teacher={schedule.teacher?.teacher_name || '-'}
                                    location={schedule.classroom?.room_name || '-'}
                                    LocationIcon={MapPin}
                                    className={schedule.master_class?.class_name || '-'}
                                    wali={schedule.master_class?.homeroom_teacher?.teacher_name || '-'}
                                />
                            );
                        })}
                        {schedules.length === 0 && (
                            <div className="col-span-full text-center py-12 text-muted-foreground">
                                Tidak ada jadwal yang tersedia saat ini.
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </>
    );
}
