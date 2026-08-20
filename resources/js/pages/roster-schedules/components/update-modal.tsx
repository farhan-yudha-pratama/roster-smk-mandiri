import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';
import { useEffect } from 'react';

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
}

interface UpdateModalProps {
    isOpen: boolean;
    onClose: () => void;
    schedule: RosterSchedule | null;
    classes: MasterClass[];
    subjects: MasterSubject[];
    teachers: MasterHomeroomTeacher[];
    classrooms: MasterClassroom[];
    days: string[];
    weekCycles: string[];
}

export function UpdateModal({ isOpen, onClose, schedule, classes, subjects, teachers, classrooms, days, weekCycles }: UpdateModalProps) {
    const { data, setData, put, processing, errors, reset, clearErrors, transform } = useForm({
        class_id: '',
        day: '',
        week_cycle: '',
        period_number: '',
        subject_id: '',
        teacher_id: '',
        classroom_id: '',
        period_duration_hours: '',
    });

    useEffect(() => {
        if (schedule) {
            setData({
                class_id: schedule.class_id || '',
                day: schedule.day,
                week_cycle: schedule.week_cycle,
                period_number: schedule.period_number.toString(),
                subject_id: schedule.subject_id || '',
                teacher_id: schedule.teacher_id || '',
                classroom_id: schedule.classroom_id || '',
                period_duration_hours: schedule.period_duration_hours.toString(),
            });
        }
    }, [schedule]);

    transform((data) => {
        const durationStr = String(data.period_duration_hours);
        let durationNum = parseInt(durationStr.replace(/\D/g, '') || '0', 10);
        
        return {
            ...data,
            period_number: Number(data.period_number),
            period_duration_hours: durationNum,
        };
    });

    const handleClose = () => {
        reset();
        clearErrors();
        onClose();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!schedule) return;
        
        put(`/roster-schedules/${schedule.id}`, {
            onSuccess: () => {
                toast.success('Jadwal berhasil diperbarui.');
                handleClose();
            },
        });
    };

    const classOptions = classes.map(c => ({ value: c.id, label: c.class_name }));
    const subjectOptions = subjects.map(s => ({ value: s.id, label: s.subject_name }));
    const teacherOptions = teachers.map(t => ({ value: t.id, label: t.teacher_name }));
    const classroomOptions = classrooms.map(c => ({ value: c.id, label: c.room_name }));
    const dayOptions = days.map(d => ({ value: d, label: d }));
    const weekCycleOptions = weekCycles.map(w => ({ value: w, label: w }));

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="w-[95vw] max-w-md sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-lg sm:text-xl font-bold">Edit Jadwal Mengajar</DialogTitle>
                    <div className="text-xs sm:text-sm text-blue-800 bg-blue-50/80 p-3 rounded-lg border border-blue-200 mt-2 leading-relaxed">
                        ℹ️ <strong>Informasi:</strong> Masukkan jumlah Jam Pelajaran (JP). Umumnya 1 JP berdurasi 45 menit.
                    </div>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 mt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                        <div className="space-y-2">
                            <Label htmlFor="edit_class_id" className="text-sm font-medium">Kelas</Label>
                            <SearchableSelect
                                options={classOptions}
                                value={data.class_id}
                                onChange={(val) => setData('class_id', val)}
                                placeholder="Pilih Kelas"
                                searchPlaceholder="Cari kelas..."
                            />
                            {errors.class_id && <p className="text-xs text-red-500">{errors.class_id}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit_day" className="text-sm font-medium">Hari</Label>
                            <SearchableSelect
                                options={dayOptions}
                                value={data.day}
                                onChange={(val) => setData('day', val)}
                                placeholder="Pilih Hari"
                                searchPlaceholder="Cari hari..."
                            />
                            {errors.day && <p className="text-xs text-red-500">{errors.day}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit_week_cycle" className="text-sm font-medium">Siklus Minggu</Label>
                            <SearchableSelect
                                options={weekCycleOptions}
                                value={data.week_cycle}
                                onChange={(val) => setData('week_cycle', val)}
                                placeholder="Pilih Siklus"
                                searchPlaceholder="Cari siklus..."
                            />
                            {errors.week_cycle && <p className="text-xs text-red-500">{errors.week_cycle}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit_period_number" className="text-sm font-medium">Jam Ke-</Label>
                            <Input
                                id="edit_period_number"
                                className="h-10"
                                type="text"
                                placeholder="Misal: 1"
                                value={data.period_number}
                                onChange={(e) => setData('period_number', e.target.value)}
                            />
                            {errors.period_number && <p className="text-xs text-red-500">{errors.period_number}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit_period_duration_hours" className="text-sm font-medium">Durasi (Banyak JP)</Label>
                            <Input
                                id="edit_period_duration_hours"
                                className="h-10"
                                type="text"
                                placeholder="Misal: 2"
                                value={data.period_duration_hours}
                                onChange={(e) => setData('period_duration_hours', e.target.value)}
                            />
                            {errors.period_duration_hours && <p className="text-xs text-red-500">{errors.period_duration_hours}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit_subject_id" className="text-sm font-medium">Mata Pelajaran</Label>
                            <SearchableSelect
                                options={subjectOptions}
                                value={data.subject_id}
                                onChange={(val) => setData('subject_id', val)}
                                placeholder="Pilih Mata Pelajaran"
                                searchPlaceholder="Cari mata pelajaran..."
                            />
                            {errors.subject_id && <p className="text-xs text-red-500">{errors.subject_id}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit_teacher_id" className="text-sm font-medium">Guru</Label>
                            <SearchableSelect
                                options={teacherOptions}
                                value={data.teacher_id}
                                onChange={(val) => setData('teacher_id', val)}
                                placeholder="Pilih Guru"
                                searchPlaceholder="Cari guru..."
                            />
                            {errors.teacher_id && <p className="text-xs text-red-500">{errors.teacher_id}</p>}
                        </div>

                        <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="edit_classroom_id" className="text-sm font-medium">Ruangan</Label>
                            <SearchableSelect
                                options={classroomOptions}
                                value={data.classroom_id}
                                onChange={(val) => setData('classroom_id', val)}
                                placeholder="Pilih Ruangan"
                                searchPlaceholder="Cari ruangan..."
                            />
                            {errors.classroom_id && <p className="text-xs text-red-500">{errors.classroom_id}</p>}
                        </div>
                    </div>
                    
                    <DialogFooter className="mt-6 border-t pt-4 flex flex-row justify-end gap-3">
                        <Button type="button" variant="outline" className="h-10" onClick={handleClose}>Batal</Button>
                        <Button type="submit" className="h-10 px-6" disabled={processing}>Simpan Perubahan</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
