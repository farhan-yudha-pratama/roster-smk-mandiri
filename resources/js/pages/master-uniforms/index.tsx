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
}

interface MasterUniform {
    id: string;
    uniform_name: string;
    description?: string;
    is_any_day: boolean;
    master_days?: MasterDay[];
}

export default function MasterUniformIndex({ uniforms, days }: { uniforms: MasterUniform[], days: MasterDay[] }) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editUniform, setEditUniform] = useState<MasterUniform | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);

    const { data: createData, setData: setCreateData, post: createPost, processing: createProcessing, errors: createErrors, reset: createReset } = useForm({
        uniform_name: '',
        description: '',
        is_any_day: false,
        master_day_ids: [] as string[],
    });

    const { data: editData, setData: setEditData, put: editPut, processing: editProcessing, errors: editErrors, reset: editReset } = useForm({
        uniform_name: '',
        description: '',
        is_any_day: false,
        master_day_ids: [] as string[],
    });

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createPost('/master-uniforms', {
            onSuccess: () => {
                toast.success('Seragam berhasil ditambahkan.');
                setIsCreateOpen(false);
                createReset();
            },
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editUniform) return;
        editPut(`/master-uniforms/${editUniform.id}`, {
            onSuccess: () => {
                toast.success('Seragam berhasil diperbarui.');
                setIsEditOpen(false);
                setEditUniform(null);
                editReset();
            },
        });
    };

    const handleDelete = (id: string) => {
        if (confirm('Apakah Anda yakin ingin menghapus data seragam ini? (Catatan: Ini akan mengosongkan seragam di hari terkait)')) {
            router.delete(`/master-uniforms/${id}`, {
                onSuccess: () => {
                    toast.success('Seragam berhasil dihapus.');
                },
            });
        }
    };

    const openEdit = (uniform: MasterUniform) => {
        setEditUniform(uniform);
        setEditData({
            uniform_name: uniform.uniform_name,
            description: uniform.description || '',
            is_any_day: uniform.is_any_day,
            master_day_ids: uniform.master_days?.map(d => d.id) || [],
        });
        setIsEditOpen(true);
    };

    return (
        <>
            <Head title="Master Seragam" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 lg:p-8">
                <div className="flex items-center justify-between space-y-2">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Master Seragam</h2>
                        <p className="text-muted-foreground">
                            Kelola data jenis seragam/baju dan penggunaannya.
                        </p>
                    </div>
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button>Tambah Seragam</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Tambah Seragam</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleCreateSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="create_uniform_name">Nama Seragam <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="create_uniform_name"
                                        value={createData.uniform_name}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCreateData('uniform_name', e.target.value)}
                                        placeholder="Misal: Putih Abu-Abu"
                                        required
                                    />
                                    {createErrors.uniform_name && <p className="text-sm text-red-500">{createErrors.uniform_name}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="create_description">Deskripsi</Label>
                                    <textarea
                                        id="create_description"
                                        value={createData.description}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCreateData('description', e.target.value)}
                                        placeholder="Keterangan (opsional)"
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    />
                                    {createErrors.description && <p className="text-sm text-red-500">{createErrors.description}</p>}
                                </div>
                                <div className="flex items-center space-x-2 bg-muted/50 p-3 rounded-md">
                                    <input
                                        type="checkbox"
                                        id="create_is_any_day"
                                        checked={createData.is_any_day}
                                        onChange={(e) => {
                                            setCreateData('is_any_day', e.target.checked);
                                            if (e.target.checked) setCreateData('master_day_ids', []);
                                        }}
                                        className="rounded border-gray-300 text-primary shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                                    />
                                    <Label htmlFor="create_is_any_day" className="font-medium cursor-pointer">Bisa dipakai di semua hari</Label>
                                </div>
                                
                                {!createData.is_any_day && (
                                    <div className="space-y-2">
                                        <Label>Berlaku Pada Hari <span className="text-red-500">*</span></Label>
                                        <div className="grid grid-cols-2 gap-2 border p-3 rounded-md">
                                            {days.map((day) => (
                                                <div key={`create_day_${day.id}`} className="flex items-center space-x-2">
                                                    <input
                                                        type="checkbox"
                                                        id={`create_day_${day.id}`}
                                                        value={day.id}
                                                        checked={createData.master_day_ids.includes(day.id)}
                                                        onChange={(e) => {
                                                            const current = [...createData.master_day_ids];
                                                            if (e.target.checked) {
                                                                current.push(day.id);
                                                            } else {
                                                                const idx = current.indexOf(day.id);
                                                                if (idx > -1) current.splice(idx, 1);
                                                            }
                                                            setCreateData('master_day_ids', current);
                                                        }}
                                                        className="rounded border-gray-300 text-primary shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                                                    />
                                                    <Label htmlFor={`create_day_${day.id}`} className="font-normal cursor-pointer">{day.day_name}</Label>
                                                </div>
                                            ))}
                                        </div>
                                        {createErrors.master_day_ids && <p className="text-sm text-red-500">{createErrors.master_day_ids}</p>}
                                    </div>
                                )}
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
                                <th className="p-4 font-medium">Nama Seragam</th>
                                <th className="p-4 font-medium">Berlaku Pada</th>
                                <th className="p-4 font-medium">Deskripsi</th>
                                <th className="p-4 font-medium text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {uniforms.map((uniform) => (
                                <tr key={uniform.id} className="border-b transition-colors hover:bg-muted/50">
                                    <td className="p-4 font-medium text-muted-foreground">{uniform.id}</td>
                                    <td className="p-4 font-medium">{uniform.uniform_name}</td>
                                    <td className="p-4">
                                        {uniform.is_any_day ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Semua Hari</span>
                                        ) : uniform.master_days && uniform.master_days.length > 0 ? (
                                            <div className="flex flex-wrap gap-1">
                                                {uniform.master_days.map(d => (
                                                    <span key={d.id} className="inline-flex items-center px-2 py-0.5 rounded-md text-xs bg-muted text-muted-foreground border">
                                                        {d.day_name}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground italic text-xs">Belum diatur</span>
                                        )}
                                    </td>
                                    <td className="p-4">{uniform.description || '-'}</td>
                                    <td className="p-4 text-right space-x-2">
                                        <Button variant="outline" size="sm" onClick={() => openEdit(uniform)}>Edit</Button>
                                        <Button variant="destructive" size="sm" onClick={() => handleDelete(uniform.id)}>Hapus</Button>
                                    </td>
                                </tr>
                            ))}
                            
                            {uniforms.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-4 text-center text-muted-foreground">
                                        Tidak ada data seragam.
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
                        <DialogTitle>Edit Seragam</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleEditSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit_uniform_name">Nama Seragam <span className="text-red-500">*</span></Label>
                            <Input
                                id="edit_uniform_name"
                                value={editData.uniform_name}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditData('uniform_name', e.target.value)}
                                required
                            />
                            {editErrors.uniform_name && <p className="text-sm text-red-500">{editErrors.uniform_name}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit_description">Deskripsi</Label>
                            <textarea
                                id="edit_description"
                                value={editData.description}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditData('description', e.target.value)}
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                            {editErrors.description && <p className="text-sm text-red-500">{editErrors.description}</p>}
                        </div>
                        <div className="flex items-center space-x-2 bg-muted/50 p-3 rounded-md">
                            <input
                                type="checkbox"
                                id="edit_is_any_day"
                                checked={editData.is_any_day}
                                onChange={(e) => {
                                    setEditData('is_any_day', e.target.checked);
                                    if (e.target.checked) setEditData('master_day_ids', []);
                                }}
                                className="rounded border-gray-300 text-primary shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                            />
                            <Label htmlFor="edit_is_any_day" className="font-medium cursor-pointer">Bisa dipakai di semua hari</Label>
                        </div>
                        
                        {!editData.is_any_day && (
                            <div className="space-y-2">
                                <Label>Berlaku Pada Hari <span className="text-red-500">*</span></Label>
                                <div className="grid grid-cols-2 gap-2 border p-3 rounded-md">
                                    {days.map((day) => (
                                        <div key={`edit_day_${day.id}`} className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                id={`edit_day_${day.id}`}
                                                value={day.id}
                                                checked={editData.master_day_ids.includes(day.id)}
                                                onChange={(e) => {
                                                    const current = [...editData.master_day_ids];
                                                    if (e.target.checked) {
                                                        current.push(day.id);
                                                    } else {
                                                        const idx = current.indexOf(day.id);
                                                        if (idx > -1) current.splice(idx, 1);
                                                    }
                                                    setEditData('master_day_ids', current);
                                                }}
                                                className="rounded border-gray-300 text-primary shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                                            />
                                            <Label htmlFor={`edit_day_${day.id}`} className="font-normal cursor-pointer">{day.day_name}</Label>
                                        </div>
                                    ))}
                                </div>
                                {editErrors.master_day_ids && <p className="text-sm text-red-500">{editErrors.master_day_ids}</p>}
                            </div>
                        )}
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

MasterUniformIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Master Seragam',
        },
    ],
};
