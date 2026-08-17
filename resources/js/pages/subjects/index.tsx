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

interface Subject {
    id: string;
    subject_name: string;
}

export default function SubjectIndex({ subjects }: { subjects: Subject[] }) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editSubject, setEditSubject] = useState<Subject | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);

    const { data: createData, setData: setCreateData, post: createPost, processing: createProcessing, errors: createErrors, reset: createReset } = useForm({
        id: '',
        subject_name: '',
    });

    const { data: editData, setData: setEditData, put: editPut, processing: editProcessing, errors: editErrors, reset: editReset } = useForm({
        id: '',
        subject_name: '',
    });

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createPost('/subjects', {
            onSuccess: () => {
                toast.success('Subject added successfully.');
                setIsCreateOpen(false);
                createReset();
            },
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editSubject) return;
        editPut(`/subjects/${editSubject.id}`, {
            onSuccess: () => {
                toast.success('Subject updated successfully.');
                setIsEditOpen(false);
                setEditSubject(null);
                editReset();
            },
        });
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this subject?')) {
            router.delete(`/subjects/${id}`, {
                onSuccess: () => {
                    toast.success('Subject deleted successfully.');
                },
            });
        }
    };

    const openEdit = (subject: Subject) => {
        setEditSubject(subject);
        setEditData({
            id: subject.id,
            subject_name: subject.subject_name,
        });
        setIsEditOpen(true);
    };

    return (
        <>
            <Head title="Subjects Management" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 lg:p-8">
                <div className="flex items-center justify-between space-y-2">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Subjects</h2>
                        <p className="text-muted-foreground">
                            Manage subject data.
                        </p>
                    </div>
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button>Add Subject</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add Subject</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleCreateSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="create_id">Subject ID</Label>
                                    <Input
                                        id="create_id"
                                        value={createData.id}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCreateData('id', e.target.value)}
                                        placeholder="e.g. MTK"
                                    />
                                    {createErrors.id && <p className="text-sm text-red-500">{createErrors.id}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="create_subject_name">Subject Name</Label>
                                    <Input
                                        id="create_subject_name"
                                        value={createData.subject_name}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCreateData('subject_name', e.target.value)}
                                        placeholder="e.g. Mathematics"
                                    />
                                    {createErrors.subject_name && <p className="text-sm text-red-500">{createErrors.subject_name}</p>}
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                                    <Button type="submit" disabled={createProcessing}>Save</Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="rounded-md border">
                    <table className="w-full text-sm">
                        <thead className="border-b bg-muted/50">
                            <tr className="text-left">
                                <th className="p-4 font-medium">Subject ID</th>
                                <th className="p-4 font-medium">Subject Name</th>
                                <th className="p-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subjects.map((subject) => (
                                <tr key={subject.id} className="border-b transition-colors hover:bg-muted/50">
                                    <td className="p-4 font-medium">{subject.id}</td>
                                    <td className="p-4">{subject.subject_name}</td>
                                    <td className="p-4 text-right space-x-2">
                                        <Button variant="outline" size="sm" onClick={() => openEdit(subject)}>Edit</Button>
                                        <Button variant="destructive" size="sm" onClick={() => handleDelete(subject.id)}>Delete</Button>
                                    </td>
                                </tr>
                            ))}
                            
                            {subjects.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="p-4 text-center text-muted-foreground">
                                        No subjects found.
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
                        <DialogTitle>Edit Subject</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleEditSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit_id">Subject ID</Label>
                            <Input
                                id="edit_id"
                                value={editData.id}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditData('id', e.target.value)}
                            />
                            {editErrors.id && <p className="text-sm text-red-500">{editErrors.id}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit_subject_name">Subject Name</Label>
                            <Input
                                id="edit_subject_name"
                                value={editData.subject_name}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditData('subject_name', e.target.value)}
                            />
                            {editErrors.subject_name && <p className="text-sm text-red-500">{editErrors.subject_name}</p>}
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={editProcessing}>Save Changes</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
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
            title: 'Subjects',
            href: '/subjects',
        },
    ],
};
