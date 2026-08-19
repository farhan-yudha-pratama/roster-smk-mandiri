import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';
import { useEffect } from 'react';

interface User {
    id: string;
    name: string;
    email: string;
    roles: { id: number; name: string }[];
}

interface UpdateModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    roles: { id: number; name: string }[];
}

export function UpdateModal({ isOpen, onClose, user, roles }: UpdateModalProps) {
    const { data, setData, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        email: '',
        password: '',
        role_id: ''
    });

    useEffect(() => {
        if (user) {
            setData({
                name: user.name,
                email: user.email,
                password: '',
                role_id: user.roles?.[0]?.id?.toString() || ''
            });
        }
    }, [user]);

    const handleClose = () => {
        reset();
        clearErrors();
        onClose();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        
        put(`/users/${user.id}`, {
            onSuccess: () => {
                toast.success('User berhasil diperbarui.');
                handleClose();
            },
            onError: () => {
                toast.error('Gagal memperbarui user.');
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="w-[95vw] max-w-md sm:w-full">
                <DialogHeader>
                    <DialogTitle className="text-base sm:text-lg">Edit User</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                    <div className="space-y-1 sm:space-y-2">
                        <Label htmlFor="edit-name" className="text-xs sm:text-sm">Nama</Label>
                        <Input 
                            id="edit-name" 
                            className="text-xs sm:text-sm h-8 sm:h-10"
                            value={data.name} 
                            onChange={(e) => setData('name', e.target.value)} 
                            placeholder="Nama Lengkap" 
                        />
                        {errors.name && <p className="text-[10px] sm:text-sm text-red-500">{errors.name}</p>}
                    </div>
                    <div className="space-y-1 sm:space-y-2">
                        <Label htmlFor="edit-email" className="text-xs sm:text-sm">Email</Label>
                        <Input 
                            id="edit-email" 
                            type="email" 
                            className="text-xs sm:text-sm h-8 sm:h-10"
                            value={data.email} 
                            onChange={(e) => setData('email', e.target.value)} 
                            placeholder="email@example.com" 
                        />
                        {errors.email && <p className="text-[10px] sm:text-sm text-red-500">{errors.email}</p>}
                    </div>
                    <div className="space-y-1 sm:space-y-2">
                        <Label htmlFor="edit-password" className="text-xs sm:text-sm">Password Baru (Opsional)</Label>
                        <Input 
                            id="edit-password" 
                            type="password" 
                            className="text-xs sm:text-sm h-8 sm:h-10"
                            value={data.password} 
                            onChange={(e) => setData('password', e.target.value)} 
                            placeholder="Biarkan kosong jika tidak diubah" 
                        />
                        {errors.password && <p className="text-[10px] sm:text-sm text-red-500">{errors.password}</p>}
                    </div>
                    <div className="space-y-1 sm:space-y-2">
                        <Label htmlFor="edit-role" className="text-xs sm:text-sm">Role</Label>
                        <Select value={data.role_id} onValueChange={(val) => setData('role_id', val)}>
                            <SelectTrigger className="text-xs sm:text-sm h-8 sm:h-10">
                                <SelectValue placeholder="Pilih Role" />
                            </SelectTrigger>
                            <SelectContent>
                                {roles.map(role => (
                                    <SelectItem key={role.id} value={role.id.toString()} className="text-xs sm:text-sm">
                                        {role.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.role_id && <p className="text-[10px] sm:text-sm text-red-500">{errors.role_id}</p>}
                    </div>
                    <DialogFooter className="mt-4">
                        <Button type="button" variant="outline" size="sm" className="text-xs sm:text-sm h-8 sm:h-10" onClick={handleClose}>Batal</Button>
                        <Button type="submit" size="sm" className="text-xs sm:text-sm h-8 sm:h-10" disabled={processing}>Simpan</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
