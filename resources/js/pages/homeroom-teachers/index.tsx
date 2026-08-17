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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { toast } from 'sonner';

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
    const [editTeacher, setEditTeacher] = useState<HomeroomTeacherModel | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);

    const { data: createData, setData: setCreateData, post: createPost, processing: createProcessing, errors: createErrors, reset: createReset } = useForm({
        id: '',
        teacher_name: '',
        user_id: '',
    });

    const { data: editData, setData: setEditData, put: editPut, processing: editProcessing, errors: editErrors, reset: editReset } = useForm({
        id: '',
        teacher_name: '',
        user_id: '',
    });

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createPost('/homeroom-teachers', {
            onSuccess: () => {
                toast.success('Homeroom teacher added successfully.');
                setIsCreateOpen(false);
                createReset();
            },
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editTeacher) return;
        editPut(`/homeroom-teachers/${editTeacher.id}`, {
            onSuccess: () => {
                toast.success('Homeroom teacher updated successfully.');
                setIsEditOpen(false);
                setEditTeacher(null);
                editReset();
            },
        });
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this teacher?')) {
            router.delete(`/homeroom-teachers/${id}`, {
                onSuccess: () => {
                    toast.success('Homeroom teacher deleted successfully.');
                },
            });
        }
    };

    const openEdit = (teacher: HomeroomTeacherModel) => {
        setEditTeacher(teacher);
        setEditData({
            id: teacher.id,
            teacher_name: teacher.teacher_name,
            user_id: teacher.user_id || '',
        });
        setIsEditOpen(true);
    };

    return (
        <>
            <Head title="Homeroom Teachers Management" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 lg:p-8">
                <div className="flex items-center justify-between space-y-2">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Homeroom Teachers</h2>
                        <p className="text-muted-foreground">
                            Manage homeroom teacher data and link to user accounts.
                        </p>
                    </div>
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button>Add Teacher</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add Homeroom Teacher</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleCreateSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="create_id">Teacher ID (NIP/NIK)</Label>
                                    <Input
                                        id="create_id"
                                        value={createData.id}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCreateData('id', e.target.value)}
                                        placeholder="e.g. 198001012010011001"
                                    />
                                    {createErrors.id && <p className="text-sm text-red-500">{createErrors.id}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="create_teacher_name">Teacher Name</Label>
                                    <Input
                                        id="create_teacher_name"
                                        value={createData.teacher_name}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCreateData('teacher_name', e.target.value)}
                                        placeholder="e.g. Budi Santoso, S.Pd."
                                    />
                                    {createErrors.teacher_name && <p className="text-sm text-red-500">{createErrors.teacher_name}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="create_user_id">Link User Account (Role GURU)</Label>
                                    <Select 
                                        value={createData.user_id || 'none'} 
                                        onValueChange={(val) => setCreateData('user_id', val === 'none' ? '' : val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select User Account" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None (No Account)</SelectItem>
                                            {users.map(user => (
                                                <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {createErrors.user_id && <p className="text-sm text-red-500">{createErrors.user_id}</p>}
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                                    <Button type="submit" disabled={createProcessing}>Save</Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="rounded-md border overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="border-b bg-muted/50 whitespace-nowrap">
                            <tr className="text-left">
                                <th className="p-4 font-medium">Teacher ID</th>
                                <th className="p-4 font-medium">Teacher Name</th>
                                <th className="p-4 font-medium">Linked Account</th>
                                <th className="p-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teachers.map((teacher) => (
                                <tr key={teacher.id} className="border-b transition-colors hover:bg-muted/50">
                                    <td className="p-4 font-medium">{teacher.id}</td>
                                    <td className="p-4">{teacher.teacher_name}</td>
                                    <td className="p-4">{teacher.user ? teacher.user.name : <span className="text-muted-foreground italic">Unlinked</span>}</td>
                                    <td className="p-4 text-right space-x-2 whitespace-nowrap">
                                        <Button variant="outline" size="sm" onClick={() => openEdit(teacher)}>Edit</Button>
                                        <Button variant="destructive" size="sm" onClick={() => handleDelete(teacher.id)}>Delete</Button>
                                    </td>
                                </tr>
                            ))}
                            
                            {teachers.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-4 text-center text-muted-foreground">
                                        No homeroom teachers found.
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
                        <DialogTitle>Edit Homeroom Teacher</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleEditSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit_id">Teacher ID (NIP/NIK)</Label>
                            <Input
                                id="edit_id"
                                value={editData.id}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditData('id', e.target.value)}
                            />
                            {editErrors.id && <p className="text-sm text-red-500">{editErrors.id}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit_teacher_name">Teacher Name</Label>
                            <Input
                                id="edit_teacher_name"
                                value={editData.teacher_name}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditData('teacher_name', e.target.value)}
                            />
                            {editErrors.teacher_name && <p className="text-sm text-red-500">{editErrors.teacher_name}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit_user_id">Link User Account (Role GURU)</Label>
                            <Select 
                                value={editData.user_id || 'none'} 
                                onValueChange={(val) => setEditData('user_id', val === 'none' ? '' : val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select User Account" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None (No Account)</SelectItem>
                                    {users.map(user => (
                                        <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {editErrors.user_id && <p className="text-sm text-red-500">{editErrors.user_id}</p>}
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

HomeroomTeacherIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Homeroom Teachers',
            href: '/homeroom-teachers',
        },
    ],
};
