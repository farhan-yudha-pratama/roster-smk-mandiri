import { Head } from '@inertiajs/react';
import { dashboard as dashboardRoute } from '@/routes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BookOpen, LayoutGrid, DoorOpen, CalendarClock, Shirt, UserCircle, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface StatProps {
    total_teachers: number;
    total_classes: number;
    total_subjects: number;
    total_classrooms: number;
}

interface ScheduleProps {
    time: string;
    class: string;
    subject: string;
    teacher: string;
    room: string;
}

interface EmptyRoomProps {
    room: string;
    type: string;
    status: string;
}

interface TopTeacherProps {
    name: string;
    ganjil: number;
    genap: number;
    total: number;
}

interface DashboardProps {
    stats: StatProps;
    todaySchedules: ScheduleProps[];
    emptyRooms: EmptyRoomProps[];
    uniforms: string[];
    topTeachers: TopTeacherProps[];
    todayDay: string;
    currentDate: string;
}

export default function Dashboard({ stats, todaySchedules, emptyRooms, uniforms, topTeachers, todayDay, currentDate }: DashboardProps) {
    const statsData = [
        { title: "Total Guru", value: stats?.total_teachers || 0, icon: <UserCircle className="h-4 w-4 text-muted-foreground" /> },
        { title: "Rombel Kelas", value: stats?.total_classes || 0, icon: <LayoutGrid className="h-4 w-4 text-muted-foreground" /> },
        { title: "Mata Pelajaran", value: stats?.total_subjects || 0, icon: <BookOpen className="h-4 w-4 text-muted-foreground" /> },
        { title: "Ruangan", value: stats?.total_classrooms || 0, icon: <DoorOpen className="h-4 w-4 text-muted-foreground" /> },
    ];

    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-y-auto rounded-xl p-4 lg:p-8">

                {/* Header Title */}
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                    <p className="text-muted-foreground">
                        Ringkasan informasi penjadwalan dan data akademik sekolah.
                    </p>
                </div>

                {/* 4 Stat Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {statsData.map((stat, i) => (
                        <Card key={i}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {stat.title}
                                </CardTitle>
                                {stat.icon}
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Main Content Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">

                    {/* Today's Schedule Table (Spans 4 columns) */}
                    <Card className="col-span-4 flex flex-col">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CalendarClock className="h-5 w-5" />
                                Jadwal Berjalan Saat Ini
                            </CardTitle>
                            <CardDescription>
                                Jadwal pelajaran yang sedang berlangsung pada hari ini ({currentDate}).
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="border-b bg-muted/50 whitespace-nowrap">
                                    <tr className="text-left">
                                        <th className="p-3 font-medium">Waktu</th>
                                        <th className="p-3 font-medium">Kelas</th>
                                        <th className="p-3 font-medium">Mata Pelajaran</th>
                                        <th className="p-3 font-medium">Guru</th>
                                        <th className="p-3 font-medium">Ruangan</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {todaySchedules?.length > 0 ? (
                                        todaySchedules.map((schedule, i) => (
                                            <tr key={i} className="border-b transition-colors hover:bg-muted/50">
                                                <td className="p-3 whitespace-nowrap">{schedule.time}</td>
                                                <td className="p-3 font-medium">{schedule.class}</td>
                                                <td className="p-3">
                                                    {schedule.subject === '-' ? (
                                                        <Badge variant="secondary">Istirahat</Badge>
                                                    ) : schedule.subject}
                                                </td>
                                                <td className="p-3">{schedule.teacher}</td>
                                                <td className="p-3">{schedule.room}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="p-4 text-center text-muted-foreground">
                                                Tidak ada jadwal yang berlangsung saat ini.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>

                    {/* Right Side Info (Spans 3 columns) */}
                    <div className="col-span-3 flex flex-col gap-4">

                        {/* Info Ruangan Kosong */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-green-600">
                                    Informasi Ruangan Kosong
                                </CardTitle>
                                <CardDescription>
                                    Ruangan yang tidak memiliki jadwal hari ini ({todayDay}).
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                                    {emptyRooms?.length > 0 ? (
                                        emptyRooms.map((empty, i) => (
                                            <div key={i} className="flex items-start justify-between border-b pb-3 last:border-0 last:pb-0">
                                                <div className="flex flex-col gap-1">
                                                    <span className="font-semibold">{empty.room}</span>
                                                    <span className="text-xs text-muted-foreground">{empty.type}</span>
                                                </div>
                                                <Badge variant="outline" className="text-green-600 border-green-600 bg-green-50">{empty.status}</Badge>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-sm text-muted-foreground text-center py-2">
                                            Semua ruangan digunakan hari ini.
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Info Seragam */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shirt className="h-5 w-5" />
                                    Seragam Hari Ini ({todayDay})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="list-disc pl-5 text-sm space-y-1">
                                    {uniforms?.length > 0 ? (
                                        uniforms.map((uniform, i) => (
                                            <li key={i}>{uniform}</li>
                                        ))
                                    ) : (
                                        <li>Bebas Rapi</li>
                                    )}
                                </ul>
                            </CardContent>
                        </Card>

                    </div>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboardRoute(),
        },
    ],
};
