import { Head, usePage } from '@inertiajs/react';
import { WelcomeHeader } from './Welcome/components/WelcomeHeader';
import { Shirt, AlertCircle, Clock, CalendarDays } from 'lucide-react';
import { useState } from 'react';

interface MasterDay {
    id: string;
    day_name: string;
    uniform_description: string;
    notes: string | null;
}

interface MasterTimeAllocation {
    id: string;
    master_day_id: string;
    type: string;
    period_number: number | null;
    start_time: string;
    end_time: string;
    description: string | null;
}

export default function ScheduleInfo({ days, allocations }: { days: MasterDay[], allocations: Record<string, MasterTimeAllocation[]> }) {
    const { auth } = usePage().props;
    const [activeTab, setActiveTab] = useState<'uniforms' | 'time'>('uniforms');
    const [activeDayId, setActiveDayId] = useState<string>(days[0]?.id || '');

    const formatTime = (time: string) => {
        return time.substring(0, 5); // "08:00:00" -> "08:00"
    };

    const activeDay = days.find(d => d.id === activeDayId) || days[0];
    const activeAllocations = activeDay ? (allocations[activeDay.id] || []) : [];

    return (
        <>
            <Head title="Informasi Jadwal & Seragam - Roster SMK Mandiri" />
            <div className="bg-background text-foreground min-h-screen pb-16">
                <WelcomeHeader auth={auth} />

                <main className="mt-20 px-6 pb-16 max-w-7xl mx-auto">
                    <section className="mb-8">
                        <h2 className="text-3xl md:text-[36px] font-bold text-foreground leading-tight tracking-tight">Informasi Akademik</h2>
                        <p className="text-[16px] text-muted-foreground mt-1">Panduan Seragam dan Alokasi Waktu Belajar</p>
                    </section>

                    {/* Tabs Navigation */}
                    <div className="flex p-1 mb-8 bg-secondary/50 rounded-xl w-full max-w-md border border-border/50">
                        <button
                            onClick={() => setActiveTab('uniforms')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${
                                activeTab === 'uniforms' 
                                ? 'bg-background text-foreground shadow-sm' 
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <Shirt size={16} />
                            Ketentuan Seragam
                        </button>
                        <button
                            onClick={() => setActiveTab('time')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${
                                activeTab === 'time' 
                                ? 'bg-background text-foreground shadow-sm' 
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <Clock size={16} />
                            Alokasi Waktu
                        </button>
                    </div>

                    {/* Tab Content: Uniforms */}
                    {activeTab === 'uniforms' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {days.map((day) => (
                                <div key={day.id} className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all p-6 flex flex-col">
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-xl font-bold text-foreground">{day.day_name}</h3>
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary">
                                            <Shirt size={14} />
                                            {day.uniform_description}
                                        </span>
                                    </div>
                                    {day.notes ? (
                                        <div className="mt-auto flex items-start gap-2.5 text-sm text-amber-600 bg-amber-500/10 p-4 rounded-lg border border-amber-500/20">
                                            <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                            <p className="leading-relaxed">{day.notes}</p>
                                        </div>
                                    ) : (
                                        <div className="mt-auto flex items-center justify-center h-full min-h-[60px] text-sm text-muted-foreground bg-secondary/30 rounded-lg border border-dashed border-border">
                                            Tidak ada catatan khusus
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Tab Content: Time Allocations */}
                    {activeTab === 'time' && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 flex flex-col lg:flex-row gap-8 items-start">
                            {/* Day Pills Sidebar (Horizontal on mobile, vertical on desktop) */}
                            <div className="w-full lg:w-64 flex flex-row lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                                {days.map((day) => (
                                    <button
                                        key={day.id}
                                        onClick={() => setActiveDayId(day.id)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all whitespace-nowrap min-w-max lg:min-w-0 ${
                                            activeDayId === day.id
                                            ? 'bg-primary text-primary-foreground shadow-md'
                                            : 'bg-card border border-border hover:bg-secondary text-foreground'
                                        }`}
                                    >
                                        <CalendarDays size={18} className={activeDayId === day.id ? "text-primary-foreground/80" : "text-muted-foreground"} />
                                        <span className="font-semibold">{day.day_name}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Time Table for Active Day */}
                            <div className="flex-1 w-full bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                                <div className="p-5 border-b border-border bg-muted/30">
                                    <h3 className="text-xl font-bold text-foreground">
                                        Jadwal {activeDay?.day_name}
                                    </h3>
                                </div>
                                <div className="divide-y divide-border/50">
                                    {activeAllocations.map((alloc) => {
                                        const isBreak = alloc.type === 'break' || alloc.type === 'ceremony';
                                        return (
                                            <div key={alloc.id} className={`flex items-center justify-between p-3 sm:p-4 sm:px-6 hover:bg-muted/50 transition-colors ${isBreak ? 'bg-amber-500/5' : ''}`}>
                                                <div className="flex items-center gap-3 sm:gap-6 w-full">
                                                    <div className="w-[100px] sm:w-32 shrink-0 text-[11px] sm:text-sm font-bold text-foreground tabular-nums bg-background/50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md border border-border/50 text-center">
                                                        {formatTime(alloc.start_time)} - {formatTime(alloc.end_time)}
                                                    </div>
                                                    <div className="flex items-center gap-2 sm:gap-3">
                                                        {isBreak ? (
                                                            <div className="p-1 sm:p-1.5 bg-amber-500/20 text-amber-600 rounded-md shrink-0">
                                                                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                            </div>
                                                        ) : (
                                                            <div className="p-1 sm:p-1.5 bg-primary/10 text-primary rounded-md shrink-0">
                                                                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                            </div>
                                                        )}
                                                        <span className={`text-[12px] sm:text-base font-semibold leading-tight ${isBreak ? 'text-amber-600' : 'text-card-foreground'}`}>
                                                            {alloc.type === 'period' ? `Jam ke-${alloc.period_number}` : alloc.description}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {activeAllocations.length === 0 && (
                                        <div className="p-12 text-center text-muted-foreground flex flex-col items-center gap-3">
                                            <Clock size={32} className="text-muted-foreground/50" />
                                            <span>Belum ada alokasi waktu untuk hari ini.</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </>
    );
}
