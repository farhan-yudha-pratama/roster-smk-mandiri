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
import React, { useState } from 'react';
import { toast } from 'sonner';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface MasterDay {
    id: string;
    day_name: string;
}

interface MasterTimeAllocation {
    id: string;
    name: string;
    type: string;
    period_number: number | null;
    start_time: string;
    end_time: string;
    description: string | null;
    master_days?: MasterDay[];
}

export default function TimeAllocationIndex({ allocations, days }: { allocations: MasterTimeAllocation[], days: MasterDay[] }) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editAllocation, setEditAllocation] = useState<MasterTimeAllocation | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);

    // Group allocations by day
    const dayOrder = ['DAY-SENIN', 'DAY-SELASA', 'DAY-RABU', 'DAY-KAMIS', 'DAY-JUMAT', 'DAY-SABTU', 'DAY-MINGGU'];
    const groupedAllocations = allocations.reduce((acc, alloc) => {
        if (alloc.master_days) {
            alloc.master_days.forEach(day => {
                if (!acc[day.id]) {
                    acc[day.id] = [];
                }
                // avoid duplicate push if same object somehow
                if (!acc[day.id].find(a => a.id === alloc.id)) {
                    acc[day.id].push(alloc);
                }
            });
        }
        return acc;
    }, {} as Record<string, MasterTimeAllocation[]>);

    const sortedDayKeys = Object.keys(groupedAllocations).sort((a, b) => {
        return dayOrder.indexOf(a) - dayOrder.indexOf(b);
    });

    Object.keys(groupedAllocations).forEach(key => {
        groupedAllocations[key].sort((a, b) => a.start_time.localeCompare(b.start_time));
    });

    const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>(() => {
        const initial: Record<string, boolean> = {};
        sortedDayKeys.forEach(key => {
            initial[key] = true;
        });
        return initial;
    });

    const toggleDay = (dayId: string) => {
        setExpandedDays(prev => ({ ...prev, [dayId]: !prev[dayId] }));
    };

    const { data: createData, setData: setCreateData, post: createPost, processing: createProcessing, errors: createErrors, reset: createReset } = useForm({
        name: '',
        master_day_ids: [] as string[],
        type: 'period',
        period_number: '',
        start_time: '',
        end_time: '',
        description: '',
    });

    const { data: editData, setData: setEditData, put: editPut, processing: editProcessing, errors: editErrors, reset: editReset } = useForm({
        name: '',
        master_day_ids: [] as string[],
        type: 'period',
        period_number: '',
        start_time: '',
        end_time: '',
        description: '',
    });

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createPost('/time-allocations', {
            onSuccess: () => {
                toast.success('Alokasi Waktu berhasil ditambahkan.');
                setIsCreateOpen(false);
                createReset();
            },
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editAllocation) return;
        editPut(`/time-allocations/${editAllocation.id}`, {
            onSuccess: () => {
                toast.success('Alokasi Waktu berhasil diperbarui.');
                setIsEditOpen(false);
                setEditAllocation(null);
                editReset();
            },
        });
    };

    const handleDelete = (id: string) => {
        if (confirm('Apakah Anda yakin ingin menghapus alokasi waktu ini?')) {
            router.delete(`/time-allocations/${id}`, {
                onSuccess: () => {
                    toast.success('Alokasi Waktu berhasil dihapus.');
                },
            });
        }
    };

    const openEdit = (allocation: MasterTimeAllocation) => {
        setEditAllocation(allocation);
        setEditData({
            name: allocation.name,
            master_day_ids: allocation.master_days?.map(d => d.id) || [],
            type: allocation.type,
            period_number: allocation.period_number?.toString() || '',
            start_time: allocation.start_time.substring(0, 5),
            end_time: allocation.end_time.substring(0, 5),
            description: allocation.description || '',
        });
        setIsEditOpen(true);
    };

    const formatType = (type: string) => {
        switch (type) {
            case 'period': return 'Pelajaran';
            case 'break': return 'Istirahat';
            case 'ceremony': return 'Upacara';
            default: return type;
        }
    };

    return (
        <>
            <Head title="Alokasi Waktu" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 lg:p-8">
                <div className="flex items-center justify-between space-y-2">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Alokasi Waktu</h2>
                        <p className="text-muted-foreground">
                            Kelola jadwal per hari (Jam Pelajaran, Istirahat, Upacara).
                        </p>
                    </div>
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button>Tambah Waktu</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Tambah Alokasi Waktu</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleCreateSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="create_name">Nama Jadwal <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="create_name"
                                        value={createData.name}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCreateData('name', e.target.value)}
                                        placeholder="Misal: Jadwal Reguler JP 1"
                                        required
                                    />
                                    {createErrors.name && <p className="text-sm text-red-500">{createErrors.name}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Berlaku pada Hari <span className="text-red-500">*</span></Label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 border border-input rounded-md p-3 bg-background">
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
                                <div className="space-y-2">
                                    <Label htmlFor="create_type">Tipe <span className="text-red-500">*</span></Label>
                                    <select
                                        id="create_type"
                                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={createData.type}
                                        onChange={(e) => setCreateData('type', e.target.value)}
                                        required
                                    >
                                        <option value="period">Pelajaran</option>
                                        <option value="break">Istirahat</option>
                                        <option value="ceremony">Upacara</option>
                                    </select>
                                    {createErrors.type && <p className="text-sm text-red-500">{createErrors.type}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="create_period_number">JP Ke- (Isi jika Tipe = Pelajaran)</Label>
                                    <Input
                                        id="create_period_number"
                                        type="number"
                                        min="1"
                                        value={createData.period_number}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCreateData('period_number', e.target.value)}
                                        disabled={createData.type !== 'period'}
                                        placeholder="Misal: 1"
                                    />
                                    {createErrors.period_number && <p className="text-sm text-red-500">{createErrors.period_number}</p>}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="create_start_time">Waktu Mulai <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="create_start_time"
                                            type="time"
                                            value={createData.start_time}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCreateData('start_time', e.target.value)}
                                            required
                                        />
                                        {createErrors.start_time && <p className="text-sm text-red-500">{createErrors.start_time}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="create_end_time">Waktu Selesai <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="create_end_time"
                                            type="time"
                                            value={createData.end_time}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCreateData('end_time', e.target.value)}
                                            required
                                        />
                                        {createErrors.end_time && <p className="text-sm text-red-500">{createErrors.end_time}</p>}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="create_description">Deskripsi Tambahan</Label>
                                    <textarea
                                        id="create_description"
                                        value={createData.description}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCreateData('description', e.target.value)}
                                        placeholder="Opsional (Misal: Istirahat Pertama)"
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    />
                                    {createErrors.description && <p className="text-sm text-red-500">{createErrors.description}</p>}
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
                                <th className="p-4 font-medium w-48">Hari</th>
                                <th className="p-4 font-medium">Nama Jadwal</th>
                                <th className="p-4 font-medium">Tipe</th>
                                <th className="p-4 font-medium">JP Ke-</th>
                                <th className="p-4 font-medium">Waktu</th>
                                <th className="p-4 font-medium">Deskripsi</th>
                                <th className="p-4 font-medium text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedDayKeys.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                        Tidak ada data alokasi waktu.
                                    </td>
                                </tr>
                            )}
                            
                            {sortedDayKeys.map(dayId => {
                                const isExpanded = expandedDays[dayId];
                                const allocationsForDay = groupedAllocations[dayId];
                                const dayName = days.find(d => d.id === dayId)?.day_name || dayId;
                                const sessionCount = allocationsForDay.length;

                                return (
                                    <React.Fragment key={dayId}>
                                        <tr 
                                            className="border-b bg-muted/20 cursor-pointer hover:bg-muted/40 transition-colors"
                                            onClick={() => toggleDay(dayId)}
                                        >
                                            <td colSpan={6} className="p-3">
                                                <div className="flex items-center gap-2 font-semibold text-primary">
                                                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                                    {dayName}
                                                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                                                        ({sessionCount} Sesi)
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                        {isExpanded && allocationsForDay.map((alloc) => (
                                            <tr key={alloc.id} className="border-b transition-colors hover:bg-muted/10 last:border-b-0">
                                                <td className="p-4 pl-10 text-muted-foreground relative">
                                                    {/* Visual tree line indicator */}
                                                    <div className="absolute left-5 top-0 bottom-0 w-px bg-border"></div>
                                                    <div className="absolute left-5 top-1/2 w-3 h-px bg-border"></div>
                                                </td>
                                                <td className="p-4 font-medium">{alloc.name}</td>
                                                <td className="p-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${alloc.type === 'period' ? 'bg-blue-100 text-blue-800' : alloc.type === 'break' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                                                        {formatType(alloc.type)}
                                                    </span>
                                                </td>
                                                <td className="p-4">{alloc.period_number || '-'}</td>
                                                <td className="p-4">{alloc.start_time.substring(0, 5)} - {alloc.end_time.substring(0, 5)}</td>
                                                <td className="p-4">{alloc.description || '-'}</td>
                                                <td className="p-4 text-right space-x-2">
                                                    <Button variant="outline" size="sm" onClick={() => openEdit(alloc)}>Edit</Button>
                                                    <Button variant="destructive" size="sm" onClick={() => handleDelete(alloc.id)}>Hapus</Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Alokasi Waktu</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleEditSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit_name">Nama Jadwal <span className="text-red-500">*</span></Label>
                            <Input
                                id="edit_name"
                                value={editData.name}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditData('name', e.target.value)}
                                placeholder="Misal: Jadwal Reguler JP 1"
                                required
                            />
                            {editErrors.name && <p className="text-sm text-red-500">{editErrors.name}</p>}
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
                        <div className="space-y-2">
                            <Label htmlFor="edit_type">Tipe <span className="text-red-500">*</span></Label>
                            <select
                                id="edit_type"
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={editData.type}
                                onChange={(e) => {
                                    setEditData('type', e.target.value);
                                    if (e.target.value !== 'period') {
                                        setEditData('period_number', '');
                                    }
                                }}
                                required
                            >
                                <option value="period">Pelajaran</option>
                                <option value="break">Istirahat</option>
                                <option value="ceremony">Upacara</option>
                            </select>
                            {editErrors.type && <p className="text-sm text-red-500">{editErrors.type}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit_period_number">JP Ke- (Isi jika Tipe = Pelajaran)</Label>
                            <Input
                                id="edit_period_number"
                                type="number"
                                min="1"
                                value={editData.period_number}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditData('period_number', e.target.value)}
                                disabled={editData.type !== 'period'}
                            />
                            {editErrors.period_number && <p className="text-sm text-red-500">{editErrors.period_number}</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit_start_time">Waktu Mulai <span className="text-red-500">*</span></Label>
                                <Input
                                    id="edit_start_time"
                                    type="time"
                                    value={editData.start_time}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditData('start_time', e.target.value)}
                                    required
                                />
                                {editErrors.start_time && <p className="text-sm text-red-500">{editErrors.start_time}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit_end_time">Waktu Selesai <span className="text-red-500">*</span></Label>
                                <Input
                                    id="edit_end_time"
                                    type="time"
                                    value={editData.end_time}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditData('end_time', e.target.value)}
                                    required
                                />
                                {editErrors.end_time && <p className="text-sm text-red-500">{editErrors.end_time}</p>}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit_description">Deskripsi Tambahan</Label>
                            <textarea
                                id="edit_description"
                                value={editData.description}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditData('description', e.target.value)}
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                            {editErrors.description && <p className="text-sm text-red-500">{editErrors.description}</p>}
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

TimeAllocationIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Alokasi Waktu',
        },
    ],
};
