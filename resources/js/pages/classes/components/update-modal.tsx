import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { HomeroomTeacher, ClassModel } from '../index';

interface UpdateModalProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    cls: ClassModel | null;
    teachers: HomeroomTeacher[];
    gradeLevels: string[];
    majors: string[];
}

export function UpdateModal({ isOpen, setIsOpen, cls, teachers, gradeLevels, majors }: UpdateModalProps) {
    const { data, setData, put, processing, errors, reset } = useForm({
        id: '',
        grade_level: '',
        class_name: '',
        major: '',
        master_classroom_teacher_id: '',
    });

    useEffect(() => {
        if (cls) {
            setData({
                id: cls.id,
                grade_level: cls.grade_level,
                class_name: cls.class_name,
                major: cls.major,
                master_classroom_teacher_id: cls.master_classroom_teacher_id || '',
            });
        }
    }, [cls]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!cls) return;
        put(`/classes/${cls.id}`, {
            onSuccess: () => {
                toast.success('Kelas berhasil diperbarui.');
                setIsOpen(false);
                reset();
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Kelas</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="edit_id">ID Kelas</Label>
                        <Input
                            id="edit_id"
                            value={data.id}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('id', e.target.value)}
                        />
                        {errors.id && <p className="text-sm text-red-500">{errors.id}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit_grade_level">Tingkat Kelas</Label>
                        <Select 
                            value={data.grade_level} 
                            onValueChange={(val) => setData('grade_level', val)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih Tingkat Kelas" />
                            </SelectTrigger>
                            <SelectContent>
                                {gradeLevels.map((level) => (
                                    <SelectItem key={level} value={level}>{level}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.grade_level && <p className="text-sm text-red-500">{errors.grade_level}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit_class_name">Nama Kelas</Label>
                        <Input
                            id="edit_class_name"
                            value={data.class_name}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('class_name', e.target.value)}
                        />
                        {errors.class_name && <p className="text-sm text-red-500">{errors.class_name}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit_major">Jurusan</Label>
                        <Select 
                            value={data.major} 
                            onValueChange={(val) => setData('major', val)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih Jurusan" />
                            </SelectTrigger>
                            <SelectContent>
                                {majors.map((major) => (
                                    <SelectItem key={major} value={major}>{major}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.major && <p className="text-sm text-red-500">{errors.major}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit_master_classroom_teacher_id">Wali Kelas</Label>
                        <Select 
                            value={data.master_classroom_teacher_id || 'none'} 
                            onValueChange={(val) => setData('master_classroom_teacher_id', val === 'none' ? '' : val)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih Wali Kelas" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Tidak Ada</SelectItem>
                                {teachers.map(teacher => (
                                    <SelectItem key={teacher.id} value={teacher.id}>{teacher.teacher_name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.master_classroom_teacher_id && <p className="text-sm text-red-500">{errors.master_classroom_teacher_id}</p>}
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Batal</Button>
                        <Button type="submit" disabled={processing}>Simpan Perubahan</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
