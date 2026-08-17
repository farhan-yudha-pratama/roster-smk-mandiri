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

interface ClassroomModel {
    id: string;
    room_name: string;
    room_type: string | null;
}

export default function ClassroomIndex({ classrooms, roomTypes }: { classrooms: ClassroomModel[], roomTypes: string[] }) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editClassroom, setEditClassroom] = useState<ClassroomModel | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);

    const { data: createData, setData: setCreateData, post: createPost, processing: createProcessing, errors: createErrors, reset: createReset } = useForm({
        id: '',
        room_name: '',
        room_type: '',
    });

    const { data: editData, setData: setEditData, put: editPut, processing: editProcessing, errors: editErrors, reset: editReset } = useForm({
        id: '',
        room_name: '',
        room_type: '',
    });

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createPost('/classrooms', {
            onSuccess: () => {
                toast.success('Classroom added successfully.');
                setIsCreateOpen(false);
                createReset();
            },
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editClassroom) return;
        editPut(`/classrooms/${editClassroom.id}`, {
            onSuccess: () => {
                toast.success('Classroom updated successfully.');
                setIsEditOpen(false);
                setEditClassroom(null);
                editReset();
            },
        });
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this classroom?')) {
            router.delete(`/classrooms/${id}`, {
                onSuccess: () => {
                    toast.success('Classroom deleted successfully.');
                },
            });
        }
    };

    const openEdit = (cls: ClassroomModel) => {
        setEditClassroom(cls);
        setEditData({
            id: cls.id,
            room_name: cls.room_name,
            room_type: cls.room_type || '',
        });
        setIsEditOpen(true);
    };

    return (
        <>
            <Head title="Classrooms Management" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 lg:p-8">
                <div className="flex items-center justify-between space-y-2">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Classrooms</h2>
                        <p className="text-muted-foreground">
                            Manage classroom data.
                        </p>
                    </div>
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button>Add Classroom</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add Classroom</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleCreateSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="create_id">Classroom ID (Code)</Label>
                                    <Input
                                        id="create_id"
                                        value={createData.id}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCreateData('id', e.target.value)}
                                        placeholder="e.g. LAB-05"
                                    />
                                    {createErrors.id && <p className="text-sm text-red-500">{createErrors.id}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="create_room_name">Room Name</Label>
                                    <Input
                                        id="create_room_name"
                                        value={createData.room_name}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCreateData('room_name', e.target.value)}
                                        placeholder="e.g. Laboratorium Komputer 5"
                                    />
                                    {createErrors.room_name && <p className="text-sm text-red-500">{createErrors.room_name}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="create_room_type">Room Type</Label>
                                    <Select 
                                        value={createData.room_type} 
                                        onValueChange={(val) => setCreateData('room_type', val === 'none' ? '' : val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Room Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            {roomTypes.map((type) => (
                                                <SelectItem key={type} value={type}>{type}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {createErrors.room_type && <p className="text-sm text-red-500">{createErrors.room_type}</p>}
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
                                <th className="p-4 font-medium">Room Code</th>
                                <th className="p-4 font-medium">Room Name</th>
                                <th className="p-4 font-medium">Room Type</th>
                                <th className="p-4 font-medium text-right">Actions</th>
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
                                        <Button variant="destructive" size="sm" onClick={() => handleDelete(cls.id)}>Delete</Button>
                                    </td>
                                </tr>
                            ))}
                            
                            {classrooms.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-4 text-center text-muted-foreground">
                                        No classrooms found.
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
                        <DialogTitle>Edit Classroom</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleEditSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit_id">Classroom ID (Code)</Label>
                            <Input
                                id="edit_id"
                                value={editData.id}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditData('id', e.target.value)}
                            />
                            {editErrors.id && <p className="text-sm text-red-500">{editErrors.id}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit_room_name">Room Name</Label>
                            <Input
                                id="edit_room_name"
                                value={editData.room_name}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditData('room_name', e.target.value)}
                            />
                            {editErrors.room_name && <p className="text-sm text-red-500">{editErrors.room_name}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit_room_type">Room Type</Label>
                            <Select 
                                value={editData.room_type || 'none'} 
                                onValueChange={(val) => setEditData('room_type', val === 'none' ? '' : val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Room Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    {roomTypes.map((type) => (
                                        <SelectItem key={type} value={type}>{type}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {editErrors.room_type && <p className="text-sm text-red-500">{editErrors.room_type}</p>}
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

ClassroomIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Classrooms',
            href: '/classrooms',
        },
    ],
};
