import { Head, router, useForm } from '@inertiajs/react';
import { dashboard } from '@/routes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { toast } from 'sonner';

interface MasterClass {
    id: string;
    class_name: string;
}

interface MasterSubject {
    id: string;
    subject_name: string;
}

interface User {
    id: string;
    name: string;
}

interface MasterClassroom {
    id: string;
    room_name: string;
}

interface RosterSchedule {
    id: string;
    class_id: string | null;
    day: string;
    week_cycle: string;
    period_number: string | number;
    subject_id: string | null;
    user_id: string | null;
    classroom_id: string | null;
    period_duration_hours: string | number;
    master_class?: MasterClass | null;
    subject?: MasterSubject | null;
    user?: User | null;
    classroom?: MasterClassroom | null;
}

export default function RosterScheduleIndex({ 
    schedules, classes, subjects, teachers, classrooms, days, weekCycles 
}: { 
    schedules: RosterSchedule[], 
    classes: MasterClass[], 
    subjects: MasterSubject[], 
    teachers: User[], 
    classrooms: MasterClassroom[], 
    days: string[], 
    weekCycles: string[] 
}) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editSchedule, setEditSchedule] = useState<RosterSchedule | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);

    const { data: createData, setData: setCreateData, post: createPost, processing: createProcessing, errors: createErrors, reset: createReset, transform: createTransform } = useForm({
        class_id: '',
        day: '',
        week_cycle: '',
        period_number: '',
        subject_id: '',
        user_id: '',
        classroom_id: '',
        period_duration_hours: '',
    });

    createTransform((data) => ({
        ...data,
        period_number: Number(data.period_number),
        period_duration_hours: Number(data.period_duration_hours) * 2,
    }));

    const { data: editData, setData: setEditData, put: editPut, processing: editProcessing, errors: editErrors, reset: editReset, transform: editTransform } = useForm({
        class_id: '',
        day: '',
        week_cycle: '',
        period_number: '',
        subject_id: '',
        user_id: '',
        classroom_id: '',
        period_duration_hours: '',
    });

    editTransform((data) => ({
        ...data,
        period_number: Number(data.period_number),
        period_duration_hours: Number(data.period_duration_hours) * 2,
    }));

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createPost('/roster-schedules', {
            onSuccess: () => {
                toast.success('Jadwal berhasil ditambahkan.');
                setIsCreateOpen(false);
                createReset();
            },
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editSchedule) return;
        editPut(`/roster-schedules/${editSchedule.id}`, {
            onSuccess: () => {
                toast.success('Jadwal berhasil diperbarui.');
                setIsEditOpen(false);
                setEditSchedule(null);
                editReset();
            },
        });
    };

    const handleDelete = (id: string) => {
        if (confirm('Apakah Anda yakin ingin menghapus jadwal ini?')) {
            router.delete(`/roster-schedules/${id}`, {
                onSuccess: () => {
                    toast.success('Jadwal berhasil dihapus.');
                },
            });
        }
    };

    const openEdit = (schedule: RosterSchedule) => {
        setEditSchedule(schedule);
        setEditData({
            class_id: schedule.class_id || '',
            day: schedule.day,
            week_cycle: schedule.week_cycle,
            period_number: schedule.period_number.toString(),
            subject_id: schedule.subject_id || '',
            user_id: schedule.user_id || '',
            classroom_id: schedule.classroom_id || '',
            period_duration_hours: (Number(schedule.period_duration_hours) / 2).toString(),
        });
        setIsEditOpen(true);
    };

    return (
        <>
            <Head title="Manajemen Jadwal Mengajar" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 lg:p-8">
                <div className="flex items-center justify-between space-y-2">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Jadwal Mengajar</h2>
                        <p className="text-muted-foreground">
                            Kelola jadwal induk dan roster kelas.
                        </p>
                    </div>
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button>Tambah Jadwal</Button>
                        </DialogTrigger>
                        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
                            <DialogHeader>
                                <DialogTitle>Tambah Jadwal Mengajar</DialogTitle>
                                <div className="text-sm text-blue-800 bg-blue-50 p-3 rounded-md border border-blue-200 mt-2 leading-relaxed">
                                    ℹ️ <strong>Informasi:</strong> Dalam 1 hari terdapat 5 les. Setiap 1 les setara dengan 2 Jam Pelajaran (JP), dan 1 JP berdurasi 45 menit.
                                </div>
                            </DialogHeader>
                            <form onSubmit={handleCreateSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="create_class_id">Kelas</Label>
                                        <Select value={createData.class_id} onValueChange={(val) => setCreateData('class_id', val === 'none' ? '' : val)}>
                                            <SelectTrigger><SelectValue placeholder="Pilih Kelas" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">Tidak Ada</SelectItem>
                                                {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.class_name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        {createErrors.class_id && <p className="text-sm text-red-500">{createErrors.class_id}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="create_day">Hari</Label>
                                        <Select value={createData.day} onValueChange={(val) => setCreateData('day', val)}>
                                            <SelectTrigger><SelectValue placeholder="Pilih Hari" /></SelectTrigger>
                                            <SelectContent>
                                                {days.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        {createErrors.day && <p className="text-sm text-red-500">{createErrors.day}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="create_week_cycle">Siklus Minggu</Label>
                                        <Select value={createData.week_cycle} onValueChange={(val) => setCreateData('week_cycle', val)}>
                                            <SelectTrigger><SelectValue placeholder="Pilih Siklus" /></SelectTrigger>
                                            <SelectContent>
                                                {weekCycles.map(w => <SelectItem key={w} value={w}>{w}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        {createErrors.week_cycle && <p className="text-sm text-red-500">{createErrors.week_cycle}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="create_period_number">Jam Ke-</Label>
                                        <Input
                                            id="create_period_number"
                                            type="text"
                                            value={createData.period_number}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCreateData('period_number', e.target.value)}
                                        />
                                        {createErrors.period_number && <p className="text-sm text-red-500">{createErrors.period_number}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="create_period_duration_hours">Durasi (Banyak Les)</Label>
                                        <Input
                                            id="create_period_duration_hours"
                                            type="number"
                                            min="1"
                                            max="5"
                                            value={createData.period_duration_hours}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                let val = e.target.value;
                                                if (Number(val) > 5) val = '5';
                                                setCreateData('period_duration_hours', val);
                                            }}
                                        />
                                        {createErrors.period_duration_hours && <p className="text-sm text-red-500">{createErrors.period_duration_hours}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="create_subject_id">Mata Pelajaran</Label>
                                        <Select value={createData.subject_id} onValueChange={(val) => setCreateData('subject_id', val === 'none' ? '' : val)}>
                                            <SelectTrigger><SelectValue placeholder="Pilih Mata Pelajaran" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">Tidak Ada</SelectItem>
                                                {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.subject_name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        {createErrors.subject_id && <p className="text-sm text-red-500">{createErrors.subject_id}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="create_user_id">Guru</Label>
                                        <Select value={createData.user_id} onValueChange={(val) => setCreateData('user_id', val === 'none' ? '' : val)}>
                                            <SelectTrigger><SelectValue placeholder="Pilih Guru" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">Tidak Ada</SelectItem>
                                                {teachers.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        {createErrors.user_id && <p className="text-sm text-red-500">{createErrors.user_id}</p>}
                                    </div>

                                    <div className="space-y-2 col-span-2">
                                        <Label htmlFor="create_classroom_id">Ruangan</Label>
                                        <Select value={createData.classroom_id} onValueChange={(val) => setCreateData('classroom_id', val === 'none' ? '' : val)}>
                                            <SelectTrigger><SelectValue placeholder="Pilih Ruangan" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">Tidak Ada</SelectItem>
                                                {classrooms.map(c => <SelectItem key={c.id} value={c.id}>{c.room_name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        {createErrors.classroom_id && <p className="text-sm text-red-500">{createErrors.classroom_id}</p>}
                                    </div>
                                </div>
                                
                                <div className="flex justify-end gap-2 pt-4 border-t">
                                    <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Batal</Button>
                                    <Button type="submit" disabled={createProcessing}>Simpan Jadwal</Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="rounded-md border overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="border-b bg-muted/50 whitespace-nowrap">
                            <tr className="text-left">
                                <th className="p-4 font-medium">ID</th>
                                <th className="p-4 font-medium">Kelas</th>
                                <th className="p-4 font-medium">Waktu</th>
                                <th className="p-4 font-medium">Mata Pelajaran</th>
                                <th className="p-4 font-medium">Guru</th>
                                <th className="p-4 font-medium">Ruang</th>
                                <th className="p-4 font-medium text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {schedules.map((schedule) => (
                                <tr key={schedule.id} className="border-b transition-colors hover:bg-muted/50">
                                    <td className="p-4 font-medium">{schedule.id}</td>
                                    <td className="p-4">{schedule.master_class?.class_name || '-'}</td>
                                    <td className="p-4 whitespace-nowrap">
                                        {schedule.day} ({schedule.week_cycle})<br/>
                                        <span className="text-muted-foreground text-xs">Jam {schedule.period_number} - {schedule.period_duration_hours}JP</span>
                                    </td>
                                    <td className="p-4">{schedule.subject?.subject_name || '-'}</td>
                                    <td className="p-4">{schedule.user?.name || '-'}</td>
                                    <td className="p-4">{schedule.classroom?.room_name || '-'}</td>
                                    <td className="p-4 text-right space-x-2 whitespace-nowrap">
                                        <Button variant="outline" size="sm" onClick={() => openEdit(schedule)}>Edit</Button>
                                        <Button variant="destructive" size="sm" onClick={() => handleDelete(schedule.id)}>Hapus</Button>
                                    </td>
                                </tr>
                            ))}
                            
                            {schedules.length === 0 && (
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

            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Edit Jadwal Mengajar</DialogTitle>
                        <div className="text-sm text-blue-800 bg-blue-50 p-3 rounded-md border border-blue-200 mt-2 leading-relaxed">
                            ℹ️ <strong>Informasi:</strong> Dalam 1 hari terdapat 5 les. Setiap 1 les setara dengan 2 Jam Pelajaran (JP), dan 1 JP berdurasi 45 menit.
                        </div>
                    </DialogHeader>
                    <form onSubmit={handleEditSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit_class_id">Kelas</Label>
                                <Select value={editData.class_id || 'none'} onValueChange={(val) => setEditData('class_id', val === 'none' ? '' : val)}>
                                    <SelectTrigger><SelectValue placeholder="Pilih Kelas" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Tidak Ada</SelectItem>
                                        {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.class_name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                {editErrors.class_id && <p className="text-sm text-red-500">{editErrors.class_id}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit_day">Hari</Label>
                                <Select value={editData.day} onValueChange={(val) => setEditData('day', val)}>
                                    <SelectTrigger><SelectValue placeholder="Pilih Hari" /></SelectTrigger>
                                    <SelectContent>
                                        {days.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                {editErrors.day && <p className="text-sm text-red-500">{editErrors.day}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit_week_cycle">Siklus Minggu</Label>
                                <Select value={editData.week_cycle} onValueChange={(val) => setEditData('week_cycle', val)}>
                                    <SelectTrigger><SelectValue placeholder="Pilih Siklus" /></SelectTrigger>
                                    <SelectContent>
                                        {weekCycles.map(w => <SelectItem key={w} value={w}>{w}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                {editErrors.week_cycle && <p className="text-sm text-red-500">{editErrors.week_cycle}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit_period_number">Jam Ke-</Label>
                                <Input
                                    id="edit_period_number"
                                    type="text"
                                    value={editData.period_number}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditData('period_number', e.target.value)}
                                />
                                {editErrors.period_number && <p className="text-sm text-red-500">{editErrors.period_number}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit_period_duration_hours">Durasi (Banyak Les)</Label>
                                <Input
                                    id="edit_period_duration_hours"
                                    type="number"
                                    min="1"
                                    max="5"
                                    value={editData.period_duration_hours}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        let val = e.target.value;
                                        if (Number(val) > 5) val = '5';
                                        setEditData('period_duration_hours', val);
                                    }}
                                />
                                {editErrors.period_duration_hours && <p className="text-sm text-red-500">{editErrors.period_duration_hours}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit_subject_id">Mata Pelajaran</Label>
                                <Select value={editData.subject_id || 'none'} onValueChange={(val) => setEditData('subject_id', val === 'none' ? '' : val)}>
                                    <SelectTrigger><SelectValue placeholder="Pilih Mata Pelajaran" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Tidak Ada</SelectItem>
                                        {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.subject_name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                {editErrors.subject_id && <p className="text-sm text-red-500">{editErrors.subject_id}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit_user_id">Guru</Label>
                                <Select value={editData.user_id || 'none'} onValueChange={(val) => setEditData('user_id', val === 'none' ? '' : val)}>
                                    <SelectTrigger><SelectValue placeholder="Pilih Guru" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Tidak Ada</SelectItem>
                                        {teachers.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                {editErrors.user_id && <p className="text-sm text-red-500">{editErrors.user_id}</p>}
                            </div>

                            <div className="space-y-2 col-span-2">
                                <Label htmlFor="edit_classroom_id">Ruangan</Label>
                                <Select value={editData.classroom_id || 'none'} onValueChange={(val) => setEditData('classroom_id', val === 'none' ? '' : val)}>
                                    <SelectTrigger><SelectValue placeholder="Pilih Ruangan" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Tidak Ada</SelectItem>
                                        {classrooms.map(c => <SelectItem key={c.id} value={c.id}>{c.room_name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                {editErrors.classroom_id && <p className="text-sm text-red-500">{editErrors.classroom_id}</p>}
                            </div>
                        </div>
                        
                        <div className="flex justify-end gap-2 pt-4 border-t">
                            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Batal</Button>
                            <Button type="submit" disabled={editProcessing}>Simpan Perubahan</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
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
