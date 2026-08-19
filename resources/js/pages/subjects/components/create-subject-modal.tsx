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
import { toast } from 'sonner';

interface CreateSubjectModalProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

export function CreateSubjectModal({ isOpen, setIsOpen }: CreateSubjectModalProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        id: '',
        subject_name: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/subjects', {
            onSuccess: () => {
                toast.success('Mata pelajaran berhasil ditambahkan.');
                setIsOpen(false);
                reset();
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) reset();
        }}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Tambah Mata Pelajaran</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="create_id">ID Mata Pelajaran</Label>
                        <Input
                            id="create_id"
                            value={data.id}
                            onChange={(e) => setData('id', e.target.value)}
                            placeholder="Contoh: MTK"
                        />
                        {errors.id && <p className="text-sm text-red-500">{errors.id}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="create_subject_name">Nama Mata Pelajaran</Label>
                        <Input
                            id="create_subject_name"
                            value={data.subject_name}
                            onChange={(e) => setData('subject_name', e.target.value)}
                            placeholder="Contoh: Matematika"
                        />
                        {errors.subject_name && <p className="text-sm text-red-500">{errors.subject_name}</p>}
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
