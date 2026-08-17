import { Head, usePage } from '@inertiajs/react';
import { WelcomeHeader } from './Welcome/components/WelcomeHeader';
import { WelcomeFilters } from './Welcome/components/WelcomeFilters';
import { ScheduleCard } from './Welcome/components/ScheduleCard';
import { BottomNav } from './Welcome/components/BottomNav';
import { MapPin, Wrench, Router, Bike } from 'lucide-react';

interface RosterSchedule {
    id: string;
    period_number: number;
    period_duration_hours: number;
    subject?: { subject_name: string };
    user?: { name: string };
    classroom?: { room_name: string };
    master_class?: { 
        class_name: string;
        homeroom_teacher?: { teacher_name: string };
    };
}

function formatTime(periodNumber: number, durationHours: number) {
    const startMinutes = 7 * 60 + (periodNumber - 1) * 45;
    const endMinutes = startMinutes + (durationHours * 45);

    const formatHour = (mins: number) => {
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    };

    return `${formatHour(startMinutes)} - ${formatHour(endMinutes)}`;
}

export default function Welcome({ schedules = [], filters = {} }: { schedules: RosterSchedule[], filters: any }) {
    const { auth } = usePage().props;

    // Build the dynamic date display based on the selected day or current day
    const getIndonesianDay = (day: string) => {
        const map: Record<string, string> = {
            'Monday': 'Senin',
            'Tuesday': 'Selasa',
            'Wednesday': 'Rabu',
            'Thursday': 'Kamis',
            'Friday': 'Jumat',
            'Saturday': 'Sabtu',
            'Sunday': 'Minggu'
        };
        return map[day] || day;
    };

    const displayDay = filters.day && filters.day !== 'all' ? getIndonesianDay(filters.day) : getIndonesianDay(new Date().toLocaleDateString('en-US', { weekday: 'long' }));
    const displayCycle = filters.week_cycle === 'all' ? 'SEMUA SIKLUS' : `MINGGU ${filters.week_cycle}`;

    return (
        <>
            <Head title="Roster SMK Mandiri" />
            <div className="bg-background text-foreground min-h-screen pb-16">
                <WelcomeHeader auth={auth} />

                <main className="mt-20 px-6 pb-16 max-w-7xl mx-auto">
                    {/* Welcome & Status */}
                    <section className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h2 className="text-[36px] font-bold text-foreground leading-tight tracking-tight">Dashboard Jadwal</h2>
                            <p className="text-[16px] text-muted-foreground mt-1">Tahun Pelajaran 2026/2027</p>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-secondary border border-border rounded-lg">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            <span className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider">
                                Hari Ini: {displayDay} | <span className="font-bold text-primary">{displayCycle}</span>
                            </span>
                        </div>
                    </section>

                    <WelcomeFilters filters={filters} />

                    {/* Content Area: Schedule Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="schedule-container">
                        {schedules.map((schedule) => (
                            <ScheduleCard
                                key={schedule.id}
                                time={formatTime(schedule.period_number, schedule.period_duration_hours)}
                                status="Active"
                                title={schedule.subject?.subject_name || 'Belum Ditentukan'}
                                teacher={schedule.user?.name || '-'}
                                location={schedule.classroom?.room_name || '-'}
                                LocationIcon={MapPin}
                                className={schedule.master_class?.class_name || '-'}
                                wali={schedule.master_class?.homeroom_teacher?.teacher_name || '-'}
                            />
                        ))}
                        {schedules.length === 0 && (
                            <div className="col-span-full text-center py-12 text-muted-foreground">
                                Tidak ada jadwal yang tersedia saat ini.
                            </div>
                        )}
                    </div>
                </main>

                <BottomNav />
            </div>
        </>
    );
}
