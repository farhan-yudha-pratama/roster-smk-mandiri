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
import { HomeroomTeacher } from '../index';

interface CreateModalProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    teachers: HomeroomTeacher[];
    gradeLevels: string[];
    majors: string[];
}

export function CreateModal({ isOpen, setIsOpen, teachers, gradeLevels, majors }: CreateModalProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        id: '',
        grade_level: '',
        class_name: '',
        major: '',
        master_classroom_teacher_id: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/classes', {
            onSuccess: () => {
                toast.success('Kelas berhasil ditambahkan.');
                setIsOpen(false);
                reset();
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Tambah Kelas</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="create_id">ID Kelas</Label>
                        <Input
                            id="create_id"
                            value={data.id}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('id', e.target.value)}
                            placeholder="Misal: XII-TKJ-1"
                        />
                        {errors.id && <p className="text-sm text-red-500">{errors.id}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="create_grade_level">Tingkat Kelas</Label>
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
                        <Label htmlFor="create_class_name">Nama Kelas</Label>
                        <Input
                            id="create_class_name"
                            value={data.class_name}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('class_name', e.target.value)}
                            placeholder="Misal: Kelas XII TKJ 1"
                        />
                        {errors.class_name && <p className="text-sm text-red-500">{errors.class_name}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="create_major">Jurusan</Label>
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
                        <Label htmlFor="create_master_classroom_teacher_id">Wali Kelas</Label>
                        <Select 
                            value={data.master_classroom_teacher_id} 
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
                        <Button type="submit" disabled={processing}>Simpan</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
