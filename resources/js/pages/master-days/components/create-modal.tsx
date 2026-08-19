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

interface CreateModalProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

export function CreateModal({ isOpen, setIsOpen }: CreateModalProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        id: '',
        day_name: '',
        notes: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/master-days', {
            onSuccess: () => {
                toast.success('Master Hari berhasil ditambahkan.');
                setIsOpen(false);
                reset();
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Tambah Master Hari</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="create_id">ID Hari <span className="text-red-500">*</span></Label>
                        <Input
                            id="create_id"
                            value={data.id}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('id', e.target.value)}
                            placeholder="Misal: DAY-SENIN"
                            required
                        />
                        {errors.id && <p className="text-sm text-red-500">{errors.id}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="create_day_name">Nama Hari <span className="text-red-500">*</span></Label>
                        <Input
                            id="create_day_name"
                            value={data.day_name}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('day_name', e.target.value)}
                            placeholder="Misal: Senin"
                            required
                        />
                        {errors.day_name && <p className="text-sm text-red-500">{errors.day_name}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="create_notes">Catatan Tambahan</Label>
                        <textarea
                            id="create_notes"
                            value={data.notes}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('notes', e.target.value)}
                            placeholder="Catatan tambahan (opsional)"
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                        {errors.notes && <p className="text-sm text-red-500">{errors.notes}</p>}
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
