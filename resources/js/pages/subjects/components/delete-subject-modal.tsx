import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useState } from 'react';

interface Subject {
    id: string;
    subject_name: string;
}

interface DeleteSubjectModalProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    subject: Subject | null;
}

export function DeleteSubjectModal({ isOpen, setIsOpen, subject }: DeleteSubjectModalProps) {
    const [processing, setProcessing] = useState(false);

    const handleDelete = () => {
        if (!subject) return;
        setProcessing(true);
        router.delete(`/subjects/${subject.id}`, {
            onSuccess: () => {
                toast.success('Mata pelajaran berhasil dihapus.');
                setIsOpen(false);
            },
            onFinish: () => {
                setProcessing(false);
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Hapus Mata Pelajaran</DialogTitle>
                    <DialogDescription>
                        Apakah Anda yakin ingin menghapus mata pelajaran <span className="font-bold">{subject?.subject_name}</span>? Tindakan ini tidak dapat dibatalkan.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end gap-2 mt-4">
                    <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={processing}>Batal</Button>
                    <Button type="button" variant="destructive" onClick={handleDelete} disabled={processing}>Hapus</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
