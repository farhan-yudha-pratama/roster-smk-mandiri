import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, Upload } from 'lucide-react';

interface CreateBatchSubjectModalProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

export function CreateBatchSubjectModal({ isOpen, setIsOpen }: CreateBatchSubjectModalProps) {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm<{
        file: File | null;
    }>({
        file: null,
    });

    const handleClose = () => {
        setIsOpen(false);
        reset();
        clearErrors();
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/subjects/import', {
            onSuccess: () => {
                handleClose();
            },
        });
    };

    const handleDownloadTemplate = () => {
        window.location.href = '/subjects/template';
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="w-[95vw] max-w-md rounded-xl p-4 sm:p-6 overflow-hidden">
                <form onSubmit={submit} className="flex flex-col gap-6">
                    <DialogHeader className="text-left space-y-2">
                        <DialogTitle className="text-xl font-semibold">Import Mata Pelajaran</DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
                            Tambahkan data mata pelajaran secara massal menggunakan file Excel (.xlsx).
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="flex flex-col gap-6">
                        {/* Download Template Section */}
                        <div className="flex flex-col gap-3 p-4 bg-muted/30 rounded-xl border border-border/50">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary mt-0.5">
                                    <Download className="h-4 w-4" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-medium">Langkah 1: Unduh Template</h4>
                                    <p className="text-xs text-muted-foreground mt-1 mb-3">
                                        Gunakan format tabel yang telah disediakan agar data dapat diproses.
                                    </p>
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        size="sm"
                                        className="w-full bg-background hover:bg-muted/80 transition-colors shadow-sm" 
                                        onClick={handleDownloadTemplate}
                                    >
                                        Unduh File Excel
                                    </Button>
                                </div>
                            </div>
                        </div>
                        
                        {/* Upload Section */}
                        <div className="flex flex-col gap-3 p-4 bg-muted/30 rounded-xl border border-border/50">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary mt-0.5">
                                    <Upload className="h-4 w-4" />
                                </div>
                                <div className="flex-1 w-full overflow-hidden">
                                    <h4 className="text-sm font-medium">Langkah 2: Unggah Data</h4>
                                    <p className="text-xs text-muted-foreground mt-1 mb-3">
                                        Pilih file Excel yang telah Anda lengkapi datanya.
                                    </p>
                                    <div className="flex flex-col gap-2 w-full">
                                        <Input
                                            id="file"
                                            type="file"
                                            accept=".xlsx, .xls, .csv"
                                            onChange={(e) => setData('file', e.target.files ? e.target.files[0] : null)}
                                            className="cursor-pointer h-9 text-xs file:cursor-pointer file:bg-primary/10 file:text-primary file:border-0 file:rounded-md file:px-3 file:py-1 file:mr-3 file:hover:bg-primary/20 transition-colors w-full"
                                            required
                                        />
                                        {errors.file && <p className="text-xs text-destructive animate-in fade-in">{errors.file}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <DialogFooter className="gap-2 sm:gap-0 mt-2">
                        <Button type="button" variant="ghost" onClick={handleClose} className="w-full sm:w-auto">
                            Batal
                        </Button>
                        <Button type="submit" disabled={processing || !data.file} className="w-full sm:w-auto gap-2 shadow-sm">
                            {processing ? (
                                <span className="animate-pulse">Mengimpor...</span>
                            ) : (
                                <>
                                    <Upload className="h-4 w-4" />
                                    Mulai Import
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
