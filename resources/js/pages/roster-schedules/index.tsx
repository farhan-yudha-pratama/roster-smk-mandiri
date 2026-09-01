import { Head, router, Link } from '@inertiajs/react';
import { dashboard } from '@/routes';
import { Button } from '@/components/ui/button';
import { PlusIcon, ArrowDownAZ, ArrowUpZA, ArrowUpDown, Upload, Download, Clock, MapPin, User, BookOpen, Calendar, Filter, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useState, useMemo } from 'react';
import { CreateModal } from './components/create-modal';
import { UpdateModal } from './components/update-modal';
import { DeleteModal } from './components/delete-modal';
import { CreateBatchRosterScheduleModal } from './components/create-batch-roster-schedule-modal';

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

interface PaginatedData<T> {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
}

export default function RosterScheduleIndex({ 
    schedules, classes, subjects, teachers, classrooms, days, weekCycles, filters 
}: { 
    schedules: PaginatedData<RosterSchedule>, 
    classes: MasterClass[], 
    subjects: MasterSubject[], 
    teachers: MasterHomeroomTeacher[], 
    classrooms: MasterClassroom[], 
    days: string[], 
    weekCycles: string[],
    filters: { gradeFilter: string; dayFilter: string; teacherFilter: string }
}) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [isUpdateOpen, setIsUpdateOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    
    const [selectedSchedule, setSelectedSchedule] = useState<RosterSchedule | null>(null);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);

    const [gradeFilter, setGradeFilter] = useState<string>(filters?.gradeFilter || 'all');
    const [dayFilter, setDayFilter] = useState<string>(filters?.dayFilter || 'all');
    const [teacherFilter, setTeacherFilter] = useState<string>(filters?.teacherFilter || 'all');

    const handleFilterChange = (key: string, value: string) => {
        if (key === 'gradeFilter') setGradeFilter(value);
        if (key === 'dayFilter') setDayFilter(value);
        if (key === 'teacherFilter') setTeacherFilter(value);

        const currentFilters = { 
            gradeFilter: key === 'gradeFilter' ? value : gradeFilter, 
            dayFilter: key === 'dayFilter' ? value : dayFilter, 
            teacherFilter: key === 'teacherFilter' ? value : teacherFilter 
        };
        
        router.get('/roster-schedules', currentFilters, { preserveState: true, preserveScroll: true, replace: true });
    };

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

    const resetFilters = () => {
        setGradeFilter('all');
        setDayFilter('all');
        setTeacherFilter('all');
        router.get('/roster-schedules', { resetFilter: true }, { preserveState: true, preserveScroll: true });
    };

    const isFiltered = gradeFilter !== 'all' || dayFilter !== 'all' || teacherFilter !== 'all';

    const sortedSchedules = useMemo(() => {
        let result = schedules.data;

        if (!sortOrder) return result;
        return [...result].sort((a, b) => {
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
            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-8 max-w-7xl mx-auto w-full">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-sm border border-primary/20">
                                <Calendar className="h-6 w-6" />
                            </div>
                            <h2 className="text-3xl font-bold tracking-tight">Jadwal Mengajar</h2>
                        </div>
                        <p className="text-muted-foreground max-w-xl text-sm md:text-base">
                            Kelola jadwal induk dan roster kelas. Tentukan guru, mata pelajaran, dan waktu dengan mudah.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                        <a href="/roster-schedules/export" className="w-full sm:w-auto">
                            <Button variant="outline" className="w-full gap-2 bg-background hover:bg-muted shadow-sm">
                                <Download className="h-4 w-4" />
                                <span>Export Batch</span>
                            </Button>
                        </a>
                        <Button variant="outline" onClick={() => setIsImportOpen(true)} className="w-full sm:w-auto gap-2 bg-background hover:bg-muted shadow-sm">
                            <Upload className="h-4 w-4" />
                            <span>Import Batch</span>
                        </Button>
                        <Button className="w-full sm:w-auto gap-2 shadow-md hover:shadow-lg transition-all" onClick={() => setIsCreateOpen(true)}>
                            <PlusIcon className="h-4 w-4" />
                            Tambah Jadwal
                        </Button>
                    </div>
                </div>

                {/* Filters Section */}
                <div className="rounded-xl border border-muted bg-muted/30 shadow-sm backdrop-blur-sm p-3 sm:p-4">
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between border-b pb-2">
                            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                <Filter className="h-4 w-4 text-primary" />
                                Filter Jadwal
                            </div>
                            {isFiltered && (
                                <Button variant="ghost" size="sm" onClick={resetFilters} className="h-8 px-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors">
                                    <X className="mr-1.5 h-3.5 w-3.5" />
                                    Reset Filter
                                </Button>
                            )}
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Angkatan / Kelas</label>
                                <Select value={gradeFilter} onValueChange={(val) => handleFilterChange('gradeFilter', val)}>
                                    <SelectTrigger className="bg-background shadow-sm border-muted/80 h-9">
                                        <SelectValue placeholder="Pilih Angkatan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Angkatan</SelectItem>
                                        <SelectItem value="X">Kelas X</SelectItem>
                                        <SelectItem value="XI">Kelas XI</SelectItem>
                                        <SelectItem value="XII">Kelas XII</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Hari</label>
                                <Select value={dayFilter} onValueChange={(val) => handleFilterChange('dayFilter', val)}>
                                    <SelectTrigger className="bg-background shadow-sm border-muted/80 h-9">
                                        <SelectValue placeholder="Pilih Hari" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Hari</SelectItem>
                                        {days.map(d => (
                                            <SelectItem key={d} value={d}>{d}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Guru Pengajar</label>
                                <Select value={teacherFilter} onValueChange={(val) => handleFilterChange('teacherFilter', val)}>
                                    <SelectTrigger className="bg-background shadow-sm border-muted/80 h-9">
                                        <SelectValue placeholder="Pilih Guru" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Guru</SelectItem>
                                        {teachers.map(t => (
                                            <SelectItem key={t.id} value={t.id}>{t.teacher_name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex flex-col gap-4 mt-2">
                    <div className="flex items-center justify-between md:justify-end">
                        <span className="text-sm font-medium text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                            Menampilkan {schedules.from || 0} - {schedules.to || 0} dari {schedules.total} jadwal
                        </span>
                        <div className="md:hidden">
                            <Button variant="outline" size="sm" onClick={handleSort} className="gap-2 bg-background shadow-sm">
                                <SortIcon className="h-4 w-4" />
                                Urutkan Kelas
                            </Button>
                        </div>
                    </div>

                    {sortedSchedules.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 px-4 border rounded-2xl bg-card border-dashed shadow-sm">
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted/80 mb-5 shadow-inner">
                                <Calendar className="h-10 w-10 text-muted-foreground/50" />
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-center text-foreground">Belum ada jadwal</h3>
                            <p className="text-muted-foreground text-center max-w-md mb-8 text-sm">
                                {isFiltered 
                                    ? "Tidak ada jadwal yang sesuai dengan filter yang Anda terapkan. Coba ubah filter Anda untuk melihat jadwal lainnya." 
                                    : "Mulai dengan menambahkan jadwal baru atau import jadwal secara massal menggunakan file Excel."}
                            </p>
                            <div className="flex flex-wrap items-center justify-center gap-3">
                                {isFiltered && (
                                    <Button variant="outline" onClick={resetFilters} className="bg-background">Reset Filter</Button>
                                )}
                                <Button onClick={() => setIsCreateOpen(true)} className="shadow-md">
                                    <PlusIcon className="mr-2 h-4 w-4" />
                                    Tambah Jadwal
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Mobile View: Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
                                {sortedSchedules.map((schedule) => (
                                    <Card key={schedule.id} className="overflow-hidden transition-all hover:shadow-md border-muted/60 bg-card group relative">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-primary/80"></div>
                                        <CardHeader className="p-4 pb-3 pl-5">
                                            <div className="flex justify-between items-start mb-2 gap-2">
                                                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 rounded-md font-semibold shrink-0">
                                                    {schedule.master_class?.class_name || 'Tanpa Kelas'}
                                                </Badge>
                                                <Badge variant="secondary" className="rounded-md shrink-0 text-[10px]">
                                                    {schedule.day} • {schedule.week_cycle}
                                                </Badge>
                                            </div>
                                            <CardTitle className="text-lg leading-tight flex items-start gap-2 pt-1">
                                                <BookOpen className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                                                <span className="font-bold text-foreground/90">{schedule.subject?.subject_name || 'Tanpa Mata Pelajaran'}</span>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-4 pt-1 pb-4 pl-5 space-y-3">
                                            <div className="flex items-center gap-3 text-sm text-muted-foreground bg-muted/30 p-2 rounded-lg">
                                                <User className="h-4 w-4 shrink-0 text-primary/70" />
                                                <span className="truncate font-medium">{schedule.teacher?.teacher_name || 'Tanpa Guru'}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                <Clock className="h-4 w-4 shrink-0" />
                                                <span>Jam ke-{schedule.period_number} ({schedule.period_duration_hours} JP)</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                <MapPin className="h-4 w-4 shrink-0" />
                                                <span className="truncate">{schedule.classroom?.room_name || 'Tanpa Ruang'}</span>
                                            </div>
                                        </CardContent>
                                        <CardFooter className="p-3 bg-muted/20 border-t flex justify-end gap-2 pl-5">
                                            <Button variant="ghost" size="sm" onClick={() => openUpdateModal(schedule)} className="hover:bg-primary/10 hover:text-primary transition-colors">
                                                Edit
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => openDeleteModal(schedule)} className="text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors">
                                                Hapus
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>

                            {/* Desktop View: Table */}
                            <div className="hidden md:block rounded-xl border bg-card shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="border-b bg-muted/40">
                                            <tr className="text-left text-muted-foreground font-semibold">
                                                <th className="px-6 py-4 cursor-pointer hover:text-foreground transition-colors group" onClick={handleSort}>
                                                    <div className="flex items-center gap-2">
                                                        Kelas
                                                        <SortIcon className="h-4 w-4 text-muted-foreground/50 group-hover:text-foreground transition-colors" />
                                                    </div>
                                                </th>
                                                <th className="px-6 py-4">Waktu & Siklus</th>
                                                <th className="px-6 py-4">Mata Pelajaran</th>
                                                <th className="px-6 py-4">Guru Pengajar</th>
                                                <th className="px-6 py-4">Ruang</th>
                                                <th className="px-6 py-4 text-right">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/50">
                                            {sortedSchedules.map((schedule) => (
                                                <tr key={schedule.id} className="transition-colors hover:bg-muted/30 group">
                                                    <td className="px-6 py-4">
                                                        <Badge variant="outline" className="font-semibold text-foreground bg-background">
                                                            {schedule.master_class?.class_name || '-'}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col gap-1.5">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-semibold text-foreground/90">{schedule.day}</span>
                                                                <Badge variant="secondary" className="text-[10px] py-0 h-4 px-1.5 uppercase tracking-wider font-medium">{schedule.week_cycle}</Badge>
                                                            </div>
                                                            <div className="flex items-center text-xs text-muted-foreground gap-1.5 bg-muted/50 w-fit px-2 py-0.5 rounded-md">
                                                                <Clock className="h-3 w-3" />
                                                                <span>Jam {schedule.period_number} ({schedule.period_duration_hours} JP)</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-primary/10 rounded-lg text-primary shrink-0 shadow-sm border border-primary/10">
                                                                <BookOpen className="h-4 w-4" />
                                                            </div>
                                                            <span className="font-semibold text-foreground/90">{schedule.subject?.subject_name || '-'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <User className="h-4 w-4 text-muted-foreground/70" />
                                                            <span className="font-medium text-foreground/80">{schedule.teacher?.teacher_name || '-'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <MapPin className="h-4 w-4 text-muted-foreground/70" />
                                                            <span className="text-foreground/80">{schedule.classroom?.room_name || '-'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex justify-end gap-2 transition-opacity duration-200">
                                                            <Button variant="ghost" size="sm" onClick={() => openUpdateModal(schedule)} className="h-8 px-3 hover:bg-primary/10 hover:text-primary font-medium">
                                                                Edit
                                                            </Button>
                                                            <Button variant="ghost" size="sm" onClick={() => openDeleteModal(schedule)} className="h-8 px-3 text-destructive hover:bg-destructive/10 hover:text-destructive font-medium">
                                                                Hapus
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Pagination */}
                    {schedules.last_page > 1 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 px-2">
                            <div className="text-sm text-muted-foreground text-center sm:text-left">
                                Menampilkan <span className="font-medium text-foreground">{schedules.from || 0}</span> sampai <span className="font-medium text-foreground">{schedules.to || 0}</span> dari <span className="font-medium text-foreground">{schedules.total}</span> data
                            </div>
                            <div className="flex flex-wrap justify-center gap-1">
                                {schedules.links.map((link, i) => (
                                    <Link
                                        key={i}
                                        href={link.url || '#'}
                                        className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
                                            link.active 
                                                ? 'bg-primary text-primary-foreground border-primary' 
                                                : 'bg-background text-foreground hover:bg-muted'
                                        } ${!link.url ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        preserveState
                                        preserveScroll
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <CreateBatchRosterScheduleModal isOpen={isImportOpen} setIsOpen={setIsImportOpen} />

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
