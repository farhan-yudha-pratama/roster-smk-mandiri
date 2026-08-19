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
import { MasterDay, MasterTimeAllocation } from '../index';

interface UpdateModalProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    allocation: MasterTimeAllocation | null;
    days: MasterDay[];
}

export function UpdateModal({ isOpen, setIsOpen, allocation, days }: UpdateModalProps) {
    const { data, setData, put, processing, errors, reset } = useForm({
        name: '',
        master_day_ids: [] as string[],
        type: 'period',
        period_number: '',
        start_time: '',
        end_time: '',
        description: '',
    });

    useEffect(() => {
        if (allocation) {
            setData({
                name: allocation.name,
                master_day_ids: allocation.master_days?.map(d => d.id) || [],
                type: allocation.type,
                period_number: allocation.period_number?.toString() || '',
                start_time: allocation.start_time.substring(0, 5),
                end_time: allocation.end_time.substring(0, 5),
                description: allocation.description || '',
            });
        }
    }, [allocation]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!allocation) return;
        put(`/time-allocations/${allocation.id}`, {
            onSuccess: () => {
                toast.success('Alokasi Waktu berhasil diperbarui.');
                setIsOpen(false);
                reset();
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Alokasi Waktu</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="edit_name">Nama Jadwal <span className="text-red-500">*</span></Label>
                        <Input
                            id="edit_name"
                            value={data.name}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('name', e.target.value)}
                            placeholder="Misal: Jadwal Reguler JP 1"
                            required
                        />
                        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label>Berlaku pada Hari <span className="text-red-500">*</span></Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 border border-input rounded-md p-3 bg-background">
                            {days.map((day) => (
                                <div key={`edit_day_${day.id}`} className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id={`edit_day_${day.id}`}
                                        value={day.id}
                                        checked={data.master_day_ids.includes(day.id)}
                                        onChange={(e) => {
                                            const current = [...data.master_day_ids];
                                            if (e.target.checked) {
                                                current.push(day.id);
                                            } else {
                                                const idx = current.indexOf(day.id);
                                                if (idx > -1) current.splice(idx, 1);
                                            }
                                            setData('master_day_ids', current);
                                        }}
                                        className="rounded border-gray-300 text-primary shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                                    />
                                    <Label htmlFor={`edit_day_${day.id}`} className="font-normal cursor-pointer text-sm">{day.day_name}</Label>
                                </div>
                            ))}
                        </div>
                        {errors.master_day_ids && <p className="text-sm text-red-500">{errors.master_day_ids}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit_type">Tipe <span className="text-red-500">*</span></Label>
                        <select
                            id="edit_type"
                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={data.type}
                            onChange={(e) => {
                                setData('type', e.target.value);
                                if (e.target.value !== 'period') {
                                    setData('period_number', '');
                                }
                            }}
                            required
                        >
                            <option value="period">Pelajaran</option>
                            <option value="break">Istirahat</option>
                            <option value="ceremony">Upacara</option>
                        </select>
                        {errors.type && <p className="text-sm text-red-500">{errors.type}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit_period_number">JP Ke- (Isi jika Tipe = Pelajaran)</Label>
                        <Input
                            id="edit_period_number"
                            type="number"
                            min="1"
                            value={data.period_number}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('period_number', e.target.value)}
                            disabled={data.type !== 'period'}
                        />
                        {errors.period_number && <p className="text-sm text-red-500">{errors.period_number}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit_start_time">Waktu Mulai <span className="text-red-500">*</span></Label>
                            <Input
                                id="edit_start_time"
                                type="time"
                                value={data.start_time}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('start_time', e.target.value)}
                                required
                            />
                            {errors.start_time && <p className="text-sm text-red-500">{errors.start_time}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit_end_time">Waktu Selesai <span className="text-red-500">*</span></Label>
                            <Input
                                id="edit_end_time"
                                type="time"
                                value={data.end_time}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('end_time', e.target.value)}
                                required
                            />
                            {errors.end_time && <p className="text-sm text-red-500">{errors.end_time}</p>}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit_description">Deskripsi Tambahan</Label>
                        <textarea
                            id="edit_description"
                            value={data.description}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('description', e.target.value)}
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                        {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
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
