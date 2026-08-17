import { Head, router } from '@inertiajs/react';
import { dashboard } from '@/routes';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { toast } from 'sonner';

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
    const handleRoleChange = (userId: string, roleId: string) => {
        router.post(`/users/${userId}/role`, { role_id: roleId }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Role updated successfully.');
            },
            onError: (errors) => {
                toast.error(errors.role_id || 'Failed to update role.');
            }
        });
    };

    return (
        <>
            <Head title="Users Management" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 lg:p-8">
                <div className="flex items-center justify-between space-y-2">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Users Management</h2>
                        <p className="text-muted-foreground">
                            Manage user roles for GURU and TEKNISI.
                        </p>
                    </div>
                </div>

                <div className="rounded-md border">
                    <table className="w-full text-sm">
                        <thead className="border-b bg-muted/50">
                            <tr className="text-left">
                                <th className="p-4 font-medium">Name</th>
                                <th className="p-4 font-medium">Email</th>
                                <th className="p-4 font-medium">Current Role</th>
                                <th className="p-4 font-medium">Update Role</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => {
                                const userRole = user.roles?.[0];
                                const isSuperadmin = userRole?.name === 'SUPERADMIN';

                                return (
                                    <tr key={user.id} className="border-b transition-colors hover:bg-muted/50">
                                        <td className="p-4 font-medium">{user.name}</td>
                                        <td className="p-4">{user.email}</td>
                                        <td className="p-4">
                                            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground">
                                                {userRole?.name || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            {isSuperadmin ? (
                                                <span className="text-muted-foreground text-xs italic">Cannot change superadmin</span>
                                            ) : (
                                                <div className="w-[180px]">
                                                    <Select
                                                        defaultValue={userRole?.id.toString()}
                                                        onValueChange={(val) => handleRoleChange(user.id, val)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select a role" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {roles.map((role) => (
                                                                <SelectItem key={role.id} value={role.id.toString()}>
                                                                    {role.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                            
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-4 text-center text-muted-foreground">
                                        No users found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
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
            title: 'Users Management',
            href: '/users',
        },
    ],
};
