import { Head } from '@inertiajs/react';
import { dashboard } from '@/routes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useState, useMemo } from 'react';
import { CreateModal } from './components/create-modal';
import { UpdateModal } from './components/update-modal';
import { DeleteModal } from './components/delete-modal';
import { ArrowDownAZ, ArrowUpZA, ArrowUpDown, Download } from 'lucide-react';

export interface MasterDay {
    id: string;
    day_name: string;
    notes?: string;
}

export default function MasterDayIndex({ days }: { days: MasterDay[] }) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editDay, setEditDay] = useState<MasterDay | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [deleteDay, setDeleteDay] = useState<MasterDay | null>(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);

    const openEdit = (day: MasterDay) => {
        setEditDay(day);
        setIsEditOpen(true);
    };

    const openDelete = (day: MasterDay) => {
        setDeleteDay(day);
        setIsDeleteOpen(true);
    };

    const handleSort = () => {
        if (sortOrder === null || sortOrder === 'desc') {
            setSortOrder('asc');
        } else {
            setSortOrder('desc');
        }
    };

    const sortedDays = useMemo(() => {
        if (!sortOrder) return days;
        return [...days].sort((a, b) => {
            if (sortOrder === 'asc') {
                return a.day_name.localeCompare(b.day_name);
            } else {
                return b.day_name.localeCompare(a.day_name);
            }
        });
    }, [days, sortOrder]);

    const SortIcon = sortOrder === 'asc' ? ArrowDownAZ : sortOrder === 'desc' ? ArrowUpZA : ArrowUpDown;

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
                    <div className="flex flex-wrap items-center gap-2">
                        <a href="/master-days/export">
                            <Button variant="outline" className="gap-2">
                                <Download className="h-4 w-4" />
                                <span className="hidden sm:inline">Export Batch</span>
                            </Button>
                        </a>
                        <Button onClick={() => setIsCreateOpen(true)}>Tambah Hari</Button>
                    </div>
                </div>

                <div className="flex justify-end md:hidden">
                    <Button variant="outline" size="sm" onClick={handleSort} className="gap-2">
                        <SortIcon className="h-4 w-4" />
                        Urutkan
                    </Button>
                </div>

                {/* Mobile View - Cards */}
                <div className="grid grid-cols-1 gap-4 md:hidden">
                    {sortedDays.length === 0 && (
                        <div className="text-center p-4 text-muted-foreground border rounded-xl bg-card">
                            Tidak ada data master hari.
                        </div>
                    )}
                    {sortedDays.map((day) => (
                        <Card key={day.id} className="py-4">
                            <CardContent className="pb-2">
                                <div className="flex flex-col gap-1">
                                    <span className="text-sm text-muted-foreground font-medium">ID: {day.id}</span>
                                    <span className="text-lg font-semibold">{day.day_name}</span>
                                    {day.notes && (
                                        <span className="text-sm text-muted-foreground mt-1 line-clamp-2">Catatan: {day.notes}</span>
                                    )}
                                </div>
                            </CardContent>
                            <CardFooter className="pt-2 flex gap-2 justify-end">
                                <Button variant="outline" size="sm" onClick={() => openEdit(day)}>Edit</Button>
                                <Button variant="destructive" size="sm" onClick={() => openDelete(day)}>Hapus</Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                {/* Desktop View - Table */}
                <div className="hidden rounded-md border md:block">
                    <table className="w-full text-sm">
                        <thead className="border-b bg-muted/50">
                            <tr className="text-left">
                                <th className="p-4 font-medium">ID</th>
                                <th className="p-4 font-medium cursor-pointer hover:bg-muted/80 transition-colors" onClick={handleSort}>
                                    <div className="flex items-center gap-2">
                                        Nama Hari
                                        <SortIcon className="h-4 w-4" />
                                    </div>
                                </th>
                                <th className="p-4 font-medium">Catatan</th>
                                <th className="p-4 font-medium text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedDays.map((day) => (
                                <tr key={day.id} className="border-b transition-colors hover:bg-muted/50">
                                    <td className="p-4 font-medium">{day.id}</td>
                                    <td className="p-4">{day.day_name}</td>
                                    <td className="p-4">{day.notes || '-'}</td>
                                    <td className="p-4 text-right space-x-2">
                                        <Button variant="outline" size="sm" onClick={() => openEdit(day)}>Edit</Button>
                                        <Button variant="destructive" size="sm" onClick={() => openDelete(day)}>Hapus</Button>
                                    </td>
                                </tr>
                            ))}
                            
                            {sortedDays.length === 0 && (
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

            <CreateModal isOpen={isCreateOpen} setIsOpen={setIsCreateOpen} />
            
            <UpdateModal isOpen={isEditOpen} setIsOpen={setIsEditOpen} day={editDay} />
            
            <DeleteModal isOpen={isDeleteOpen} setIsOpen={setIsDeleteOpen} day={deleteDay} />
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
