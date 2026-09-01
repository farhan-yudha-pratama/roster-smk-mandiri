import { Head } from '@inertiajs/react';
import { dashboard } from '@/routes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useState, useMemo } from 'react';
import { CreateSubjectModal } from './components/create-subject-modal';
import { UpdateSubjectModal } from './components/update-subject-modal';
import { DeleteSubjectModal } from './components/delete-subject-modal';
import { CreateBatchSubjectModal } from './components/create-batch-subject-modal';
import { ArrowDownAZ, ArrowUpZA, ArrowUpDown, Upload, Download } from 'lucide-react';

interface Subject {
    id: string;
    subject_name: string;
}

export default function SubjectIndex({ subjects }: { subjects: Subject[] }) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editSubject, setEditSubject] = useState<Subject | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [deleteSubject, setDeleteSubject] = useState<Subject | null>(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);

    const openEdit = (subject: Subject) => {
        setEditSubject(subject);
        setIsEditOpen(true);
    };

    const openDelete = (subject: Subject) => {
        setDeleteSubject(subject);
        setIsDeleteOpen(true);
    };

    const handleSort = () => {
        if (sortOrder === null || sortOrder === 'desc') {
            setSortOrder('asc');
        } else {
            setSortOrder('desc');
        }
    };

    const sortedSubjects = useMemo(() => {
        if (!sortOrder) return subjects;
        return [...subjects].sort((a, b) => {
            if (sortOrder === 'asc') {
                return a.subject_name.localeCompare(b.subject_name);
            } else {
                return b.subject_name.localeCompare(a.subject_name);
            }
        });
    }, [subjects, sortOrder]);

    const SortIcon = sortOrder === 'asc' ? ArrowDownAZ : sortOrder === 'desc' ? ArrowUpZA : ArrowUpDown;

    return (
        <>
            <Head title="Manajemen Mata Pelajaran" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 lg:p-8">
                <div className="flex items-center justify-between space-y-2">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Mata Pelajaran</h2>
                        <p className="text-muted-foreground">
                            Kelola data mata pelajaran.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <a href="/subjects/export">
                            <Button variant="outline" className="gap-2">
                                <Download className="h-4 w-4" />
                                <span className="hidden sm:inline">Export Batch</span>
                            </Button>
                        </a>
                        <Button variant="outline" onClick={() => setIsImportOpen(true)} className="gap-2">
                            <Upload className="h-4 w-4" />
                            <span className="hidden sm:inline">Import Batch</span>
                        </Button>
                        <Button onClick={() => setIsCreateOpen(true)}>Tambah Mata Pelajaran</Button>
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
                    {sortedSubjects.length === 0 && (
                        <div className="text-center p-4 text-muted-foreground border rounded-xl bg-card">
                            Tidak ada mata pelajaran.
                        </div>
                    )}
                    {sortedSubjects.map((subject) => (
                        <Card key={subject.id} className="py-4">
                            <CardContent className="pb-2">
                                <div className="flex flex-col gap-1">
                                    <span className="text-sm text-muted-foreground font-medium">ID: {subject.id}</span>
                                    <span className="text-lg font-semibold">{subject.subject_name}</span>
                                </div>
                            </CardContent>
                            <CardFooter className="pt-2 flex gap-2 justify-end">
                                <Button variant="outline" size="sm" onClick={() => openEdit(subject)}>Edit</Button>
                                <Button variant="destructive" size="sm" onClick={() => openDelete(subject)}>Hapus</Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                {/* Desktop View - Table */}
                <div className="hidden rounded-md border md:block">
                    <table className="w-full text-sm">
                        <thead className="border-b bg-muted/50">
                            <tr className="text-left">
                                <th className="p-4 font-medium">ID Mata Pelajaran</th>
                                <th className="p-4 font-medium cursor-pointer hover:bg-muted/80 transition-colors" onClick={handleSort}>
                                    <div className="flex items-center gap-2">
                                        Nama Mata Pelajaran
                                        <SortIcon className="h-4 w-4" />
                                    </div>
                                </th>
                                <th className="p-4 font-medium text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedSubjects.map((subject) => (
                                <tr key={subject.id} className="border-b transition-colors hover:bg-muted/50">
                                    <td className="p-4 font-medium">{subject.id}</td>
                                    <td className="p-4">{subject.subject_name}</td>
                                    <td className="p-4 text-right space-x-2">
                                        <Button variant="outline" size="sm" onClick={() => openEdit(subject)}>Edit</Button>
                                        <Button variant="destructive" size="sm" onClick={() => openDelete(subject)}>Hapus</Button>
                                    </td>
                                </tr>
                            ))}
                            
                            {sortedSubjects.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="p-4 text-center text-muted-foreground">
                                        Tidak ada mata pelajaran.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <CreateSubjectModal isOpen={isCreateOpen} setIsOpen={setIsCreateOpen} />
            
            <CreateBatchSubjectModal isOpen={isImportOpen} setIsOpen={setIsImportOpen} />
            
            <UpdateSubjectModal isOpen={isEditOpen} setIsOpen={setIsEditOpen} subject={editSubject} />
            
            <DeleteSubjectModal isOpen={isDeleteOpen} setIsOpen={setIsDeleteOpen} subject={deleteSubject} />
        </>
    );
}

SubjectIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Mata Pelajaran',
            href: '/subjects',
        },
    ],
};
