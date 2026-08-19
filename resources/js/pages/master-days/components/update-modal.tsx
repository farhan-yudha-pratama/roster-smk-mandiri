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
import { MasterDay } from '../index';

interface UpdateModalProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    day: MasterDay | null;
}

export function UpdateModal({ isOpen, setIsOpen, day }: UpdateModalProps) {
    const { data, setData, put, processing, errors, reset } = useForm({
        day_name: '',
        notes: '',
    });

    useEffect(() => {
        if (day) {
            setData({
                day_name: day.day_name,
                notes: day.notes || '',
            });
        }
    }, [day]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!day) return;
        put(`/master-days/${day.id}`, {
            onSuccess: () => {
                toast.success('Master Hari berhasil diperbarui.');
                setIsOpen(false);
                reset();
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Master Hari</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="edit_day_name">Nama Hari <span className="text-red-500">*</span></Label>
                        <Input
                            id="edit_day_name"
                            value={data.day_name}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('day_name', e.target.value)}
                            required
                        />
                        {errors.day_name && <p className="text-sm text-red-500">{errors.day_name}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit_notes">Catatan Tambahan</Label>
                        <textarea
                            id="edit_notes"
                            value={data.notes}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('notes', e.target.value)}
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                        {errors.notes && <p className="text-sm text-red-500">{errors.notes}</p>}
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
