import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useState } from 'react';
import { ClassroomModel } from '../index';

interface DeleteModalProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    classroom: ClassroomModel | null;
}

export function DeleteModal({ isOpen, setIsOpen, classroom }: DeleteModalProps) {
    const [processing, setProcessing] = useState(false);

    const handleDelete = () => {
        if (!classroom) return;
        setProcessing(true);
        router.delete(`/classrooms/${classroom.id}`, {
            onSuccess: () => {
                toast.success('Ruangan berhasil dihapus.');
                setIsOpen(false);
            },
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Hapus Ruangan</DialogTitle>
                    <DialogDescription>
                        Apakah Anda yakin ingin menghapus ruangan "{classroom?.room_name}"? Tindakan ini tidak dapat dibatalkan.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)} disabled={processing}>
                        Batal
                    </Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={processing}>
                        {processing ? 'Menghapus...' : 'Hapus'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
