import { Head } from '@inertiajs/react';
import { dashboard } from '@/routes';
import { Button } from '@/components/ui/button';
import { PlusIcon, PencilIcon, TrashIcon, Upload, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useState } from 'react';
import { CreateModal } from './components/create-modal';
import { UpdateModal } from './components/update-modal';
import { DeleteModal } from './components/delete-modal';
import { CreateBatchHomeroomTeacherModal } from './components/create-batch-homeroom-teacher-modal';

interface User {
    id: string;
    name: string;
}

interface HomeroomTeacherModel {
    id: string;
    teacher_name: string;
    user_id: string | null;
    user?: User | null;
}

export default function HomeroomTeacherIndex({ teachers, users }: { teachers: HomeroomTeacherModel[], users: User[] }) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [isUpdateOpen, setIsUpdateOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    
    const [selectedTeacher, setSelectedTeacher] = useState<HomeroomTeacherModel | null>(null);

    const openUpdateModal = (teacher: HomeroomTeacherModel) => {
        setSelectedTeacher(teacher);
        setIsUpdateOpen(true);
    };

    const openDeleteModal = (teacher: HomeroomTeacherModel) => {
        setSelectedTeacher(teacher);
        setIsDeleteOpen(true);
    };

    return (
        <>
            <Head title="Manajemen Guru" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 lg:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Manajemen Guru</h2>
                        <p className="text-muted-foreground">
                            Kelola data guru dan tautkan dengan akun pengguna.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <a href="/homeroom-teachers/export">
                            <Button variant="outline" className="gap-2">
                                <Download className="h-4 w-4" />
                                <span className="hidden sm:inline">Export Batch</span>
                            </Button>
                        </a>
                        <Button variant="outline" onClick={() => setIsImportOpen(true)} className="gap-2">
                            <Upload className="h-4 w-4" />
                            <span className="hidden sm:inline">Import Batch</span>
                        </Button>
                        <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
                            <PlusIcon className="h-4 w-4" />
                            Tambah Guru
                        </Button>
                    </div>
                </div>

                {/* Mobile View: Cards */}
                <div className="grid grid-cols-1 gap-4 md:hidden">
                    {teachers.map((teacher) => (
                        <Card key={teacher.id}>
                            <CardHeader className="pb-2">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-lg">{teacher.teacher_name}</CardTitle>
                                        <CardDescription className="mt-1">ID: {teacher.id}</CardDescription>
                                    </div>
                                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] sm:text-xs font-semibold border-transparent bg-secondary text-secondary-foreground text-center">
                                        Akun: {teacher.user ? teacher.user.name : <span className="italic">Tidak Tautkan</span>}
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-end gap-2 mt-2">
                                    <Button variant="outline" size="sm" onClick={() => openUpdateModal(teacher)}>
                                        <PencilIcon className="h-4 w-4 mr-1" /> Edit
                                    </Button>
                                    <Button variant="destructive" size="sm" onClick={() => openDeleteModal(teacher)}>
                                        <TrashIcon className="h-4 w-4 mr-1" /> Hapus
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    
                    {teachers.length === 0 && (
                        <div className="text-center p-4 text-muted-foreground border rounded-md">
                            Tidak ada data guru.
                        </div>
                    )}
                </div>

                {/* Desktop View: Table */}
                <div className="hidden md:block rounded-md border bg-card">
                    <table className="w-full text-sm">
                        <thead className="border-b bg-muted/50 whitespace-nowrap">
                            <tr className="text-left">
                                <th className="p-4 font-medium">ID Guru</th>
                                <th className="p-4 font-medium">Nama Guru</th>
                                <th className="p-4 font-medium">Akun Tertaut</th>
                                <th className="p-4 font-medium text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teachers.map((teacher) => (
                                <tr key={teacher.id} className="border-b transition-colors hover:bg-muted/50">
                                    <td className="p-4 font-medium">{teacher.id}</td>
                                    <td className="p-4">{teacher.teacher_name}</td>
                                    <td className="p-4">
                                        {teacher.user ? teacher.user.name : <span className="text-muted-foreground italic">Tidak Ditautkan</span>}
                                    </td>
                                    <td className="p-4 text-right space-x-2 whitespace-nowrap">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="outline" size="sm" onClick={() => openUpdateModal(teacher)}>
                                                <PencilIcon className="h-4 w-4" />
                                            </Button>
                                            <Button variant="destructive" size="sm" onClick={() => openDeleteModal(teacher)}>
                                                <TrashIcon className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            
                            {teachers.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-4 text-center text-muted-foreground">
                                        Tidak ada data guru.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <CreateBatchHomeroomTeacherModal isOpen={isImportOpen} setIsOpen={setIsImportOpen} />

            <CreateModal 
                isOpen={isCreateOpen} 
                onClose={() => setIsCreateOpen(false)} 
                users={users} 
            />

            <UpdateModal 
                isOpen={isUpdateOpen} 
                onClose={() => {
                    setIsUpdateOpen(false);
                    setTimeout(() => setSelectedTeacher(null), 300);
                }} 
                teacher={selectedTeacher} 
                users={users} 
            />

            <DeleteModal 
                isOpen={isDeleteOpen} 
                onClose={() => {
                    setIsDeleteOpen(false);
                    setTimeout(() => setSelectedTeacher(null), 300);
                }} 
                teacher={selectedTeacher} 
            />
        </>
    );
}

HomeroomTeacherIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Manajemen Guru',
            href: '/homeroom-teachers',
        },
    ],
};
