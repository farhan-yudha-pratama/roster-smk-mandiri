import { LayoutGrid, Info, Search, UserCircle } from 'lucide-react';

export function BottomNav() {
    return (
        <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-safe h-16 bg-background/80 backdrop-blur-md border-t border-border shadow-sm">
            <a className="flex flex-col items-center justify-center text-primary border-t-2 border-primary pt-1" href="/">
                <LayoutGrid size={24} />
                <span className="text-[12px] font-medium mt-1">Schedule</span>
            </a>
            <a className="flex flex-col items-center justify-center text-muted-foreground hover:text-foreground pt-1 transition-colors" href="/informasi-jadwal">
                <Info size={24} />
                <span className="text-[12px] font-medium mt-1">Info</span>
            </a>
            <a className="flex flex-col items-center justify-center text-muted-foreground hover:text-foreground pt-1 transition-colors" href="#">
                <Search size={24} />
                <span className="text-[12px] font-medium mt-1">Search</span>
            </a>
            <a className="flex flex-col items-center justify-center text-muted-foreground hover:text-foreground pt-1 transition-colors" href="#">
                <UserCircle size={24} />
                <span className="text-[12px] font-medium mt-1">Profile</span>
            </a>
        </nav>
    );
}
