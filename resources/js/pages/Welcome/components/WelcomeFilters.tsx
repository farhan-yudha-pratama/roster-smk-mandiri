import { Search, RotateCcw, CalendarDays, Filter, SlidersHorizontal } from 'lucide-react';
import { router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

export function WelcomeFilters({ filters }: { filters: any }) {
    const [search, setSearch] = useState(filters.search || '');
    const [sheetOpen, setSheetOpen] = useState(false);

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (search !== filters.search) {
                applyFilter('search', search);
            }
        }, 500);
        return () => clearTimeout(timeout);
    }, [search]);

    const applyFilter = (key: string, value: string) => {
        router.get('/', { ...filters, [key]: value }, { preserveState: true, replace: true });
    };

    const resetFilters = () => {
        router.get('/', {}, { preserveState: true, replace: true });
        setSearch('');
    };

    const days = [
        { value: 'all', label: 'Semua Hari' },
        { value: 'Senin', label: 'Senin' },
        { value: 'Selasa', label: 'Selasa' },
        { value: 'Rabu', label: 'Rabu' },
        { value: 'Kamis', label: 'Kamis' },
        { value: 'Jumat', label: 'Jumat' },
    ];

    const weekCycles = [
        { value: 'all', label: 'Semua Siklus' },
        { value: 'GANJIL', label: 'Ganjil' },
        { value: 'GENAP', label: 'Genap' },
    ];

    const gradeLevels = [
        { value: 'all', label: 'Semua Tingkat' },
        { value: 'X', label: 'Kelas X' },
        { value: 'XI', label: 'Kelas XI' },
        { value: 'XII', label: 'Kelas XII' },
    ];

    const filterContent = (
        <div className="space-y-6">
            {/* Top Row: Search, Major, Reset */}
            <div className="flex flex-col md:flex-row gap-4 md:items-end">
                <div className="flex-1 w-full relative">
                    <label className="block text-[11px] font-bold text-muted-foreground mb-2 uppercase tracking-wider">Cari Jadwal</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                        <Input 
                            className="pl-9 h-11 w-full bg-background/50 focus:bg-background transition-colors"
                            placeholder="Cari guru, ruangan, atau mapel..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="w-full md:w-[280px]">
                    <label className="block text-[11px] font-bold text-muted-foreground mb-2 uppercase tracking-wider">Jurusan</label>
                    <Select value={filters.major} onValueChange={(val) => applyFilter('major', val)}>
                        <SelectTrigger className="h-11 bg-background/50 focus:bg-background transition-colors">
                            <SelectValue placeholder="Semua Jurusan" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Jurusan</SelectItem>
                            <SelectItem value="TKR">TKR</SelectItem>
                            <SelectItem value="TSM">TSM</SelectItem>
                            <SelectItem value="TBKR">TBKR</SelectItem>
                            <SelectItem value="TKJ">TKJ</SelectItem>
                            <SelectItem value="RPL">RPL</SelectItem>
                            <SelectItem value="TJK-TELEKOMUNIKASI">TJK Telekomunikasi</SelectItem>
                            <SelectItem value="PPL-GIM">PPL GIM</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <Button 
                    variant="outline" 
                    className="h-11 px-6 w-full md:w-auto text-muted-foreground hover:text-foreground border-dashed"
                    onClick={resetFilters}
                >
                    <RotateCcw size={16} className="mr-2" />
                    Reset
                </Button>
            </div>

            {/* Bottom Row: Pill Filters for Day, Cycle, Grade */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6 border-t border-border/60">
                
                {/* Hari */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                        <CalendarDays size={14} />
                        <span>Filter Hari</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {days.map(d => (
                            <button
                                key={d.value}
                                onClick={() => applyFilter('day', d.value)}
                                className={`px-4 py-1.5 text-[13px] font-medium rounded-full transition-all duration-200 ${
                                    filters.day === d.value 
                                    ? 'bg-primary text-primary-foreground shadow-md ring-2 ring-primary/20 ring-offset-2 ring-offset-background' 
                                    : 'bg-secondary/50 text-secondary-foreground hover:bg-secondary/80 border border-border/50'
                                }`}
                            >
                                {d.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tingkat Kelas */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                        <Filter size={14} />
                        <span>Tingkat Kelas</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {gradeLevels.map(g => (
                            <button
                                key={g.value}
                                onClick={() => applyFilter('grade_level', g.value)}
                                className={`px-4 py-1.5 text-[13px] font-medium rounded-full transition-all duration-200 ${
                                    filters.grade_level === g.value 
                                    ? 'bg-primary text-primary-foreground shadow-md ring-2 ring-primary/20 ring-offset-2 ring-offset-background' 
                                    : 'bg-secondary/50 text-secondary-foreground hover:bg-secondary/80 border border-border/50'
                                }`}
                            >
                                {g.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Siklus Minggu */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                        <RotateCcw size={14} />
                        <span>Siklus Minggu</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {weekCycles.map(c => (
                            <button
                                key={c.value}
                                onClick={() => applyFilter('week_cycle', c.value)}
                                className={`px-4 py-1.5 text-[13px] font-medium rounded-full transition-all duration-200 ${
                                    filters.week_cycle === c.value 
                                    ? 'bg-primary text-primary-foreground shadow-md ring-2 ring-primary/20 ring-offset-2 ring-offset-background' 
                                    : 'bg-secondary/50 text-secondary-foreground hover:bg-secondary/80 border border-border/50'
                                }`}
                            >
                                {c.label}
                            </button>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );

    return (
        <div className="mb-10">
            {/* Desktop View: Inline */}
            <div className="hidden lg:block bg-card border border-border shadow-sm rounded-xl p-6">
                {filterContent}
            </div>

            {/* Mobile View: Bottom Sheet / Pop-up */}
            <div className="block lg:hidden">
                <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                    <SheetTrigger asChild>
                        <Button variant="outline" className="w-full flex items-center justify-center gap-2 h-14 shadow-sm border-dashed rounded-xl bg-card">
                            <SlidersHorizontal size={18} />
                            <span className="font-semibold text-sm">Pencarian & Filter Jadwal</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="h-[90vh] overflow-y-auto rounded-t-3xl px-6 pb-12 pt-6">
                        <SheetHeader className="mb-6">
                            <SheetTitle className="text-left text-xl font-bold">Pencarian & Filter</SheetTitle>
                        </SheetHeader>
                        {filterContent}
                        
                        {/* A button to close the sheet after picking on mobile */}
                        <div className="mt-8 pt-6 border-t border-border">
                            <Button className="w-full h-12 rounded-xl font-bold" onClick={() => setSheetOpen(false)}>
                                Terapkan & Tutup
                            </Button>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </div>
    );
}
