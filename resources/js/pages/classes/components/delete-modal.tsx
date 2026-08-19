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
import { ClassModel } from '../index';

interface DeleteModalProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    cls: ClassModel | null;
}

export function DeleteModal({ isOpen, setIsOpen, cls }: DeleteModalProps) {
    const [processing, setProcessing] = useState(false);

    const handleDelete = () => {
        if (!cls) return;
        setProcessing(true);
        router.delete(`/classes/${cls.id}`, {
            onSuccess: () => {
                toast.success('Kelas berhasil dihapus.');
                setIsOpen(false);
            },
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Hapus Kelas</DialogTitle>
                    <DialogDescription>
                        Apakah Anda yakin ingin menghapus kelas "{cls?.class_name}"? Tindakan ini tidak dapat dibatalkan.
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
