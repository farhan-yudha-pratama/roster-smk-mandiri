import { Head } from '@inertiajs/react';
import { dashboard } from '@/routes';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusIcon, PencilIcon, TrashIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CreateModal } from './components/create-modal';
import { UpdateModal } from './components/update-modal';
import { DeleteModal } from './components/delete-modal';

interface Role {
    id: number;
    name: string;
}

interface User {
    id: string;
    name: string;
    email: string;
    roles: Role[];
}

export default function UsersIndex({ users, roles }: { users: User[], roles: Role[] }) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isUpdateOpen, setIsUpdateOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const openUpdateModal = (user: User) => {
        setSelectedUser(user);
        setIsUpdateOpen(true);
    };

    const openDeleteModal = (user: User) => {
        setSelectedUser(user);
        setIsDeleteOpen(true);
    };

    return (
        <>
            <Head title="Manajemen User" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 lg:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Manajemen User</h2>
                        <p className="text-muted-foreground">
                            Kelola data user dan hak akses (Role).
                        </p>
                    </div>
                    <div>
                        <Button className="w-full sm:w-auto" onClick={() => setIsCreateOpen(true)}>
                            <PlusIcon className="mr-2 h-4 w-4" />
                            Tambah User
                        </Button>
                    </div>
                </div>

                {/* Mobile View: Cards */}
                <div className="grid grid-cols-1 gap-4 md:hidden">
                    {users.map((user) => {
                        const userRole = user.roles?.[0];

                        return (
                            <Card key={user.id}>
                                <CardHeader className="pb-2">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-lg">{user.name}</CardTitle>
                                            <CardDescription className="mt-1">{user.email}</CardDescription>
                                        </div>
                                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-transparent bg-primary text-primary-foreground">
                                            {userRole?.name || 'Belum Ada'}
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex justify-end gap-2 mt-2">
                                        <Button variant="outline" size="sm" onClick={() => openUpdateModal(user)}>
                                            <PencilIcon className="h-4 w-4 mr-1" /> Edit
                                        </Button>
                                        <Button variant="destructive" size="sm" onClick={() => openDeleteModal(user)}>
                                            <TrashIcon className="h-4 w-4 mr-1" /> Hapus
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                    
                    {users.length === 0 && (
                        <div className="text-center p-4 text-muted-foreground border rounded-md">
                            Tidak ada data user.
                        </div>
                    )}
                </div>

                {/* Desktop View: Table */}
                <div className="hidden md:block rounded-md border bg-card">
                    <table className="w-full text-sm">
                        <thead className="border-b bg-muted/50">
                            <tr className="text-left">
                                <th className="p-4 font-medium">Nama</th>
                                <th className="p-4 font-medium">Email</th>
                                <th className="p-4 font-medium">Role</th>
                                <th className="p-4 font-medium text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => {
                                const userRole = user.roles?.[0];

                                return (
                                    <tr key={user.id} className="border-b transition-colors hover:bg-muted/50">
                                        <td className="p-4 font-medium">{user.name}</td>
                                        <td className="p-4">{user.email}</td>
                                        <td className="p-4">
                                            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground">
                                                {userRole?.name || 'Belum Ada'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="outline" size="sm" onClick={() => openUpdateModal(user)}>
                                                    <PencilIcon className="h-4 w-4" />
                                                </Button>
                                                <Button variant="destructive" size="sm" onClick={() => openDeleteModal(user)}>
                                                    <TrashIcon className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-4 text-center text-muted-foreground">
                                        Tidak ada data user.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <CreateModal 
                isOpen={isCreateOpen} 
                onClose={() => setIsCreateOpen(false)} 
                roles={roles} 
            />

            <UpdateModal 
                isOpen={isUpdateOpen} 
                onClose={() => {
                    setIsUpdateOpen(false);
                    setTimeout(() => setSelectedUser(null), 300);
                }} 
                user={selectedUser} 
                roles={roles} 
            />

            <DeleteModal 
                isOpen={isDeleteOpen} 
                onClose={() => {
                    setIsDeleteOpen(false);
                    setTimeout(() => setSelectedUser(null), 300);
                }} 
                user={selectedUser} 
            />
        </>
    );
}

UsersIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Manajemen User',
            href: '/users',
        },
    ],
};

