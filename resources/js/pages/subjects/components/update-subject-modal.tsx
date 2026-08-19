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
import { useEffect } from 'react';

interface Subject {
    id: string;
    subject_name: string;
}

interface UpdateSubjectModalProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    subject: Subject | null;
}

export function UpdateSubjectModal({ isOpen, setIsOpen, subject }: UpdateSubjectModalProps) {
    const { data, setData, put, processing, errors, reset } = useForm({
        id: '',
        subject_name: '',
    });

    useEffect(() => {
        if (subject) {
            setData({
                id: subject.id,
                subject_name: subject.subject_name,
            });
        }
    }, [subject]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject) return;
        put(`/subjects/${subject.id}`, {
            onSuccess: () => {
                toast.success('Mata pelajaran berhasil diperbarui.');
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
                    <DialogTitle>Edit Mata Pelajaran</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="edit_id">ID Mata Pelajaran</Label>
                        <Input
                            id="edit_id"
                            value={data.id}
                            onChange={(e) => setData('id', e.target.value)}
                        />
                        {errors.id && <p className="text-sm text-red-500">{errors.id}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit_subject_name">Nama Mata Pelajaran</Label>
                        <Input
                            id="edit_subject_name"
                            value={data.subject_name}
                            onChange={(e) => setData('subject_name', e.target.value)}
                        />
                        {errors.subject_name && <p className="text-sm text-red-500">{errors.subject_name}</p>}
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
