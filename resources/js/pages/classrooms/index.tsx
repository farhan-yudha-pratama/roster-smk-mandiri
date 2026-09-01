import { Head } from '@inertiajs/react';
import { dashboard } from '@/routes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useState } from 'react';
import { CreateModal } from './components/create-modal';
import { Download } from 'lucide-react';
import { UpdateModal } from './components/update-modal';
import { DeleteModal } from './components/delete-modal';

export interface ClassroomModel {
    id: string;
    room_name: string;
    room_type: string | null;
}

export default function ClassroomIndex({ classrooms, roomTypes }: { classrooms: ClassroomModel[], roomTypes: string[] }) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editClassroom, setEditClassroom] = useState<ClassroomModel | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [deleteClassroom, setDeleteClassroom] = useState<ClassroomModel | null>(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    const openEdit = (cls: ClassroomModel) => {
        setEditClassroom(cls);
        setIsEditOpen(true);
    };

    const openDelete = (cls: ClassroomModel) => {
        setDeleteClassroom(cls);
        setIsDeleteOpen(true);
    };

    return (
        <>
            <Head title="Manajemen Ruangan" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 lg:p-8">
                <div className="flex items-center justify-between space-y-2">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Ruangan</h2>
                        <p className="text-muted-foreground">
                            Kelola data ruangan kelas atau laboratorium.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <a href="/classrooms/export">
                            <Button variant="outline" className="gap-2">
                                <Download className="h-4 w-4" />
                                <span className="hidden sm:inline">Export Batch</span>
                            </Button>
                        </a>
                        <Button onClick={() => setIsCreateOpen(true)}>Tambah Ruangan</Button>
                    </div>
                </div>

                {/* Mobile View - Cards */}
                <div className="grid grid-cols-1 gap-4 md:hidden">
                    {classrooms.length === 0 && (
                        <div className="text-center p-4 text-muted-foreground border rounded-xl bg-card">
                            Tidak ada data ruangan.
                        </div>
                    )}
                    {classrooms.map((cls) => (
                        <Card key={cls.id} className="py-2">
                            <CardContent className="pb-2">
                                <div className="flex flex-col gap-1">
                                    <div className="flex justify-between items-start">
                                        <span className="font-semibold text-base">{cls.room_name}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                                        <div className="flex flex-col">
                                            <span className="text-muted-foreground text-[10px] uppercase tracking-wider">Kode Ruangan</span>
                                            <span className="font-medium">{cls.id}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-muted-foreground text-[10px] uppercase tracking-wider">Tipe</span>
                                            <span className="font-medium">{cls.room_type || '-'}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="pt-2 flex gap-2 justify-end border-t border-border/50 mt-2">
                                <Button variant="outline" size="sm" onClick={() => openEdit(cls)} className="h-8 text-xs">Edit</Button>
                                <Button variant="destructive" size="sm" onClick={() => openDelete(cls)} className="h-8 text-xs">Hapus</Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                {/* Desktop View - Table */}
                <div className="hidden rounded-md border md:block overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="border-b bg-muted/50 whitespace-nowrap">
                            <tr className="text-left">
                                <th className="p-4 font-medium">Kode Ruangan</th>
                                <th className="p-4 font-medium">Nama Ruangan</th>
                                <th className="p-4 font-medium">Tipe Ruangan</th>
                                <th className="p-4 font-medium text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {classrooms.map((cls) => (
                                <tr key={cls.id} className="border-b transition-colors hover:bg-muted/50">
                                    <td className="p-4 font-medium">{cls.id}</td>
                                    <td className="p-4">{cls.room_name}</td>
                                    <td className="p-4">{cls.room_type || '-'}</td>
                                    <td className="p-4 text-right space-x-2 whitespace-nowrap">
                                        <Button variant="outline" size="sm" onClick={() => openEdit(cls)}>Edit</Button>
                                        <Button variant="destructive" size="sm" onClick={() => openDelete(cls)}>Hapus</Button>
                                    </td>
                                </tr>
                            ))}
                            
                            {classrooms.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-4 text-center text-muted-foreground">
                                        Tidak ada data ruangan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <CreateModal isOpen={isCreateOpen} setIsOpen={setIsCreateOpen} roomTypes={roomTypes} />
            
            <UpdateModal isOpen={isEditOpen} setIsOpen={setIsEditOpen} classroom={editClassroom} roomTypes={roomTypes} />
            
            <DeleteModal isOpen={isDeleteOpen} setIsOpen={setIsDeleteOpen} classroom={deleteClassroom} />
        </>
    );
}

ClassroomIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Ruangan',
            href: '/classrooms',
        },
    ],
};
