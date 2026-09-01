import { Head } from '@inertiajs/react';
import { dashboard } from '@/routes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useState } from 'react';
import { ChevronDown, Plus, Pencil, Trash2, Upload, Download } from 'lucide-react';
import { CreateModal } from './components/create-modal';
import { UpdateModal } from './components/update-modal';
import { DeleteModal } from './components/delete-modal';
import { CreateBatchClassModal } from './components/create-batch-class-modal';

export interface HomeroomTeacher {
    id: string;
    teacher_name: string;
}

export interface ClassModel {
    id: string;
    grade_level: string;
    class_name: string;
    major: string;
    master_classroom_teacher_id: string | null;
    homeroom_teacher?: HomeroomTeacher | null;
}

export default function ClassIndex({ classes, teachers, gradeLevels, majors }: { classes: ClassModel[], teachers: HomeroomTeacher[], gradeLevels: string[], majors: string[] }) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [editClass, setEditClass] = useState<ClassModel | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [deleteClass, setDeleteClass] = useState<ClassModel | null>(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    const openEdit = (cls: ClassModel) => {
        setEditClass(cls);
        setIsEditOpen(true);
    };

    const openDelete = (cls: ClassModel) => {
        setDeleteClass(cls);
        setIsDeleteOpen(true);
    };

    return (
        <>
            <Head title="Manajemen Kelas" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 lg:p-8">
                <div className="flex items-center justify-between space-y-2">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Kelas</h2>
                        <p className="text-muted-foreground">
                            Kelola data kelas.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <a href="/classes/export">
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
                            <Plus className="h-4 w-4" />
                            Tambah Kelas
                        </Button>
                    </div>
                </div>

                {/* Mobile View - Cards */}
                <div className="grid grid-cols-1 gap-4 md:hidden">
                    {classes.length === 0 && (
                        <div className="text-center p-4 text-muted-foreground border rounded-xl bg-card">
                            Tidak ada data kelas.
                        </div>
                    )}
                    {classes.map((cls) => (
                        <Card key={cls.id} className="py-2">
                            <CardContent className="pb-2">
                                <div className="flex flex-col gap-1">
                                    <div className="flex justify-between items-start">
                                        <span className="font-semibold text-base">{cls.class_name}</span>
                                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                                            {cls.grade_level === 'X' ? '10' : cls.grade_level === 'XI' ? '11' : cls.grade_level === 'XII' ? '12' : cls.grade_level}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                                        <div className="flex flex-col">
                                            <span className="text-muted-foreground text-[10px] uppercase tracking-wider">ID Kelas</span>
                                            <span className="font-medium">{cls.id}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-muted-foreground text-[10px] uppercase tracking-wider">Jurusan</span>
                                            <span className="font-medium">{cls.major}</span>
                                        </div>
                                        <div className="flex flex-col col-span-2 mt-1">
                                            <span className="text-muted-foreground text-[10px] uppercase tracking-wider">Wali Kelas</span>
                                            <span className="font-medium">{cls.homeroom_teacher?.teacher_name || '-'}</span>
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
                                <th className="p-4 font-medium">ID Kelas</th>
                                <th className="p-4 font-medium">Tingkat</th>
                                <th className="p-4 font-medium">Nama Kelas</th>
                                <th className="p-4 font-medium">Jurusan</th>
                                <th className="p-4 font-medium">Wali Kelas</th>
                                <th className="p-4 font-medium text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {classes.map((cls) => (
                                <tr key={cls.id} className="border-b transition-colors hover:bg-muted/50">
                                    <td className="p-4 font-medium">{cls.id}</td>
                                    <td className="p-4">{cls.grade_level}</td>
                                    <td className="p-4">{cls.class_name}</td>
                                    <td className="p-4">{cls.major}</td>
                                    <td className="p-4">{cls.homeroom_teacher?.teacher_name || '-'}</td>
                                    <td className="p-4 text-right space-x-2 whitespace-nowrap">
                                        <Button variant="outline" size="sm" onClick={() => openEdit(cls)}>Edit</Button>
                                        <Button variant="destructive" size="sm" onClick={() => openDelete(cls)}>Hapus</Button>
                                    </td>
                                </tr>
                            ))}

                            {classes.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-4 text-center text-muted-foreground">
                                        Tidak ada data kelas.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <CreateBatchClassModal isOpen={isImportOpen} setIsOpen={setIsImportOpen} />

            <CreateModal isOpen={isCreateOpen} setIsOpen={setIsCreateOpen} teachers={teachers} gradeLevels={gradeLevels} majors={majors} />

            <UpdateModal isOpen={isEditOpen} setIsOpen={setIsEditOpen} cls={editClass} teachers={teachers} gradeLevels={gradeLevels} majors={majors} />

            <DeleteModal isOpen={isDeleteOpen} setIsOpen={setIsDeleteOpen} cls={deleteClass} />
        </>
    );
}

ClassIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Kelas',
            href: '/classes',
        },
    ],
};
