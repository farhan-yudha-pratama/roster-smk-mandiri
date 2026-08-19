import { Head } from '@inertiajs/react';
import { dashboard } from '@/routes';
import { Button } from '@/components/ui/button';
import { PlusIcon, PencilIcon, TrashIcon, ArrowDownAZ, ArrowUpZA, ArrowUpDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useState, useMemo } from 'react';
import { CreateModal } from './components/create-modal';
import { UpdateModal } from './components/update-modal';
import { DeleteModal } from './components/delete-modal';

interface MasterClass { id: string; class_name: string; }
interface MasterSubject { id: string; subject_name: string; }
interface MasterHomeroomTeacher { id: string; teacher_name: string; }
interface MasterClassroom { id: string; room_name: string; }

interface RosterSchedule {
    id: string;
    class_id: string | null;
    day: string;
    week_cycle: string;
    period_number: string | number;
    subject_id: string | null;
    teacher_id: string | null;
    classroom_id: string | null;
    period_duration_hours: string | number;
    master_class?: MasterClass | null;
    subject?: MasterSubject | null;
    teacher?: MasterHomeroomTeacher | null;
    classroom?: MasterClassroom | null;
}

export default function RosterScheduleIndex({ 
    schedules, classes, subjects, teachers, classrooms, days, weekCycles 
}: { 
    schedules: RosterSchedule[], 
    classes: MasterClass[], 
    subjects: MasterSubject[], 
    teachers: MasterHomeroomTeacher[], 
    classrooms: MasterClassroom[], 
    days: string[], 
    weekCycles: string[] 
}) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isUpdateOpen, setIsUpdateOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    
    const [selectedSchedule, setSelectedSchedule] = useState<RosterSchedule | null>(null);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);

    const openUpdateModal = (schedule: RosterSchedule) => {
        setSelectedSchedule(schedule);
        setIsUpdateOpen(true);
    };

    const openDeleteModal = (schedule: RosterSchedule) => {
        setSelectedSchedule(schedule);
        setIsDeleteOpen(true);
    };

    const handleSort = () => {
        if (sortOrder === null || sortOrder === 'desc') {
            setSortOrder('asc');
        } else {
            setSortOrder('desc');
        }
    };

    const sortedSchedules = useMemo(() => {
        if (!sortOrder) return schedules;
        return [...schedules].sort((a, b) => {
            const nameA = a.master_class?.class_name || '';
            const nameB = b.master_class?.class_name || '';
            if (sortOrder === 'asc') {
                return nameA.localeCompare(nameB);
            } else {
                return nameB.localeCompare(nameA);
            }
        });
    }, [schedules, sortOrder]);

    const SortIcon = sortOrder === 'asc' ? ArrowDownAZ : sortOrder === 'desc' ? ArrowUpZA : ArrowUpDown;

    return (
        <>
            <Head title="Manajemen Jadwal Mengajar" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 lg:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Jadwal Mengajar</h2>
                        <p className="text-muted-foreground">
                            Kelola jadwal induk dan roster kelas.
                        </p>
                    </div>
                    <div>
                        <Button className="w-full sm:w-auto" onClick={() => setIsCreateOpen(true)}>
                            <PlusIcon className="mr-2 h-4 w-4" />
                            Tambah Jadwal
                        </Button>
                    </div>
                </div>

                <div className="flex justify-end md:hidden">
                    <Button variant="outline" size="sm" onClick={handleSort} className="gap-2">
                        <SortIcon className="h-4 w-4" />
                        Urutkan Kelas
                    </Button>
                </div>

                {/* Mobile View: Cards */}
                <div className="grid grid-cols-1 gap-4 md:hidden">
                    {sortedSchedules.length === 0 && (
                        <div className="text-center p-4 text-muted-foreground border rounded-xl bg-card">
                            Tidak ada jadwal yang ditemukan.
                        </div>
                    )}
                    {sortedSchedules.map((schedule) => (
                        <Card key={schedule.id} className="py-2">
                            <CardHeader className="pb-2">
                                <div className="flex items-start justify-between">
                                    <div className="flex flex-col">
                                        <CardTitle className="text-lg font-semibold">
                                            {schedule.subject?.subject_name || 'Tanpa Mata Pelajaran'}
                                        </CardTitle>
                                        <CardDescription className="mt-1 font-medium">
                                            Kelas: {schedule.master_class?.class_name || 'Tanpa Kelas'}
                                        </CardDescription>
                                        <span className="text-xs text-muted-foreground mt-0.5">
                                            Ruang: {schedule.classroom?.room_name || 'Tanpa Ruang'}
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold bg-primary/10 text-primary">
                                            {schedule.day} ({schedule.week_cycle})
                                        </span>
                                        <span className="text-[10px] text-muted-foreground font-medium">
                                            Jam {schedule.period_number} - {schedule.period_duration_hours}JP
                                        </span>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pb-2 pt-0">
                                <div className="text-sm font-medium">
                                    Guru: {schedule.teacher?.teacher_name || <span className="italic text-muted-foreground">Tanpa Guru</span>}
                                </div>
                            </CardContent>
                            <CardFooter className="pt-2 flex gap-2 justify-end border-t">
                                <Button variant="outline" size="sm" onClick={() => openUpdateModal(schedule)}>
                                    Edit
                                </Button>
                                <Button variant="destructive" size="sm" onClick={() => openDeleteModal(schedule)}>
                                    Hapus
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                {/* Desktop View: Table */}
                <div className="hidden md:block rounded-md border bg-card">
                    <table className="w-full text-sm">
                        <thead className="border-b bg-muted/50 whitespace-nowrap">
                            <tr className="text-left">
                                <th className="p-4 font-medium">ID</th>
                                <th className="p-4 font-medium cursor-pointer hover:bg-muted/80 transition-colors" onClick={handleSort}>
                                    <div className="flex items-center gap-2">
                                        Kelas
                                        <SortIcon className="h-4 w-4" />
                                    </div>
                                </th>
                                <th className="p-4 font-medium">Waktu</th>
                                <th className="p-4 font-medium">Mata Pelajaran</th>
                                <th className="p-4 font-medium">Guru</th>
                                <th className="p-4 font-medium">Ruang</th>
                                <th className="p-4 font-medium text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedSchedules.map((schedule) => (
                                <tr key={schedule.id} className="border-b transition-colors hover:bg-muted/50">
                                    <td className="p-4 font-medium">{schedule.id.substring(0, 8)}...</td>
                                    <td className="p-4">{schedule.master_class?.class_name || '-'}</td>
                                    <td className="p-4 whitespace-nowrap">
                                        <span className="font-medium">{schedule.day} ({schedule.week_cycle})</span><br/>
                                        <span className="text-muted-foreground text-xs">Jam {schedule.period_number} - {schedule.period_duration_hours}JP</span>
                                    </td>
                                    <td className="p-4">{schedule.subject?.subject_name || '-'}</td>
                                    <td className="p-4">{schedule.teacher?.teacher_name || '-'}</td>
                                    <td className="p-4">{schedule.classroom?.room_name || '-'}</td>
                                    <td className="p-4 text-right space-x-2 whitespace-nowrap">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="outline" size="sm" onClick={() => openUpdateModal(schedule)}>
                                                Edit
                                            </Button>
                                            <Button variant="destructive" size="sm" onClick={() => openDeleteModal(schedule)}>
                                                Hapus
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            
                            {sortedSchedules.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="p-4 text-center text-muted-foreground">
                                        Tidak ada jadwal yang ditemukan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <CreateModal 
                isOpen={isCreateOpen} 
                onClose={() => setIsCreateOpen(false)} 
                classes={classes}
                subjects={subjects}
                teachers={teachers}
                classrooms={classrooms}
                days={days}
                weekCycles={weekCycles}
            />

            <UpdateModal 
                isOpen={isUpdateOpen} 
                onClose={() => {
                    setIsUpdateOpen(false);
                    setTimeout(() => setSelectedSchedule(null), 300);
                }} 
                schedule={selectedSchedule} 
                classes={classes}
                subjects={subjects}
                teachers={teachers}
                classrooms={classrooms}
                days={days}
                weekCycles={weekCycles}
            />

            <DeleteModal 
                isOpen={isDeleteOpen} 
                onClose={() => {
                    setIsDeleteOpen(false);
                    setTimeout(() => setSelectedSchedule(null), 300);
                }} 
                schedule={selectedSchedule} 
            />
        </>
    );
}

RosterScheduleIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dasbor',
            href: dashboard(),
        },
        {
            title: 'Jadwal Mengajar',
            href: '/roster-schedules',
        },
    ],
};
