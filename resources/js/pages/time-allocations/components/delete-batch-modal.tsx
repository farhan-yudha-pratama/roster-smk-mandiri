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

interface DeleteBatchModalProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    selectedIds: string[];
    onSuccess?: () => void;
}

export function DeleteBatchModal({ isOpen, setIsOpen, selectedIds, onSuccess }: DeleteBatchModalProps) {
    const [processing, setProcessing] = useState(false);

    const handleDelete = () => {
        if (selectedIds.length === 0) return;
        setProcessing(true);
        router.delete(`/time-allocations`, {
            data: { ids: selectedIds },
            onSuccess: () => {
                toast.success(`${selectedIds.length} Alokasi Waktu berhasil dihapus.`);
                setIsOpen(false);
                if (onSuccess) onSuccess();
            },
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Hapus Alokasi Waktu Terpilih</DialogTitle>
                    <DialogDescription>
                        Apakah Anda yakin ingin menghapus {selectedIds.length} jadwal yang dipilih? Tindakan ini tidak dapat dibatalkan.
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
