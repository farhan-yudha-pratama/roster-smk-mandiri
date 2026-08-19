import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';

interface User {
    id: string;
    name: string;
}

interface CreateModalProps {
    isOpen: boolean;
    onClose: () => void;
    users: User[];
}

export function CreateModal({ isOpen, onClose, users }: CreateModalProps) {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        id: '',
        teacher_name: '',
        user_id: '',
    });

    const handleClose = () => {
        reset();
        clearErrors();
        onClose();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/homeroom-teachers', {
            onSuccess: () => {
                toast.success('Data guru berhasil ditambahkan.');
                handleClose();
            },
            onError: () => {
                toast.error('Gagal menambahkan data guru.');
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="w-[95vw] max-w-md sm:w-full">
                <DialogHeader>
                    <DialogTitle className="text-base sm:text-lg">Tambah Guru</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                    <div className="space-y-1 sm:space-y-2">
                        <Label htmlFor="id" className="text-xs sm:text-sm">ID Guru (NIP/NIK)</Label>
                        <Input 
                            id="id" 
                            className="text-xs sm:text-sm h-8 sm:h-10"
                            value={data.id} 
                            onChange={(e) => setData('id', e.target.value)} 
                            placeholder="Contoh: 198001012010011001" 
                        />
                        {errors.id && <p className="text-[10px] sm:text-sm text-red-500">{errors.id}</p>}
                    </div>
                    <div className="space-y-1 sm:space-y-2">
                        <Label htmlFor="teacher_name" className="text-xs sm:text-sm">Nama Guru</Label>
                        <Input 
                            id="teacher_name" 
                            className="text-xs sm:text-sm h-8 sm:h-10"
                            value={data.teacher_name} 
                            onChange={(e) => setData('teacher_name', e.target.value)} 
                            placeholder="Contoh: Budi Santoso, S.Pd." 
                        />
                        {errors.teacher_name && <p className="text-[10px] sm:text-sm text-red-500">{errors.teacher_name}</p>}
                    </div>
                    <div className="space-y-1 sm:space-y-2">
                        <Label htmlFor="user_id" className="text-xs sm:text-sm">Tautkan Akun Pengguna</Label>
                        <Select 
                            value={data.user_id || 'none'} 
                            onValueChange={(val) => setData('user_id', val === 'none' ? '' : val)}
                        >
                            <SelectTrigger className="text-xs sm:text-sm h-8 sm:h-10">
                                <SelectValue placeholder="Pilih Akun" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none" className="text-xs sm:text-sm">Tidak Ada (Tanpa Akun)</SelectItem>
                                {users.map(user => (
                                    <SelectItem key={user.id} value={user.id} className="text-xs sm:text-sm">
                                        {user.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.user_id && <p className="text-[10px] sm:text-sm text-red-500">{errors.user_id}</p>}
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
