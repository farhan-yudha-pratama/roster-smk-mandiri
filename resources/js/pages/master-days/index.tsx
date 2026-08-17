import { Head, router, useForm } from '@inertiajs/react';
import { dashboard } from '@/routes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { useState } from 'react';
import { toast } from 'sonner';

interface MasterDay {
    id: string;
    day_name: string;
    notes?: string;
}

export default function MasterDayIndex({ days }: { days: MasterDay[] }) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editDay, setEditDay] = useState<MasterDay | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);

    const { data: createData, setData: setCreateData, post: createPost, processing: createProcessing, errors: createErrors, reset: createReset } = useForm({
        id: '',
        day_name: '',
        notes: '',
    });

    const { data: editData, setData: setEditData, put: editPut, processing: editProcessing, errors: editErrors, reset: editReset } = useForm({
        day_name: '',
        notes: '',
    });

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createPost('/master-days', {
            onSuccess: () => {
                toast.success('Master Hari berhasil ditambahkan.');
                setIsCreateOpen(false);
                createReset();
            },
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editDay) return;
        editPut(`/master-days/${editDay.id}`, {
            onSuccess: () => {
                toast.success('Master Hari berhasil diperbarui.');
                setIsEditOpen(false);
                setEditDay(null);
                editReset();
            },
        });
    };

    const handleDelete = (id: string) => {
        if (confirm('Apakah Anda yakin ingin menghapus data hari ini?')) {
            router.delete(`/master-days/${id}`, {
                onSuccess: () => {
                    toast.success('Master Hari berhasil dihapus.');
                },
            });
        }
    };

    const openEdit = (day: MasterDay) => {
        setEditDay(day);
        setEditData({
            day_name: day.day_name,
            notes: day.notes || '',
        });
        setIsEditOpen(true);
    };

    return (
        <>
            <Head title="Master Hari" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 lg:p-8">
                <div className="flex items-center justify-between space-y-2">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Master Hari</h2>
                        <p className="text-muted-foreground">
                            Kelola data hari, seragam, dan catatan terkait.
                        </p>
                    </div>
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button>Tambah Hari</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Tambah Master Hari</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleCreateSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="create_id">ID Hari <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="create_id"
                                        value={createData.id}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCreateData('id', e.target.value)}
                                        placeholder="Misal: DAY-SENIN"
                                        required
                                    />
                                    {createErrors.id && <p className="text-sm text-red-500">{createErrors.id}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="create_day_name">Nama Hari <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="create_day_name"
                                        value={createData.day_name}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCreateData('day_name', e.target.value)}
                                        placeholder="Misal: Senin"
                                        required
                                    />
                                    {createErrors.day_name && <p className="text-sm text-red-500">{createErrors.day_name}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="create_notes">Catatan Tambahan</Label>
                                    <textarea
                                        id="create_notes"
                                        value={createData.notes}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCreateData('notes', e.target.value)}
                                        placeholder="Catatan tambahan (opsional)"
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    />
                                    {createErrors.notes && <p className="text-sm text-red-500">{createErrors.notes}</p>}
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Batal</Button>
                                    <Button type="submit" disabled={createProcessing}>Simpan</Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="rounded-md border">
                    <table className="w-full text-sm">
                        <thead className="border-b bg-muted/50">
                            <tr className="text-left">
                                <th className="p-4 font-medium">ID</th>
                                <th className="p-4 font-medium">Nama Hari</th>
                                <th className="p-4 font-medium">Catatan</th>
                                <th className="p-4 font-medium text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {days.map((day) => (
                                <tr key={day.id} className="border-b transition-colors hover:bg-muted/50">
                                    <td className="p-4 font-medium">{day.id}</td>
                                    <td className="p-4">{day.day_name}</td>
                                    <td className="p-4">{day.notes || '-'}</td>
                                    <td className="p-4 text-right space-x-2">
                                        <Button variant="outline" size="sm" onClick={() => openEdit(day)}>Edit</Button>
                                        <Button variant="destructive" size="sm" onClick={() => handleDelete(day.id)}>Hapus</Button>
                                    </td>
                                </tr>
                            ))}
                            
                            {days.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-4 text-center text-muted-foreground">
                                        Tidak ada data master hari.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Master Hari</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleEditSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit_day_name">Nama Hari <span className="text-red-500">*</span></Label>
                            <Input
                                id="edit_day_name"
                                value={editData.day_name}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditData('day_name', e.target.value)}
                                required
                            />
                            {editErrors.day_name && <p className="text-sm text-red-500">{editErrors.day_name}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit_notes">Catatan Tambahan</Label>
                            <textarea
                                id="edit_notes"
                                value={editData.notes}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditData('notes', e.target.value)}
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                            {editErrors.notes && <p className="text-sm text-red-500">{editErrors.notes}</p>}
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Batal</Button>
                            <Button type="submit" disabled={editProcessing}>Simpan Perubahan</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

MasterDayIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Master Hari',
        },
    ],
};
