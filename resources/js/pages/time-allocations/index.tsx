import { Head } from '@inertiajs/react';
import { dashboard } from '@/routes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, Upload, Download } from 'lucide-react';
import { CreateModal } from './components/create-modal';
import { UpdateModal } from './components/update-modal';
import { DeleteModal } from './components/delete-modal';
import { DeleteBatchModal } from './components/delete-batch-modal';
import { CreateBatchTimeAllocationModal } from './components/create-batch-time-allocation-modal';

export interface MasterDay {
    id: string;
    day_name: string;
}

export interface MasterTimeAllocation {
    id: string;
    name: string;
    type: string;
    period_number: number | null;
    start_time: string;
    end_time: string;
    description: string | null;
    master_days?: MasterDay[];
}

export default function TimeAllocationIndex({ allocations, days }: { allocations: MasterTimeAllocation[], days: MasterDay[] }) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [editAllocation, setEditAllocation] = useState<MasterTimeAllocation | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [deleteAllocation, setDeleteAllocation] = useState<MasterTimeAllocation | null>(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isDeleteBatchOpen, setIsDeleteBatchOpen] = useState(false);

    // Group allocations by day
    const dayOrder = ['DAY-SENIN', 'DAY-SELASA', 'DAY-RABU', 'DAY-KAMIS', 'DAY-JUMAT', 'DAY-SABTU', 'DAY-MINGGU'];
    const groupedAllocations = allocations.reduce((acc, alloc) => {
        if (alloc.master_days) {
            alloc.master_days.forEach(day => {
                if (!acc[day.id]) {
                    acc[day.id] = [];
                }
                // avoid duplicate push if same object somehow
                if (!acc[day.id].find(a => a.id === alloc.id)) {
                    acc[day.id].push(alloc);
                }
            });
        }
        return acc;
    }, {} as Record<string, MasterTimeAllocation[]>);

    const sortedDayKeys = Object.keys(groupedAllocations).sort((a, b) => {
        return dayOrder.indexOf(a) - dayOrder.indexOf(b);
    });

    Object.keys(groupedAllocations).forEach(key => {
        groupedAllocations[key].sort((a, b) => a.start_time.localeCompare(b.start_time));
    });

    const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>(() => {
        const initial: Record<string, boolean> = {};
        sortedDayKeys.forEach(key => {
            initial[key] = true;
        });
        return initial;
    });

    const toggleDay = (dayId: string) => {
        setExpandedDays(prev => ({ ...prev, [dayId]: !prev[dayId] }));
    };

    const openEdit = (allocation: MasterTimeAllocation) => {
        setEditAllocation(allocation);
        setIsEditOpen(true);
    };

    const openDelete = (allocation: MasterTimeAllocation) => {
        setDeleteAllocation(allocation);
        setIsDeleteOpen(true);
    };

    const formatType = (type: string) => {
        switch (type) {
            case 'period': return 'Pelajaran';
            case 'break': return 'Istirahat';
            case 'ceremony': return 'Upacara';
            default: return type;
        }
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            // Because one allocation can be in multiple days, we use unique ids
            const uniqueIds = Array.from(new Set(allocations.map(a => a.id)));
            setSelectedIds(uniqueIds);
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectDay = (dayId: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const dayAllocIds = groupedAllocations[dayId].map(a => a.id);
        if (e.target.checked) {
            setSelectedIds(prev => Array.from(new Set([...prev, ...dayAllocIds])));
        } else {
            setSelectedIds(prev => prev.filter(id => !dayAllocIds.includes(id)));
        }
    };

    const handleSelect = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(prev => Array.from(new Set([...prev, id])));
        } else {
            setSelectedIds(prev => prev.filter(i => i !== id));
        }
    };

    const allSelected = allocations.length > 0 && selectedIds.length === new Set(allocations.map(a => a.id)).size;

    return (
        <>
            <Head title="Alokasi Waktu" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 lg:p-8">
                <div className="flex items-center justify-between space-y-2">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Alokasi Waktu</h2>
                        <p className="text-muted-foreground">
                            Kelola jadwal per hari (Jam Pelajaran, Istirahat, Upacara).
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {selectedIds.length > 0 && (
                            <Button variant="destructive" onClick={() => setIsDeleteBatchOpen(true)}>
                                Hapus Terpilih ({selectedIds.length})
                            </Button>
                        )}
                        <a href="/time-allocations/export">
                            <Button variant="outline" className="gap-2">
                                <Download className="h-4 w-4" />
                                <span className="hidden sm:inline">Export Batch</span>
                            </Button>
                        </a>
                        <Button variant="outline" onClick={() => setIsImportOpen(true)} className="gap-2">
                            <Upload className="h-4 w-4" />
                            <span className="hidden sm:inline">Import Batch</span>
                        </Button>
                        <Button onClick={() => setIsCreateOpen(true)}>Tambah Waktu</Button>
                    </div>
                </div>

                {/* Mobile View - Cards grouped by day */}
                <div className="flex flex-col gap-4 md:hidden">
                    {sortedDayKeys.length === 0 && (
                        <div className="text-center p-4 text-muted-foreground border rounded-xl bg-card">
                            Tidak ada data alokasi waktu.
                        </div>
                    )}
                    
                    {sortedDayKeys.map(dayId => {
                        const isExpanded = expandedDays[dayId];
                        const allocationsForDay = groupedAllocations[dayId];
                        const dayName = days.find(d => d.id === dayId)?.day_name || dayId;
                        const sessionCount = allocationsForDay.length;

                        return (
                            <div key={`mobile_${dayId}`} className="border rounded-xl bg-card overflow-hidden">
                                <div 
                                    className="p-4 bg-muted/30 flex items-center justify-between transition-colors"
                                >
                                    <div className="flex items-center gap-2 font-semibold text-primary">
                                        <input 
                                            type="checkbox" 
                                            className="w-4 h-4 rounded border-gray-300 mr-2"
                                            checked={allocationsForDay.length > 0 && allocationsForDay.every(a => selectedIds.includes(a.id))}
                                            onChange={(e) => handleSelectDay(dayId, e)}
                                        />
                                        <div onClick={() => toggleDay(dayId)} className="flex items-center cursor-pointer">
                                            {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                                            <span className="text-lg">{dayName}</span>
                                        </div>
                                    </div>
                                    <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded-full">
                                        {sessionCount} Sesi
                                    </span>
                                </div>
                                
                                {isExpanded && (
                                    <div className="p-3 flex flex-col gap-3 bg-background">
                                        {allocationsForDay.map((alloc) => (
                                            <Card key={`mobile_card_${alloc.id}`} className="shadow-sm">
                                                <CardContent className="p-4 flex flex-col gap-2">
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex items-center gap-3">
                                                            <input 
                                                                type="checkbox" 
                                                                className="w-4 h-4 rounded border-gray-300"
                                                                checked={selectedIds.includes(alloc.id)}
                                                                onChange={(e) => handleSelect(alloc.id, e)}
                                                            />
                                                            <span className="font-semibold text-base leading-tight">{alloc.name}</span>
                                                        </div>
                                                        <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider ${alloc.type === 'period' ? 'bg-blue-100 text-blue-800' : alloc.type === 'break' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                                                            {formatType(alloc.type)}
                                                        </span>
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-2 gap-2 text-sm mt-1">
                                                        <div className="flex flex-col">
                                                            <span className="text-muted-foreground text-xs">Waktu</span>
                                                            <span className="font-medium">{alloc.start_time.substring(0, 5)} - {alloc.end_time.substring(0, 5)}</span>
                                                        </div>
                                                        {alloc.type === 'period' && (
                                                            <div className="flex flex-col">
                                                                <span className="text-muted-foreground text-xs">JP Ke-</span>
                                                                <span className="font-medium">{alloc.period_number || '-'}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    {alloc.description && (
                                                        <div className="mt-1 text-sm text-muted-foreground line-clamp-2 bg-muted/50 p-2 rounded-md">
                                                            {alloc.description}
                                                        </div>
                                                    )}
                                                </CardContent>
                                                <CardFooter className="p-3 pt-0 flex gap-2 justify-end border-t border-border/50 mt-2">
                                                    <Button variant="outline" size="sm" onClick={() => openEdit(alloc)} className="h-8 text-xs">Edit</Button>
                                                    <Button variant="destructive" size="sm" onClick={() => openDelete(alloc)} className="h-8 text-xs">Hapus</Button>
                                                </CardFooter>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Desktop View - Table */}
                <div className="hidden rounded-md border md:block overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="border-b bg-muted/50">
                            <tr className="text-left">
                                <th className="p-4 w-12 text-center">
                                    <input 
                                        type="checkbox" 
                                        className="w-4 h-4 rounded border-gray-300"
                                        checked={allSelected && allocations.length > 0}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                                <th className="p-4 font-medium w-48">Hari</th>
                                <th className="p-4 font-medium">Nama Jadwal</th>
                                <th className="p-4 font-medium">Tipe</th>
                                <th className="p-4 font-medium">JP Ke-</th>
                                <th className="p-4 font-medium">Waktu</th>
                                <th className="p-4 font-medium">Deskripsi</th>
                                <th className="p-4 font-medium text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedDayKeys.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="p-8 text-center text-muted-foreground bg-background">
                                        Tidak ada data alokasi waktu.
                                    </td>
                                </tr>
                            )}
                            
                            {sortedDayKeys.map(dayId => {
                                const isExpanded = expandedDays[dayId];
                                const allocationsForDay = groupedAllocations[dayId];
                                const dayName = days.find(d => d.id === dayId)?.day_name || dayId;
                                const sessionCount = allocationsForDay.length;

                                return (
                                    <React.Fragment key={dayId}>
                                        <tr 
                                            className="border-b bg-muted/20 transition-colors"
                                        >
                                            <td className="p-3 text-center">
                                                <input 
                                                    type="checkbox" 
                                                    className="w-4 h-4 rounded border-gray-300"
                                                    checked={allocationsForDay.length > 0 && allocationsForDay.every(a => selectedIds.includes(a.id))}
                                                    onChange={(e) => handleSelectDay(dayId, e)}
                                                />
                                            </td>
                                            <td colSpan={7} className="p-3">
                                                <div 
                                                    className="flex items-center gap-2 font-semibold text-primary cursor-pointer w-fit"
                                                    onClick={() => toggleDay(dayId)}
                                                >
                                                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                                    {dayName}
                                                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                                                        ({sessionCount} Sesi)
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                        {isExpanded && allocationsForDay.map((alloc) => (
                                            <tr key={alloc.id} className="border-b transition-colors bg-background hover:bg-muted/10 last:border-b-0">
                                                <td className="p-4 text-center">
                                                    <input 
                                                        type="checkbox" 
                                                        className="w-4 h-4 rounded border-gray-300 relative z-10"
                                                        checked={selectedIds.includes(alloc.id)}
                                                        onChange={(e) => handleSelect(alloc.id, e)}
                                                    />
                                                </td>
                                                <td className="p-4 pl-10 text-muted-foreground relative">
                                                    {/* Visual tree line indicator */}
                                                    <div className="absolute left-5 top-0 bottom-0 w-px bg-border"></div>
                                                    <div className="absolute left-5 top-1/2 w-3 h-px bg-border"></div>
                                                </td>
                                                <td className="p-4 font-medium">{alloc.name}</td>
                                                <td className="p-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${alloc.type === 'period' ? 'bg-blue-100 text-blue-800' : alloc.type === 'break' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                                                        {formatType(alloc.type)}
                                                    </span>
                                                </td>
                                                <td className="p-4">{alloc.period_number || '-'}</td>
                                                <td className="p-4 whitespace-nowrap">{alloc.start_time.substring(0, 5)} - {alloc.end_time.substring(0, 5)}</td>
                                                <td className="p-4">{alloc.description || '-'}</td>
                                                <td className="p-4 text-right space-x-2 whitespace-nowrap">
                                                    <Button variant="outline" size="sm" onClick={() => openEdit(alloc)}>Edit</Button>
                                                    <Button variant="destructive" size="sm" onClick={() => openDelete(alloc)}>Hapus</Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <CreateBatchTimeAllocationModal isOpen={isImportOpen} setIsOpen={setIsImportOpen} />

            <CreateModal isOpen={isCreateOpen} setIsOpen={setIsCreateOpen} days={days} />
            
            <UpdateModal isOpen={isEditOpen} setIsOpen={setIsEditOpen} allocation={editAllocation} days={days} />
            <DeleteModal isOpen={isDeleteOpen} setIsOpen={setIsDeleteOpen} allocation={deleteAllocation} />

            <DeleteBatchModal 
                isOpen={isDeleteBatchOpen} 
                setIsOpen={setIsDeleteBatchOpen} 
                selectedIds={selectedIds} 
                onSuccess={() => setSelectedIds([])}
            />
        </>
    );
}

TimeAllocationIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Alokasi Waktu',
        },
    ],
};
