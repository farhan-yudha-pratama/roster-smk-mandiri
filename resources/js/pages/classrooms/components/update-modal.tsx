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
import { useEffect } from 'react';
import { ClassroomModel } from '../index';

interface UpdateModalProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    classroom: ClassroomModel | null;
    roomTypes: string[];
}

export function UpdateModal({ isOpen, setIsOpen, classroom, roomTypes }: UpdateModalProps) {
    const { data, setData, put, processing, errors, reset } = useForm({
        id: '',
        room_name: '',
        room_type: '',
    });

    useEffect(() => {
        if (classroom) {
            setData({
                id: classroom.id,
                room_name: classroom.room_name,
                room_type: classroom.room_type || '',
            });
        }
    }, [classroom]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!classroom) return;
        put(`/classrooms/${classroom.id}`, {
            onSuccess: () => {
                toast.success('Ruangan berhasil diperbarui.');
                setIsOpen(false);
                reset();
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Ruangan</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="edit_id">Kode Ruangan</Label>
                        <Input
                            id="edit_id"
                            value={data.id}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('id', e.target.value)}
                        />
                        {errors.id && <p className="text-sm text-red-500">{errors.id}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit_room_name">Nama Ruangan</Label>
                        <Input
                            id="edit_room_name"
                            value={data.room_name}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('room_name', e.target.value)}
                        />
                        {errors.room_name && <p className="text-sm text-red-500">{errors.room_name}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit_room_type">Tipe Ruangan</Label>
                        <Select 
                            value={data.room_type || 'none'} 
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
                        <Button type="submit" disabled={processing}>Simpan Perubahan</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
