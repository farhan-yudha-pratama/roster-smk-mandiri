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

interface CreateModalProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    roomTypes: string[];
}

export function CreateModal({ isOpen, setIsOpen, roomTypes }: CreateModalProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        id: '',
        room_name: '',
        room_type: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/classrooms', {
            onSuccess: () => {
                toast.success('Ruangan berhasil ditambahkan.');
                setIsOpen(false);
                reset();
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Tambah Ruangan</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="create_id">Kode Ruangan</Label>
                        <Input
                            id="create_id"
                            value={data.id}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('id', e.target.value)}
                            placeholder="Misal: LAB-05"
                        />
                        {errors.id && <p className="text-sm text-red-500">{errors.id}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="create_room_name">Nama Ruangan</Label>
                        <Input
                            id="create_room_name"
                            value={data.room_name}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('room_name', e.target.value)}
                            placeholder="Misal: Laboratorium Komputer 5"
                        />
                        {errors.room_name && <p className="text-sm text-red-500">{errors.room_name}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="create_room_type">Tipe Ruangan</Label>
                        <Select 
                            value={data.room_type} 
                            onValueChange={(val) => setData('room_type', val === 'none' ? '' : val)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih Tipe Ruangan" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Tidak Ada</SelectItem>
                                {roomTypes.map((type) => (
                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.room_type && <p className="text-sm text-red-500">{errors.room_type}</p>}
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
