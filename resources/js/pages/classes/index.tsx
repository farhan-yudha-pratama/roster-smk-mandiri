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

interface HomeroomTeacher {
    id: string;
    teacher_name: string;
}

interface ClassModel {
    id: string;
    grade_level: string;
    class_name: string;
    major: string;
    master_classroom_teacher_id: string | null;
    homeroom_teacher?: HomeroomTeacher | null;
}

export default function ClassIndex({ classes, teachers, gradeLevels, majors }: { classes: ClassModel[], teachers: HomeroomTeacher[], gradeLevels: string[], majors: string[] }) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editClass, setEditClass] = useState<ClassModel | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);

    const { data: createData, setData: setCreateData, post: createPost, processing: createProcessing, errors: createErrors, reset: createReset } = useForm({
        id: '',
        grade_level: '',
        class_name: '',
        major: '',
        master_classroom_teacher_id: '',
    });

    const { data: editData, setData: setEditData, put: editPut, processing: editProcessing, errors: editErrors, reset: editReset } = useForm({
        id: '',
        grade_level: '',
        class_name: '',
        major: '',
        master_classroom_teacher_id: '',
    });

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createPost('/classes', {
            onSuccess: () => {
                toast.success('Class added successfully.');
                setIsCreateOpen(false);
                createReset();
            },
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editClass) return;
        editPut(`/classes/${editClass.id}`, {
            onSuccess: () => {
                toast.success('Class updated successfully.');
                setIsEditOpen(false);
                setEditClass(null);
                editReset();
            },
        });
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this class?')) {
            router.delete(`/classes/${id}`, {
                onSuccess: () => {
                    toast.success('Class deleted successfully.');
                },
            });
        }
    };

    const openEdit = (cls: ClassModel) => {
        setEditClass(cls);
        setEditData({
            id: cls.id,
            grade_level: cls.grade_level,
            class_name: cls.class_name,
            major: cls.major,
            master_classroom_teacher_id: cls.master_classroom_teacher_id || '',
        });
        setIsEditOpen(true);
    };

    return (
        <>
            <Head title="Classes Management" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 lg:p-8">
                <div className="flex items-center justify-between space-y-2">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Classes</h2>
                        <p className="text-muted-foreground">
                            Manage class data.
                        </p>
                    </div>
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button>Add Class</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add Class</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleCreateSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="create_id">Class ID</Label>
                                    <Input
                                        id="create_id"
                                        value={createData.id}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCreateData('id', e.target.value)}
                                        placeholder="e.g. XII-TKJ-1"
                                    />
                                    {createErrors.id && <p className="text-sm text-red-500">{createErrors.id}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="create_grade_level">Grade Level</Label>
                                    <Select 
                                        value={createData.grade_level} 
                                        onValueChange={(val) => setCreateData('grade_level', val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Grade Level" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {gradeLevels.map((level) => (
                                                <SelectItem key={level} value={level}>{level}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {createErrors.grade_level && <p className="text-sm text-red-500">{createErrors.grade_level}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="create_class_name">Class Name</Label>
                                    <Input
                                        id="create_class_name"
                                        value={createData.class_name}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCreateData('class_name', e.target.value)}
                                        placeholder="e.g. Kelas XII TKJ 1"
                                    />
                                    {createErrors.class_name && <p className="text-sm text-red-500">{createErrors.class_name}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="create_major">Major</Label>
                                    <Select 
                                        value={createData.major} 
                                        onValueChange={(val) => setCreateData('major', val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Major" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {majors.map((major) => (
                                                <SelectItem key={major} value={major}>{major}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {createErrors.major && <p className="text-sm text-red-500">{createErrors.major}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="create_master_classroom_teacher_id">Homeroom Teacher</Label>
                                    <Select 
                                        value={createData.master_classroom_teacher_id} 
                                        onValueChange={(val) => setCreateData('master_classroom_teacher_id', val === 'none' ? '' : val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Homeroom Teacher" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            {teachers.map(teacher => (
                                                <SelectItem key={teacher.id} value={teacher.id}>{teacher.teacher_name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {createErrors.master_classroom_teacher_id && <p className="text-sm text-red-500">{createErrors.master_classroom_teacher_id}</p>}
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
                                <th className="p-4 font-medium">Class ID</th>
                                <th className="p-4 font-medium">Grade</th>
                                <th className="p-4 font-medium">Class Name</th>
                                <th className="p-4 font-medium">Major</th>
                                <th className="p-4 font-medium">Homeroom</th>
                                <th className="p-4 font-medium text-right">Actions</th>
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
                                        <Button variant="destructive" size="sm" onClick={() => handleDelete(cls.id)}>Delete</Button>
                                    </td>
                                </tr>
                            ))}
                            
                            {classes.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-4 text-center text-muted-foreground">
                                        No classes found.
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
                        <DialogTitle>Edit Class</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleEditSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit_id">Class ID</Label>
                            <Input
                                id="edit_id"
                                value={editData.id}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditData('id', e.target.value)}
                            />
                            {editErrors.id && <p className="text-sm text-red-500">{editErrors.id}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit_grade_level">Grade Level</Label>
                            <Select 
                                value={editData.grade_level} 
                                onValueChange={(val) => setEditData('grade_level', val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Grade Level" />
                                </SelectTrigger>
                                <SelectContent>
                                    {gradeLevels.map((level) => (
                                        <SelectItem key={level} value={level}>{level}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {editErrors.grade_level && <p className="text-sm text-red-500">{editErrors.grade_level}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit_class_name">Class Name</Label>
                            <Input
                                id="edit_class_name"
                                value={editData.class_name}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditData('class_name', e.target.value)}
                            />
                            {editErrors.class_name && <p className="text-sm text-red-500">{editErrors.class_name}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit_major">Major</Label>
                            <Select 
                                value={editData.major} 
                                onValueChange={(val) => setEditData('major', val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Major" />
                                </SelectTrigger>
                                <SelectContent>
                                    {majors.map((major) => (
                                        <SelectItem key={major} value={major}>{major}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {editErrors.major && <p className="text-sm text-red-500">{editErrors.major}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit_master_classroom_teacher_id">Homeroom Teacher</Label>
                            <Select 
                                value={editData.master_classroom_teacher_id || 'none'} 
                                onValueChange={(val) => setEditData('master_classroom_teacher_id', val === 'none' ? '' : val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Homeroom Teacher" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    {teachers.map(teacher => (
                                        <SelectItem key={teacher.id} value={teacher.id}>{teacher.teacher_name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {editErrors.master_classroom_teacher_id && <p className="text-sm text-red-500">{editErrors.master_classroom_teacher_id}</p>}
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

ClassIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Classes',
            href: '/classes',
        },
    ],
};
