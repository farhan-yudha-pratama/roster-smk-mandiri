import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';

interface User {
    id: string;
    name: string;
}

interface DeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
}

export function DeleteModal({ isOpen, onClose, user }: DeleteModalProps) {
    const { delete: destroy, processing } = useForm();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        
        destroy(`/users/${user.id}`, {
            onSuccess: () => {
                toast.success('User berhasil dihapus.');
                onClose();
            },
            onError: (errors) => {
                if (errors.error) {
                    toast.error(errors.error);
                } else {
                    toast.error('Gagal menghapus user.');
                }
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="w-[95vw] max-w-md sm:w-full">
                <DialogHeader>
                    <DialogTitle className="text-base sm:text-lg">Hapus User</DialogTitle>
                    <DialogDescription className="text-xs sm:text-sm mt-2">
                        Apakah Anda yakin ingin menghapus user <strong>{user?.name}</strong>? Tindakan ini tidak dapat dibatalkan.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <DialogFooter className="mt-4 flex flex-row justify-end gap-2">
                        <Button type="button" variant="outline" size="sm" className="text-xs sm:text-sm h-8 sm:h-10" onClick={onClose}>Batal</Button>
                        <Button type="submit" variant="destructive" size="sm" className="text-xs sm:text-sm h-8 sm:h-10" disabled={processing}>Hapus</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
